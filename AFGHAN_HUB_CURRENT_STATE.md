# Afghan Hub current state

## Stage
Public website and discovery are shipped. Main now includes launch-hardening, profile-privacy preparation, member/moderation accessibility hardening, authorization review and production-specific security rollback evidence through merged PR #87 (`cf9317acf218424496eb75865c5ae2db677010ed`). Recent exact PR heads passed Node 22/24 CI and Vercel before merge.

## Recently completed
- Account forms: pending feedback, repeat-submit protection, accessible status/errors, login compatibility with existing shorter passwords (#52).
- App recovery: standard Next.js error boundaries and repeatable anonymous smoke verification (#57).
- Public/mobile polish and reduced-motion/focus improvements (#56).
- SEO: auth/recovery noindex, Open Graph image, published detail URLs in sitemap (#58, #59).
- Delivery: CI aligned to supported Node 22/24 runtimes and current GitHub actions (#60).
- Auth callback hardening: explicit signup confirmation callback, allowlisted callback destinations, flow-specific expired-link recovery, regression coverage (#62).
- Route UX: accessible loading states for member workspace/public discovery and branded global 404 recovery (#64, #65).
- Settings privacy prep: signed-in account email comes from Supabase Auth rather than `profiles.email` (#69).
- Profile privacy architecture: confirmed production finding, remediation architecture, review-only SQL/application draft and direct API persona-test matrix (#70, #71; issue #67).
- Search privacy guard: member search rechecks public/onboarding eligibility and never renders an email-like member title from the current RPC fallback (#72).
- Sign-out coverage: deterministic regression coverage verifies server sign-out and protected member entry behavior (#74).
- Public content guard: exact placeholder titles/names are excluded from public listing mapping and sitemap (#75).
- Member form accessibility: Profile/Settings pending feedback, repeat-submit protection and keyboard-accessible avatar upload (#76).
- Moderation accessibility and repeat-submit protection (#77, #78).
- Durable state includes aggregate hosted-auth/member-journey evidence (#79).
- Public-schema least-privilege finding is tracked in issue #80 and its review-only remediation plan is on main (#81).
- Authorization/database security audit state was reconciled after connection, messaging, contribution ownership and RSVP review (#82).
- Dashboard role/onboarding reads are centralized behind `src/lib/profile-access.ts`, creating a single future RPC migration seam (#83).
- Profile save no longer copies account email into public `display_name` and no longer exposes raw database save errors (#84).
- Moderation-team viewer/member-account reads are centralized behind the profile access layer and raw member-load DB errors are no longer rendered (#85).
- Moderation and role-management server actions use the same centralized access layer and stable user-facing failures rather than raw RPC/database errors (#86).
- Current production profile schema/ACL/policy/function/trigger evidence and rollback reference are captured in `docs/security/profile-privacy-production-snapshot-2026-09-12.md` (#87).

## Readiness
The repository has stronger public SEO, recovery/auth handling, content presentation guardrails, release verification, application-side privacy guards and substantially better form/moderation accessibility. Connection, messaging, contribution ownership and RSVP capacity authorization were reviewed against current production policies/functions and no ownership-bypass defect was found in those reviewed paths. Full controlled end-to-end acceptance and database privilege/privacy remediation are still outstanding. Do not describe the product as fully launch-ready until the remaining dependencies below are resolved.

## Account-entry evidence
A read-only aggregate production Auth check on 2026-09-11 found 3 total users; all 3 were email-confirmed and all 3 had at least one successful sign-in. No email, user ID or other personal value was read. This confirms confirmation/login has worked historically in the hosted project, but it does not replace fresh acceptance of current confirmation/reset delivery, expired links, session expiry and cross-tab sign-out.

## Member-journey evidence
Read-only aggregate production checks found 2 connections and both are accepted, 2 conversations with 4 conversation memberships, 13 messages and 16 notifications. Of the notifications, 13 have `read_at` populated and 3 remain unread; 3 of 4 conversation memberships have a `last_read_at` marker. No member identity, message text, notification content or other personal value was read.

Aggregate content status on the same read-only pass showed 2 pending opportunities, 5 pending events, 2 published opportunities, 1 published event, 1 published business and 2 published organizations. No production rows were changed.

## Authorization audit — reviewed clean paths
Read-only code and production-policy/function review found:

- connection response is recipient-only/pending-only in the DB RPC; connection deletion is participant-only through RLS with explicit admin exception;
- connection creation rejects self-requests, requires an eligible public/onboarded recipient and prevents duplicate relationships inside the DB RPC;
- direct conversation creation requires an accepted connection;
- conversation/message reads require membership; message insert additionally requires `sender_id = auth.uid()`;
- `is_conversation_member()` is SECURITY DEFINER with empty `search_path` and checks the current authenticated profile only;
- notification/read-state RPCs limit updates to the authenticated recipient/member;
- opportunities/events/businesses/organizations enforce author/creator/owner identity for inserts and owner/admin identity for updates/deletes through RLS;
- saved opportunities are self-only;
- event RSVP uses `FOR UPDATE` event locking before capacity enforcement and is backed by primary key `(event_id, profile_id)`; cancellation is self-only.

A follow-up Security Advisor review still reports 18 authenticated-callable public SECURITY DEFINER functions. Reviewed connection/messaging/moderation/RSVP/count/read-state functions enforce current-user or role boundaries in their bodies. Some older reviewed functions still use `search_path=public`; because API roles do not have CREATE on public, no immediate search-path injection exploit was established, but converting appropriate functions to an empty search path remains a hardening task.

## Confirmed profile privacy blocker (#67)
Current production `public.profiles` has RLS enabled but its relation ACL is broad for `anon` and `authenticated` (`arwdDxtm`), and `profiles_select_public_or_owner` permits public rows. The base table mixes public profile fields with private/internal fields including `email`, `role`, timestamps and `search_vector`. Aggregate-only verification under the authenticated role confirmed public profile rows with non-null email are selectable; no personal values were read.

The current DB `search_afghan_hub` profile branch still uses `coalesce(display_name, email)` and does not require `onboarding_completed=true`. Application guards prevent rendering an email-like fallback, and PR #84 prevents new profile saves from copying account email into `display_name`.

Aggregate-only production checks on 2026-09-12 found **0** rows where `display_name = email` and **0** email-like `display_name` values, so no current data cleanup is required for that specific historical fallback risk.

Application migration seams now exist for dashboard access context and moderation-team account data. The server actions for moderation/role management also use the shared access layer. The large `/moderation` page still contains one direct current-user role read; it was intentionally not rewritten through the current connector because only full-file replacement is available and the fetched file is truncated, making a partial manual rewrite unnecessarily risky.

Do not add anonymous/public member discovery or assume UI field selection protects profile email. The reviewed DB column/grant/RPC/search/policy remediation still requires isolated persona testing before production.

## Confirmed least-privilege blocker (#80)
A read-only production privilege audit found `anon` and/or `authenticated` hold broader table privileges than required on multiple public tables, including `TRUNCATE`, `TRIGGER`, `REFERENCES` and other broad privileges. Public-schema default ACLs also grant broad table privileges (`arwdDxtm`) for future objects.

This is not classified as a demonstrated remote table-wipe exploit: normal PostgREST table endpoints do not directly expose `TRUNCATE`, no anon/authenticated arbitrary-SQL application RPC was found, and production has 0 public SECURITY DEFINER functions executable by `anon`.

The review-only remediation design is in `docs/security/public-schema-privilege-remediation.md`. Do not apply production GRANT/REVOKE changes until an isolated production-compatible test environment, direct API persona tests and deterministic rollback are available.

## Security Advisor notes
Current Supabase Security Advisor warnings include:

- `pg_trgm` installed in the public schema;
- 18 authenticated-callable SECURITY DEFINER functions;
- leaked-password protection disabled.

Do not enable leaked-password protection or another possibly plan-dependent feature without confirming availability/cost under the zero-new-cost constraint. Do not blanket-revoke authenticated function EXECUTE because core flows intentionally use several of these RPCs.

## Migration baseline
Production reports 45 applied migrations. The repository does not contain the original July baseline and some later migrations share names with production but use different version timestamps. Do not run `db push`, blindly repair migration history, or replay the repository migration directory against production. Production security migrations must be generated from current metadata after isolated testing with rollback prepared.

## Remaining launch dependencies
1. Real registration/confirmation/password-reset delivery with a designated test account, including expired links, session expiry and cross-tab sign-out behavior.
2. Controlled multi-account acceptance of the already-reviewed connection/messaging/read-state/contribution/moderation paths, including decline/cancel/disconnect and unrelated-user denial.
3. Finish the remaining safe application dependency removal for profile privacy (notably the `/moderation` page role read), then implement/test the `get_my_access_context`, `admin_list_member_accounts`, search and profile column/policy remediation in an isolated production-compatible environment.
4. Implement and test public-schema least-privilege remediation (#80), including existing/default grants and reviewed function EXECUTE/search-path exposure, in isolation before production.
5. Reconcile enough of the production migration baseline to produce production-specific reversible security migrations without replaying repository history.
6. Correct or unpublish remaining published disposable/test content where appropriate; application guardrails intentionally do not rewrite production content.
7. Privacy/terms/contact/support surfaces require factual operator identity, support contact, retention/deletion process and product decisions for account deletion/export and abuse/blocking.
8. Continue accessibility/responsive QA across remaining contribution/submission/messaging flows and complete final release rehearsal/backup-recovery verification.

## Cost and safety constraints
Prefer deterministic CI/tests/builds and existing free infrastructure. Do not trigger token-consuming Autopilot or add paid services without explicit approval. Do not create a potentially billable Supabase branch under the zero-new-cost constraint. The existing second Supabase project could not be queried through the current connector because database authentication failed, so it is not considered a usable staging environment. Do not modify production schema/RLS/grants/data or expose member data without isolated persona evidence, a reviewed rollback and an explicit production risk decision.
