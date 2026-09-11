# Profile privacy remediation design

Status: **design only — do not apply to production yet**

Related issue: #67

## Confirmed problem

The production `profiles` table has RLS enabled, but its current public-row SELECT policy applies to both `anon` and `authenticated`. Because the table itself contains `email`, `role`, onboarding/internal metadata and public profile fields together, row-level visibility does not create a field-level privacy boundary.

Read-only aggregate verification on 2026-09-11 confirmed that an authenticated role can select public profile rows that contain email. No personal profile values were read. Anonymous profile SELECT currently errors because the same policy calls `is_admin()` while `anon` lacks EXECUTE on that function.

The application UI already selects explicit display fields for member directory/profile views, but an authenticated client can bypass UI projections and query PostgREST directly. Therefore the database must enforce the field contract.

## Confirmed member-search exposure

Read-only inspection of production `public.search_afghan_hub(search_query, result_limit)` found an additional field-boundary problem:

- The function is `SECURITY INVOKER` and executable by both `authenticated` and `anon`.
- Its profile branch filters `p.is_public = true`, but does **not** require `p.onboarding_completed = true`.
- Profile result titles use `coalesce(p.display_name, p.email)`, so a visible profile with no display name can return the profile email as a search result title.
- The application search page consumes the RPC result directly and therefore cannot be considered a database privacy boundary.
- Because the function is security-invoker, RLS still applies. The current broken anonymous profiles policy may cause anonymous profile search evaluation to fail rather than safely limit fields; this must not be treated as protection.

The search remediation must remove email from result construction and apply the same visibility/onboarding contract as member discovery. Direct RPC execution must be covered by persona tests.

## Existing application dependencies

Public/member-facing profile reads currently need fields such as:

- `id`
- `display_name`, `first_name`, `last_name`
- `avatar_url`, `headline`, `bio`
- `profession`, `company`
- `city`, `province_state`, `country`
- `languages`, `skills`
- `website_url`, `linkedin_url`
- `is_public`, `onboarding_completed`

Private/privileged profile uses include:

- Settings now reads account email from Auth (`user.email`) rather than `profiles.email` after preparatory hardening in #69.
- Dashboard layout reads the signed-in user's `role` and `onboarding_completed`.
- Admin moderation-team UI intentionally reads member `email`, `role`, onboarding state and creation time.
- Several connection/notification queries join `profiles` for safe identity/display fields.
- Member search uses `search_afghan_hub`, which must be migrated to the same safe profile contract rather than returning base-table private fallbacks.

A blanket table-SELECT revoke or a simple removal of `email`/`role` privileges would therefore risk breaking self/admin and relationship joins unless those flows are migrated deliberately.

## Existing authorization primitives

Read-only production metadata inspection confirmed:

- `public.is_admin()` is `SECURITY DEFINER`, has an explicit empty `search_path`, and is executable by `authenticated` but not `anon`.
- `public.set_profile_role(target_profile_id, target_role)` is `SECURITY DEFINER`, authenticated-only, calls `is_admin()` internally, rejects self-role changes, then updates the target profile. This means role mutation is enforced in the database rather than relying only on the admin UI.
- There is no equivalent dedicated moderator/capability function in the current database metadata reviewed. The dashboard currently reads the signed-in user's `role` to distinguish admin/moderator behavior.

Remediation should reuse the proven admin authorization primitive and introduce a narrowly scoped capability check for moderation if needed, rather than restoring broad row-level access to the `role` column.

## Recommended architecture

### 1. Define a safe member-profile contract

Create one database surface whose schema contains only fields intentionally visible to other members. It must exclude at least:

- `email`
- `role`
- internal timestamps unless product needs them
- internal onboarding/moderation metadata not required for display
- future private/contact fields by default

The preferred implementation is a dedicated **privacy-safe view or RPC** with an explicit column list. The implementation must preserve `is_public=true` and onboarding eligibility rules without exposing the base row's private columns.

