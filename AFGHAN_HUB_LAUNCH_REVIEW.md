# Afghan Hub launch review

Reviewed 2026-09-12 against production main `50c226460ebea259972b0fb21a2ab5637f2be713` after hardening and security-rehearsal work through PR #108. Recent PR heads passed Node 22/24 CI and Vercel before merge, and the current main commit has a successful Vercel production deployment. No production schema/RLS/grant/function/storage-policy/content write was performed during this review sequence.

## Implemented and verified to a defined extent

| Area | Evidence now on main | Remaining acceptance work |
| --- | --- | --- |
| Public website | Landing, about, category discovery/search/pagination/details, mobile polish, loading states, global 404 | Editorial review and broader responsive/accessibility acceptance |
| Public SEO | Canonicals/titles, auth/recovery noindex, Open Graph image, robots, static + published-detail sitemap, placeholder-title sitemap guard | Final production crawl/index review |
| Authentication | Login/signup/recovery, explicit callback flow, allowlisted callback destinations, stable user-safe provider errors, pending/repeat-submit protection, auth-route smoke checks; 3/3 current production accounts historically confirmed and signed in | Fresh delivery/reset/expired-link/session/cross-tab acceptance with disposable test account |
| Operational recovery | Error boundaries, retry path, loading states, branded not-found, anonymous smoke script | Monitoring/support ownership and failure drill |
| Public content | Published-only public mapping, field allowlists, exact placeholder body/title guards | Confirm and clean disposable production test records (#105) |
| Member flows | Profile/settings/network/messaging/notifications/saved/search; production aggregates show real connection/message/read-state usage | Controlled multi-account persona acceptance |
| Contribution | Opportunity/event/business/organization create/edit/moderation; RSVP/calendar/attendees; provider errors redacted from user redirects | Controlled owner/unrelated/moderator/admin acceptance and upload-failure acceptance |
| Uploads | Avatar/business/org provider errors redacted; business/org controls keyboard/focus/aria-live accessible | Decide future draft-media lifecycle (#93) |
| Security/privacy | Production snapshots, application privacy seams/guards, migration reconciliation, production-blocked persona harness, #67 forward/rollback/app transition rehearsal, and #80 Phase A forward/rollback rehearsal | Isolated execution/testing required before production DDL |
| Dependency security | Next.js / eslint-config-next 16.3.4; compatible overrides for `hono`, `js-yaml`, `qs`; `npm audit` = 0 | Keep upgrades reviewed/reversible; no force fixes |
| Delivery | Node 22/24 install/lint/typecheck/tests/syntax/build on PRs; current main production deploy successful | Final exact-main smoke after remaining product/security gates |

## Account-entry evidence
A read-only aggregate production Auth check found 3 users; all 3 have `email_confirmed_at` and `last_sign_in_at`. No email, user ID or other personal value was read. This proves hosted confirmation/login worked historically, not that current outbound confirmation/reset delivery and expiry/session scenarios pass today.

## Member-journey evidence
Aggregate-only production evidence found 2 accepted connections, 2 conversations, 4 conversation memberships, 13 messages and 16 notifications; 13 notifications are read and 3 unread, and 3/4 memberships have `last_read_at`. No identities, message text or notification content were read.

Reviewed DB/application boundaries show recipient/participant ownership for connections, accepted-connection gating for direct conversations, conversation membership for message reads/writes, recipient/member scoping for read-state notifications, creator/owner RLS for content, and atomic event capacity enforcement through `FOR UPDATE` plus `(event_id, profile_id)` primary key.

## Profile privacy blocker — #67
`public.profiles` still combines public profile data with private/internal columns while broad relation grants allow authenticated reads of public rows. Application `.select(...)` projections are not a database privacy boundary. Production `search_afghan_hub` also retains the structural email-fallback/onboarding defects in its profile branch.

The preparation phase is now substantially complete and is no longer the limiting factor. On main we have:
- production authorization/default-ACL/function snapshots;
- a migration-baseline reconciliation showing why historical replay is unsafe;
- a production-blocked read-only persona harness with regression guards;
- forward rehearsal SQL derived from current production behavior;
- exact rollback rehearsal derived from the captured pre-change state;
- a small application transition plan centered on `profile-access.ts`, preserving current page contracts.

The remaining blocker is execution evidence: obtain a trustworthy production-compatible isolated target, apply the rehearsal package there, run the persona matrix and application flows, then verify rollback. Do not apply #67 directly to production.

## Least-privilege blocker — #80
Read-only production metadata confirms broader-than-needed structural/default privileges on application relations. No arbitrary-SQL application RPC, direct PostgREST TRUNCATE endpoint or anon-callable SECURITY DEFINER function was found, so this is not labeled a demonstrated remote wipe.

The current remediation is deliberately phased. Phase A, now documented on main through PR #108, targets only `TRUNCATE`, `REFERENCES`, `TRIGGER`, and `MAINTAIN` on the explicit 12 postgres-owned application tables plus the matching postgres-owned default table ACL. It does not touch DML, RLS or function EXECUTE grants. Its rollback restores only the structural grants captured in production, including the different current states for `event_rsvps` and `notifications`.

Production metadata further shows `supabase_admin` owns 31 objects in `public` and all are extension-owned functions. The current postgres session is not a member of `supabase_admin`, so pg_trgm/platform-owned defaults are intentionally outside Afghan Hub application hardening.

Later #80 phases should separately review unnecessary DML relation grants and the authenticated-callable SECURITY DEFINER/search-path surface. Do not combine those into Phase A.

## Draft media — #93
Business/organization media buckets are public and owner-bound for writes. Draft media would remain public-by-URL if the path is known. A current aggregate impact check found zero non-published businesses and zero non-published organizations, so there is no active draft-media exposure in production right now. Keep #93 as a future lifecycle decision before draft business/organization media becomes used in production.

## Disposable production content — #105
A read-only exact-title audit found 8 obvious test records: five draft events, one draft opportunity, and two published opportunities titled `test/Test`. Existing application guards suppress the two published placeholder-title opportunities from public listing/detail and sitemap output, so there is no immediate public/SEO exposure from those two records. Production cleanup still requires deliberate approval; nothing was edited or unpublished automatically.

## Dependency security — resolved baseline
PR #101 upgraded `next` and `eslint-config-next` to 16.3.4. PR #103 applied only compatible patch-level npm overrides to residual transitive tooling advisories. `npm audit` now reports **0 vulnerabilities** across all severities. No `npm audit fix --force` or major dependency upgrade was used.

## Migration constraint — now bounded
Production has 45 applied migrations while the repo has 29 files and is not the original production baseline. PR #106 documents the mismatch classes and captures the current authorization/default-ACL/function state.

Historical migration repair is not a prerequisite for #67/#80 anymore. For future reversible production security work, the source of truth is current production metadata captured immediately before rollout plus the tested forward/rollback package. Still never `db push`, blindly repair migration history or replay the repository migration directory against production.

## Security advisor / platform notes
Read-only warnings include `pg_trgm` in public, authenticated-callable SECURITY DEFINER functions and leaked-password protection disabled. Performance advisor reports unused-index INFO findings. Review individually; do not blanket revoke functions, remove low-traffic indexes, move extension-owned objects or enable potentially plan-dependent password protection without compatibility/cost review.

## Vercel / zero-cost delivery condition
Current production main `50c226460ebea259972b0fb21a2ab5637f2be713` is deployed successfully. A previous persona-harness preview hit Vercel's free-tier build-rate limit; quota failures are infrastructure conditions, not application failures. Continue batching meaningful changes and do not buy Pro or create no-op deployments.

## Isolated-environment constraint
The existing second Supabase project previously returned password-authentication failure through the connector and is not considered a trustworthy staging target. Do not create a potentially billable Supabase branch without explicit cost approval. Until a production-compatible isolated target exists, security DDL remains review-only.

## Priority work remaining
1. Fresh registration/confirmation/password-reset/expired-link/session/cross-tab sign-out acceptance using a designated disposable test account.
2. Controlled 2-member + moderator/admin journey acceptance, including deny paths and hidden/unrelated users.
3. Obtain a trustworthy production-compatible isolated database target; run the #67 read-only persona harness, forward rehearsal, app transition, regression flows and rollback there.
4. Rehearse #80 Phase A in the same kind of isolated environment; later evaluate DML/function hardening as separate phases.
5. Decide the long-term #93 draft-media lifecycle before draft listing media is introduced.
6. Review and clean confirmed disposable/test production content (#105) with deliberate production-content approval.
7. Provide factual operator identity, support contact, retention/deletion process and product decisions for privacy/terms/contact, deletion/export and abuse/blocking.
8. Final production-compatible release rehearsal, backup/recovery verification and exact-main smoke after the above gates.

## Cost/change control
Use deterministic CI/tests/builds and existing free infrastructure. Do not trigger paid agents, Vercel upgrades, new credits or a potentially billable Supabase branch. Do not modify production schema/RLS/grants/functions/storage visibility/auth-provider policy/data or public member visibility without isolated evidence, reviewed rollback and an explicit production risk decision.
