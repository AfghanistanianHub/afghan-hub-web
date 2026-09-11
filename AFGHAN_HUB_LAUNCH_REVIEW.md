# Afghan Hub launch review

Reviewed 2026-09-11 against main `c887e3346f7ad1a1a42c381136c7997536de0783` after launch-hardening and profile-privacy preparatory work through PR #72. Recent PR heads were merged only after Node 22/24 CI and Vercel passed. No production schema, RLS, grant, function or content write was performed during this privacy audit/hardening sequence.

## Implemented and verified to a defined extent

| Area | Evidence now on main | Remaining acceptance work |
| --- | --- | --- |
| Public website | Landing, mission, category discovery/search/pagination/details; mobile/public interaction polish; accessible loading state; branded global 404 | Editorial review and broader accessibility/intermediate-width QA |
| Public SEO | Titles/canonicals, search noindex, member/auth/recovery noindex, Open Graph image, robots, static + published-detail sitemap | Final production crawl/index review |
| Authentication | Login/signup/recovery actions; pending-state protection; explicit signup confirmation callback; allowlisted callback destinations; flow-specific expired-link recovery; regression coverage | Real confirmation/reset email delivery, session expiry and cross-tab sign-out acceptance |
| Operational recovery | App/global error boundaries, retry path, route loading states, global not-found recovery, repeatable anonymous smoke script | Error-monitoring/support ownership and production failure drills |
| Content presentation | Public queries remain published-only/anonymous/field-allowlisted; exact `N/A`/`NA`/`Test`/`Testing` summary/description placeholders are hidden at render mapping without production edits | Owner/editor must correct or unpublish disposable real records |
| Member application | Dashboard, profile, settings, network, messaging, notifications, saved content and search routes exist | Multi-account end-to-end acceptance; route presence is not proof of completion |
| Contribution | Create/edit/moderation flows for four listing types; event RSVP/calendar/attendees | Owner/unrelated-member/moderator/admin tests, capacity concurrency and upload-failure acceptance |
| Security/privacy | Existing hardening migrations; public catalog excludes member profiles; Settings no longer reads `profiles.email`; remediation architecture/draft/persona matrix documented; search has application-side privacy guard (#69–#72) | Confirmed database profile-column exposure still requires isolated implementation/persona testing and reviewed production migration |
| Delivery | CI runs install, lint, typecheck, regression tests, syntax check and production build on supported Node 22/24; GitHub Actions upgraded from deprecated Node-20-backed versions | Exact-main release rehearsal and production smoke verification at final candidate |

## Confirmed profile privacy finding

A read-only production audit on 2026-09-11 inspected only schema, grants, policies, function definitions and aggregate counts; no profile values were read.

- `public.profiles` has RLS enabled.
- Table-level `SELECT` is granted to both `anon` and `authenticated`.
- Policy `profiles_select_public_or_owner` applies to `{anon,authenticated}` and allows rows when `is_public=true`, or the row belongs to the current user, or `is_admin()` returns true.
- `profiles` contains fields including `email`, `role`, `onboarding_completed`, timestamps, URLs, skills and other profile data.
- Under role `authenticated`, aggregate-only verification confirmed that public profile rows containing non-null email are selectable. UI `.select(...)` projections are therefore not a database privacy boundary.
- Under role `anon`, profile SELECT currently errors because the policy references `is_admin()` while `anon` does not have execute permission on `is_admin()`. Anonymous public-profile access is therefore inconsistent/broken rather than safely field-limited.
- `search_afghan_hub` is executable by anon/authenticated, currently uses `coalesce(display_name, email)` for profile result titles, and filters `is_public=true` without also requiring `onboarding_completed=true`.
- Aggregate verification found 3 current public profiles, with 0 currently requiring the email fallback and 0 currently incomplete in onboarding. Therefore the unsafe search path is structural; no current result-level email fallback was observed from those conditions.
- Anonymous execution of the current search RPC fails because the underlying profile policy reaches the non-executable `is_admin()` path.

PR #72 now rechecks member eligibility in the application before rendering search results and replaces email-like member titles with a generic member label. This is defense-in-depth only; it does not replace the required database fix.

## Privacy remediation now documented

Issue #67 tracks the confirmed finding. Main now contains:

- `docs/security/profile-privacy-remediation.md` — architecture/change-control lock (#70);
- `docs/security/profile-privacy-remediation-draft.md` — review-only staged SQL/application draft (#71);
- `docs/security/profile-privacy-persona-tests.md` — direct API persona acceptance matrix (#71).

The current draft proposes moving private reads behind narrow self/admin RPCs, removing broad profile-column access, hardening search, keeping anonymous member discovery closed for launch, and proving anon/member/owner/moderator/admin behavior before production.

## Migration baseline constraint

Read-only production history inspection reports **45 applied migrations**. The repository migration directory is not a one-to-one baseline: it lacks the original July baseline and some later migrations have matching logical names but different version timestamps. Therefore:

- do not run `db push` against production;
- do not blindly repair migration history;
- do not replay the repository migration directory against production;
- do not copy older repository policy/function definitions as if they were the current production source of truth.

The final privacy migration must be generated from current production definitions after isolated testing, with exact rollback definitions captured first.

## Existing authorization primitives verified

Read-only production metadata confirms:

- `is_admin()` is `SECURITY DEFINER`, has an explicit empty `search_path`, is executable by `authenticated` and not by `anon`;
- `set_profile_role(target_profile_id, target_role)` is `SECURITY DEFINER`, checks `is_admin()` inside the database, rejects self-role changes and then updates the target profile;
- no equivalent dedicated moderator/capability RPC was observed in the reviewed metadata.

These primitives should be reused rather than weakening profile column access merely to support admin UI.

## Priority work remaining

1. **Real account-entry acceptance:** use a designated test account to verify registration, confirmation delivery, confirmed login, password reset delivery, expired confirmation/reset links, session expiry and sign-out behavior. Code paths are hardened, but synthetic tests cannot prove external email delivery/provider configuration.
2. **Profile privacy implementation in isolation:** implement the reviewed safe-column/private-RPC/search changes in a production-compatible isolated environment and pass the direct API persona matrix. Do not change production authorization yet.
3. **Multi-account member journey:** execute discovery → connection → accept/decline → conversation → unread/read updates → contribution → moderation using at least two ordinary members plus moderator/admin personas. Include hidden profiles and unrelated-member denial.
4. **Production-specific migration/rollback:** reconcile enough of the migration baseline to generate the final privacy migration from current production metadata and prepare an exact rollback. Never replay repository history blindly.
5. **Editorial readiness:** identify real published records with disposable/test content and correct or unpublish them. Public placeholder guards intentionally do not rewrite production content.
6. **Policies/support/product decisions:** privacy, terms and contact/support surfaces need factual operator identity, support contact, retention/deletion process and applicable terms. Account deletion/export and abuse reporting/blocking require product decisions and implementation scope.
7. **Accessibility/responsive acceptance:** keyboard navigation, focus restoration, form errors, long labels/content, contrast, reduced motion and intermediate widths across remaining authenticated flows.
8. **Operational ownership:** define error monitoring, incident/support contact and backup/recovery procedure without exposing message contents or personal data.
9. **Final release rehearsal:** run accepted scenarios on a production-compatible environment, verify backup/recovery, run exact-main CI and anonymous smoke checks, deploy, then document known limitations. Do not claim full launch readiness before these dependencies are resolved.

## Security advisor follow-up

Earlier read-only Supabase advisor results were warnings, not demonstrated exploits:
- `pg_trgm` installed in public. Check dependency use before relocating it through a reviewed migration.
- 18 authenticated-callable `SECURITY DEFINER` functions. Many may be deliberate application RPCs; review authorization, grants and `search_path` individually rather than blanket revocation.
- Leaked-password protection was disabled. Confirm feature availability and cost before changing configuration; do not enable a paid setting without explicit approval.

A previous read-only audit also found no anonymous-callable public `SECURITY DEFINER` functions, no ordinary/partitioned public tables with RLS disabled, no `CREATE` privilege for anon/authenticated in public, and direct authenticated `INSERT` revoked on conversation membership tables. Those findings reduce some attack surface but do not resolve the confirmed profile-column exposure.

## Cost and change-control constraints

Use deterministic CI/tests/builds and existing free infrastructure first. Do not trigger token-consuming Autopilot, buy credits or add paid services without explicit approval. Do not create a potentially billable Supabase development branch under the current zero-new-cost constraint. Do not alter production schema/RLS/grants/data, secrets, auth-provider policy or public member visibility without isolated persona evidence, a reviewed rollback and an explicit production risk decision.