### 2. Make the base `profiles` table private-by-default

After consumers are migrated to the safe surface, change direct base-table visibility so an ordinary unrelated authenticated member cannot SELECT another member's full profile row. Owner/self and admin flows must remain available through narrowly scoped policies/RPCs.

Do not rely on frontend `.select(...)` lists as an authorization mechanism.

### 3. Separate self/admin private reads

- **Self:** prefer Auth for account email (`user.email`) and use owner-scoped profile reads for editable profile state.
- **Role/capability checks:** reuse `is_admin()` for admin checks and prefer a narrow capability/RPC for moderator state rather than granting every authenticated user access to every row's `role` column.
- **Admin team:** expose a deliberately admin-only RPC/view for member email/role management. Authorization must be enforced in the database; the existing `set_profile_role` function already enforces admin-only mutation and self-role protection.

### 4. Fix search at the same boundary

Replace the profile branch of `search_afghan_hub` so it reads only the approved safe member fields, never uses email as a title/subtitle fallback, and requires the same visibility/onboarding conditions as directory/member detail discovery. If anonymous member search is not an approved product requirement, remove anonymous execution rather than relying on a failing RLS expression.

### 5. Fix the anonymous policy coherently

Do not solve the current anonymous `is_admin()` permission error by merely granting `anon` EXECUTE on `is_admin()`. If anonymous member profiles are not a launch requirement, keep anonymous profile access closed. If public member discovery is later approved, expose it only through the same explicit safe field contract.

## Required persona tests before production

In an isolated production-compatible database, prove all of the following with direct API/SQL-level checks, not only UI tests:

1. `anon` cannot retrieve private profile fields and cannot invoke privileged role/admin paths.
2. Unrelated `authenticated` member can retrieve only the approved safe fields for visible members.
3. Unrelated member cannot retrieve another profile's `email`, `role` or internal metadata even by requesting those columns directly.
4. A member with `is_public=false` is absent from discovery and cannot be fetched through the safe discovery surface by unrelated members.
5. A profile with incomplete onboarding is absent from directory/detail/search discovery where the product requires onboarding completion.
6. Direct `search_afghan_hub` calls never return email or private profile metadata and respect the approved visibility contract.
7. Owner can read/update their allowed self fields but cannot self-promote role.
8. Moderator receives only capabilities intended for moderators.
9. Admin can access the intentionally privileged moderation-team data and role-management path.
10. Connection/notification joins still return the safe display identity fields required by the UI.

## Migration safety

Production migration history and repository migration history are not currently a trustworthy one-to-one baseline. Production currently reports 45 applied migrations, including a July baseline absent from the repository and later same-name migrations whose applied timestamp versions differ from repository filenames. Therefore:

- Do not run `db push` against production.
- Do not repair migration history blindly.
- Do not replay the repository migration directory against production.
- First reconstruct/review the baseline and test the privacy migration in an isolated/staging database.
- Supabase development branches may carry cost; do not create one under the current zero-new-cost constraint without explicit approval.

## Suggested implementation sequence

1. Keep Settings account email sourced from Auth rather than `profiles.email` (completed in #69).
2. Inventory every `profiles` query/join and classify fields as self-private, admin-private or member-visible.
3. Add the safe profile database surface and database-level persona tests in a non-production environment.
4. Migrate `search_afghan_hub` and directory/member/connection/notification consumers to the safe surface where necessary.
5. Add self/admin-only access paths for private columns, reusing `is_admin()`/`set_profile_role` where appropriate and introducing only narrowly scoped additional capability functions.
6. Restrict base-table direct SELECT so an unrelated authenticated role cannot retrieve private columns/rows.
7. Re-run all application CI plus persona/security tests.
8. Only after explicit review, apply the production migration and repeat the read-only aggregate verification.

## Change-control gate

No production RLS, grants, function privileges or schema changes should be made from this document alone. Applying the remediation requires an explicit reviewed approval because it changes authorization behavior for production member data.
