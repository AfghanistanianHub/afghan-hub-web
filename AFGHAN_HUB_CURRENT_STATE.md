# Afghan Hub current state

## Stage
Public website and discovery are shipped. Main now includes launch-hardening, profile-privacy preparation, member/moderation accessibility hardening and security-remediation planning through merged PR #81 (`721a2ce6ba101be4ecd95618e4061d45941b3ea1`). Recent exact PR heads passed Node 22/24 CI and Vercel before merge.

## Recently completed
- Account forms: pending feedback, repeat-submit protection, accessible status/errors, login compatibility with existing shorter passwords (#52).
- App recovery: standard Next.js error boundaries and repeatable anonymous smoke verification (#57).
- Public/mobile polish and reduced-motion/focus improvements (#56).
- SEO: auth/recovery noindex, Open Graph image, published detail URLs in sitemap (#58, #59).
- Delivery: CI aligned to supported Node 22/24 runtimes and current GitHub actions (#60).
- Auth callback hardening: explicit signup confirmation callback, allowlisted callback destinations, flow-specific expired-link recovery, regression coverage (#62).
- Route UX: accessible loading states for member workspace/public discovery and branded global 404 recovery (#64, #65).
- Settings privacy prep: signed-in account email now comes from Supabase Auth rather than `profiles.email` (#69).
- Profile privacy architecture: confirmed production finding documented, remediation architecture locked, review-only SQL/application draft and direct API persona-test matrix added (#70, #71; issue #67).
- Search privacy guard: member search rechecks public/onboarding eligibility before render and never renders an email-like member title from the current RPC fallback (#72).
- Sign-out coverage: deterministic regression coverage verifies server sign-out and protected member entry behavior (#74).
- Public content guard: exact placeholder titles/names are excluded from public listing mapping and sitemap; aggregate production audit found two published opportunities with placeholder titles and no production rows were edited (#75).
- Member form accessibility: Profile/Settings pending feedback, repeat-submit protection, accessible success/error announcements and keyboard-accessible avatar upload with non-destructive refresh (#76).
- Moderation accessibility: approve/reject feedback is announced and duplicate moderation submissions are blocked while pending (#77).
- Moderation-team accessibility: role-save feedback is announced, duplicate role updates are blocked while pending and keyboard focus feedback is explicit (#78).
- Durable state now includes aggregate hosted-auth and member-journey evidence (#79).
- Public-schema least-privilege finding is tracked in issue #80 and a review-only remediation plan is on main at `docs/security/public-schema-privilege-remediation.md` (#81).

## Readiness
The repository has stronger public SEO, failure/loading recovery, auth callback handling, content presentation guardrails, release verification, application-side privacy guards and substantially better form/moderation accessibility. Connection, messaging, contribution ownership and RSVP capacity authorization were also reviewed against current production policies/functions and no ownership-bypass defect was found in those reviewed paths. Full controlled end-to-end acceptance and database privilege/privacy remediation are still outstanding. Do not describe the product as fully launch-ready until the remaining dependencies below are resolved.

## Account-entry evidence
A read-only aggregate production Auth check on 2026-09-11 found 3 total users; all 3 were email-confirmed and all 3 had at least one successful sign-in. No email, user ID or other personal value was read. This confirms confirmation/login has worked historically in the hosted project, but it does not replace fresh acceptance of current confirmation/reset delivery, expired links, session expiry and cross-tab sign-out.

## Member-journey evidence
Read-only aggregate production checks found 2 connections and both are accepted, 2 conversations with 4 conversation memberships, 13 messages and 16 notifications. Of the notifications, 13 have `read_at` populated and 3 remain unread; 3 of 4 conversation memberships have a `last_read_at` marker. No member identity, message text, notification content or other personal value was read.

This confirms connection, conversation, messaging, notification and read-state paths have all been exercised in the hosted environment. It does not replace a fresh controlled multi-persona acceptance pass covering decline/cancel/disconnect and persona behavior.

Aggregate content status on the same read-only pass showed 2 pending opportunities, 5 pending events, 2 published opportunities, 1 published event, 1 published business and 2 published organizations. No production rows were changed.

## Authorization audit — reviewed clean paths
Read-only code and production-policy/function review found:

- connection response is recipient-only and pending-only in the database RPC; connection deletion is participant-only through RLS (with explicit admin exception);
- connection creation rejects self-requests, requires an eligible public/onboarded recipient and prevents duplicate relationships inside the database RPC;
- direct conversation creation requires an accepted connection inside `start_direct_conversation`;
- conversation/message reads require conversation membership; message insert additionally requires `sender_id = auth.uid()`;
- `is_conversation_member()` is SECURITY DEFINER with empty `search_path` and checks the current authenticated profile only;
- notification/read-state RPCs limit updates to the authenticated recipient/member;
- opportunities/events/businesses/organizations enforce author/creator/owner identity for inserts and owner/admin identity for updates/deletes through RLS;
- saved opportunities are self-only;
- event RSVP insertion uses the `rsvp_to_event` SECURITY DEFINER RPC: it locks the event row `FOR UPDATE`, verifies published/future availability, rejects the event creator, enforces capacity before insert and is backed by primary key `(event_id, profile_id)`; cancellation is self-only through RLS.

These checks reduce the remaining authorization uncertainty, but controlled persona tests are still required before launch.

## Confirmed profile privacy blocker (#67)
A read-only production metadata/role audit confirmed that `profiles` has RLS enabled, but authenticated users have table-level `SELECT` and the `profiles_select_public_or_owner` policy permits rows with `is_public=true`. Aggregate-only verification under the `authenticated` role confirmed that public profile rows with non-null email are selectable; no personal values were read. Anonymous profile access currently errors because the same policy references `is_admin()` while `anon` lacks execute permission on that function.

The current `search_afghan_hub` function also uses `coalesce(display_name, email)` for profile titles and does not require `onboarding_completed=true`. Aggregate verification found no current public profile in the email-fallback or incomplete-onboarding state. PR #72 adds an application-layer guard, but the database boundary still requires remediation.

Do not add anonymous/public member discovery or assume UI field selection protects profile email. A reviewed database policy/column-exposure fix is required before expanding profile visibility.

## Confirmed least-privilege blocker (#80)
A read-only production privilege audit found that `anon` and/or `authenticated` hold broader table privileges than the product requires on multiple public tables, including `TRUNCATE`, `TRIGGER`, `REFERENCES` and other broad privileges. Public-schema default ACLs also grant broad table privileges (`arwdDxtm`) for future objects created by observed owner roles, so new tables can inherit the same over-broad grants.

This is not classified as a demonstrated remote table-wipe exploit: normal Supabase/PostgREST table endpoints do not directly expose `TRUNCATE`, no anon/authenticated arbitrary-SQL application RPC was found, and current production has 0 public SECURITY DEFINER functions executable by `anon`. `authenticated` can execute 18 public SECURITY DEFINER functions, so those require function-by-function review rather than blanket revocation.

The review-only remediation design is in `docs/security/public-schema-privilege-remediation.md`. Do not apply production GRANT/REVOKE changes until an isolated production-compatible test environment, direct API persona tests and deterministic rollback are available.

## Migration baseline
Production currently reports 45 applied migrations. The repository does not contain the original July baseline and some later migrations share names with production but use different version timestamps. Do not run `db push`, blindly repair migration history, or replay the repository migration directory against production. Production security migrations must be generated from current metadata after isolated testing with rollback prepared.

## Remaining launch dependencies
1. Real registration/confirmation/password-reset delivery with a designated test account, including expired links, session expiry and cross-tab sign-out behavior.
2. Controlled multi-account acceptance of the already-reviewed connection/messaging/read-state/contribution/moderation paths, including decline/cancel/disconnect and unrelated-user denial.
3. Implement and test profile privacy remediation (#67) in an isolated production-compatible environment before any production authorization change.
4. Implement and test public-schema least-privilege remediation (#80), including existing/default grants and reviewed function EXECUTE exposure, in isolation before production.
5. Reconcile enough of the production migration baseline to produce production-specific reversible security migrations without replaying repository history.
6. Correct or unpublish remaining real published records with disposable placeholder summaries/descriptions. Application guardrails intentionally do not rewrite production content.
7. Privacy/terms/contact/support surfaces require factual operator identity, support contact, retention/deletion process and product decisions for account deletion/export and abuse/blocking.
8. Continue accessibility/responsive QA across remaining contribution/submission/messaging flows and complete final release rehearsal/backup-recovery verification.

## Cost and safety constraints
Prefer deterministic CI/tests/builds and existing free infrastructure. Do not trigger token-consuming Autopilot or add paid services without explicit approval. Do not create a potentially billable Supabase branch under the current zero-new-cost constraint. The existing second Supabase project could not be queried through the current connector because its database authentication failed, so it is not considered a usable staging environment. Do not modify production schema/RLS/grants/data or expose member data without isolated persona evidence, a reviewed rollback and an explicit production risk decision.
