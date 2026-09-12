# Profile privacy production snapshot — 2026-09-12

Status: **read-only evidence / rollback reference — do not execute as a migration**

Related: security issue #67, `profile-privacy-remediation.md`, `profile-privacy-remediation-draft.md`, and `profile-privacy-persona-tests.md`.

This snapshot records the current production metadata used to prepare a future isolated/staged remediation. It intentionally contains no member email, name, user ID, message content, or other personal value.

## Production target verified

Supabase project: **Afghan Hub Production** (`yussznmwjsvfvpabmwdc`, Canada Central).

No DDL, grant, RLS, function, Auth configuration, or production row was changed while collecting this evidence.

## Current `public.profiles` shape

RLS is enabled. Table owner is `postgres`.

Current columns, in order:

1. `id uuid`
2. `email text`
3. `first_name text`
4. `last_name text`
5. `display_name text`
6. `username text`
7. `avatar_url text`
8. `headline text`
9. `bio text`
10. `profession text`
11. `company text`
12. `city text`
13. `province_state text`
14. `country text`
15. `languages text[]`
16. `skills text[]`
17. `website_url text`
18. `linkedin_url text`
19. `opportunity_status profile_status`
20. `role user_role`
21. `is_public boolean`
22. `onboarding_completed boolean`
23. `created_at timestamptz`
24. `updated_at timestamptz`
25. `search_vector tsvector`

## Current table ACL

Current production relation ACL:

```text
postgres=arwdDxtm/postgres
anon=arwdDxtm/postgres
authenticated=arwdDxtm/postgres
service_role=arwdDxtm/postgres
```

This confirms the profile privacy issue overlaps security issue #80: the API roles currently hold broader PostgreSQL table privileges than the application requires. RLS limits ordinary row-level DML/SELECT paths, but table-level privilege reduction remains required as part of the reviewed least-privilege rollout.

## Current profile RLS policies

### `profiles_insert_self`

- command: `INSERT`
- role: `authenticated`
- check: profile `id = auth.uid()`

### `profiles_select_public_or_owner`

- command: `SELECT`
- roles: `anon`, `authenticated`
- condition:

```sql
is_public = true
or id = auth.uid()
or public.is_admin()
```

This is the policy that currently allows an authenticated user to receive another public profile row. Because the base table also contains `email`, `role`, timestamps and `search_vector`, RLS by itself does not provide a field-level privacy boundary.

### `profiles_update_self`

- command: `UPDATE`
- role: `authenticated`
- condition/check: profile `id = auth.uid()`

## Current profile triggers

The following non-internal triggers are present:

- `enforce_profile_role` — before insert/update, calls `enforce_profile_role()`
- `profiles_search_vector_trigger` — maintains search vector from public profile fields
- `profiles_set_updated_at` — before update, calls `set_updated_at()`

A future grant/policy migration must preserve these behaviors.

## Current function facts relevant to #67

### `public.is_admin()`

- `SECURITY DEFINER`
- empty `search_path`
- checks the current `auth.uid()` profile for `role = 'admin'`
- executable by `authenticated` and `service_role`, not `anon`

Do **not** make anonymous profile SELECT work by granting anon execute on this function.

### `public.search_afghan_hub(text, integer)`

Current production behavior still has the two known profile-search defects at the database layer:

- profile title falls back with `coalesce(display_name, email)`;
- profile search requires `is_public=true` but does not require `onboarding_completed=true`.

Application PR #72 guards rendering, but the RPC itself still needs the reviewed database rewrite before launch expansion.

### `public.set_profile_role(uuid, user_role)`

- `SECURITY DEFINER`
- authenticated-callable
- performs database-side admin authorization and blocks changing one's own role
- currently uses `search_path=public`; this is a hardening follow-up, not evidence of an active authorization bypass.

## Current application dependency state

As of this snapshot:

- Settings obtains account email from Supabase Auth (#69).
- Dashboard role/onboarding access is centralized behind `src/lib/profile-access.ts` (#83).
- Moderation-team page viewer/account-list reads are centralized behind the same access layer (#85).
- Profile save no longer uses account email as the fallback public `display_name` (#84).
- Aggregate-only production checks found **0** profiles where `display_name = email` and **0** email-like `display_name` values; no personal values were read.

The adapters still use the current direct profile queries internally. They are migration seams, not the final privacy boundary. After isolated DB testing, their implementations can move to `get_my_access_context()` and `admin_list_member_accounts()` without rewriting all consumers.

## Exact ACL rollback reference

If a future staged/production least-privilege grant change must be rolled back to the ACL captured above, the semantic target is the exact privilege set represented by `arwdDxtm` for `anon`, `authenticated`, and `service_role` on `public.profiles`.

A production rollback must be generated against the PostgreSQL version actually running at rollout time and must restore the captured privileges explicitly. Do not copy an older repository migration or assume `GRANT ALL` is an exact cross-version representation.

## Policy rollback reference

Before any production policy replacement, capture `pg_get_expr`/`pg_policies` output again in the same change window. The rollback target for SELECT is the current semantic policy:

```sql
is_public = true
or id = auth.uid()
or public.is_admin()
```

for roles `anon` and `authenticated`.

The implementation migration must not be generated solely from repository history because production migration history is not one-to-one with the repo migration directory.

## Search rollback reference

Before replacing `search_afghan_hub`, capture the complete current `pg_get_functiondef(...)` result in the staged/production change record. The repository draft deliberately does not claim an older function body is an exact production rollback.

## Data-state evidence

Aggregate-only checks found:

- `display_name = email`: **0 rows**
- email-shaped `display_name`: **0 rows**

No cleanup mutation is currently required for that specific historical fallback risk.

## Remaining gate before DB remediation

1. Finish centralizing remaining direct private/capability reads in application code.
2. Obtain an isolated production-compatible test environment without violating the zero-new-cost constraint.
3. Apply the reviewed RPC/search/grant/policy design only in that isolated environment first.
4. Run the full persona/API matrix.
5. Capture same-window production metadata again and generate forward + rollback SQL from that metadata.
6. Require explicit production-risk approval before changing production grants/RLS/functions.
