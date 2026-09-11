# Afghan Hub current state

## Stage
Public website and discovery are shipped. Main now includes launch-hardening and profile-privacy preparatory work through merged PR #72 (`c887e3346f7ad1a1a42c381136c7997536de0783`). Recent exact PR heads passed Node 22/24 CI and Vercel before merge.

## Recently completed
- Account forms: pending feedback, repeat-submit protection, accessible status/errors, login compatibility with existing shorter passwords (#52).
- App recovery: standard Next.js error boundaries and repeatable anonymous smoke verification (#57).
- Public/mobile polish and reduced-motion/focus improvements (#56).
- SEO: auth/recovery noindex, Open Graph image, published detail URLs in sitemap (#58, #59).
- Delivery: CI aligned to supported Node 22/24 runtimes and current GitHub actions (#60).
- Content guardrail: exact placeholder public copy such as `N/A`/`Test` is treated as missing without editing production data (#61).
- Auth callback hardening: explicit signup confirmation callback, allowlisted callback destinations, flow-specific expired-link recovery, regression coverage (#62).
- Route UX: accessible loading states for member workspace/public discovery and branded global 404 recovery (#64, #65).
- Settings privacy prep: signed-in account email now comes from Supabase Auth rather than `profiles.email` (#69).
- Profile privacy architecture: confirmed production finding documented, remediation architecture locked, review-only SQL/application draft and direct API persona-test matrix added (#70, #71; issue #67).
- Search privacy guard: member search now rechecks public/onboarding eligibility before render and never renders an email-like member title from the current RPC fallback (#72).

## Readiness
The repository now has stronger public SEO, failure/loading recovery, auth callback handling, content presentation guardrails, release verification and application-side privacy guards. Full authenticated end-to-end acceptance is still outstanding. Do not describe the product as fully launch-ready until the remaining acceptance and database-authorization dependencies below are resolved.

## Confirmed privacy blocker
A read-only production metadata/role audit on 2026-09-11 confirmed that `profiles` has RLS enabled, but authenticated users have table-level `SELECT` and the `profiles_select_public_or_owner` policy permits rows with `is_public=true`. Aggregate-only verification under the `authenticated` role confirmed that public profile rows with non-null email are selectable; no personal values were read. Anonymous profile access currently errors because the same policy references `is_admin()` while `anon` lacks execute permission on that function.

The current `search_afghan_hub` function also uses `coalesce(display_name, email)` for profile titles and does not require `onboarding_completed=true`. Aggregate verification found no current public profile in the email-fallback or incomplete-onboarding state, so no current search-result leak was observed from those conditions. PR #72 adds an application-layer guard, but the database boundary still requires remediation.

Do not add anonymous/public member discovery or assume UI field selection protects profile email. A reviewed database policy/column-exposure fix is required before expanding profile visibility.

## Migration baseline
Production currently reports 45 applied migrations. The repository does not contain the original July baseline and some later migrations share names with production but use different version timestamps. Therefore do not run `db push`, blindly repair migration history, or replay the repository migration directory against production. Any profile-privacy migration must be generated from current production metadata after isolated persona testing and with a rollback prepared.

## Remaining launch dependencies
1. Real registration/confirmation/password-reset delivery with a designated test account, including expired links, session expiry and sign-out behavior.
2. Multi-account member journey: discovery → connection → conversation → unread/read → contribution → moderation, with unrelated-member denial and moderator/admin personas.
3. Implement the reviewed profile column/grant/RPC/search remediation in an isolated production-compatible environment and pass the persona test matrix before any production authorization change.
4. Reconcile enough of the production migration baseline to produce a production-specific, reversible privacy migration without replaying repository history.
5. Editorial cleanup or unpublishing of disposable test records. Public guardrails hide exact placeholder descriptions but do not delete or invent content.
6. Privacy/terms/contact and support surfaces require factual operator identity, support contact, retention/deletion process and product decisions for account deletion/export and abuse/blocking.
7. Broader accessibility/responsive QA across remaining member flows and final release rehearsal/backup-recovery verification.

## Cost and safety constraints
Prefer deterministic CI/tests/builds and existing free infrastructure. Do not trigger token-consuming Autopilot or add paid services without explicit approval. Do not create a potentially billable Supabase branch under the current zero-new-cost constraint. Do not modify production schema/RLS/grants/data or expose member data without isolated persona evidence, a reviewed rollback and an explicit production risk decision.
