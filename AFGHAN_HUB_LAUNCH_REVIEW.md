# Afghan Hub launch review

Reviewed 2026-09-12 against production main `b22a149041cc0fcb2e930bd2c9b79c883863ddf0` after launch/security hardening through PR #103. PR heads for the recent dependency changes passed Node 22/24 CI and Vercel before merge, and the current main commit has a successful Vercel production deployment. No production schema/RLS/grant/function/storage-policy/content write was performed during this review sequence.

## Implemented and verified to a defined extent

| Area | Evidence now on main | Remaining acceptance work |
| --- | --- | --- |
| Public website | Landing, about, category discovery/search/pagination/details, mobile polish, loading states, global 404 | Editorial review and broader responsive/accessibility acceptance |
| Public SEO | Canonicals/titles, auth/recovery noindex, Open Graph image, robots, static + published-detail sitemap, placeholder-title sitemap guard | Final production crawl/index review |
| Authentication | Login/signup/recovery, explicit callback flow, allowlisted callback destinations, stable user-safe provider errors, pending/repeat-submit protection, auth-route smoke checks; 3/3 current production accounts historically confirmed and signed in | Fresh email delivery/reset/expired-link/session/cross-tab acceptance with disposable test account |
| Operational recovery | Error boundaries, retry path, loading states, branded not-found, anonymous smoke script | Monitoring/support ownership and failure drill |
| Public content | Published-only public mapping, field allowlists, exact placeholder body/title guards | Correct/unpublish disposable production records |
| Member flows | Profile/settings/network/messaging/notifications/saved/search; production aggregates show real connection/message/read-state usage | Controlled multi-account persona acceptance |
| Contribution | Opportunity/event/business/organization create/edit/moderation; event RSVP/calendar/attendees; provider errors redacted from user redirects | Controlled owner/unrelated/moderator/admin acceptance and upload-failure acceptance |
| Uploads | Avatar/business/org media provider errors redacted; business/org controls keyboard/focus/aria-live accessible | Decide draft-media public-by-URL lifecycle (#93) |
| Security/privacy | Application privacy seams/guards, production snapshot, persona matrix, least-privilege design, and a production-blocked read-only persona harness; authorization reviewed on connection/messaging/contribution/RSVP | DB profile privacy #67, least privilege #80 and media lifecycle #93 require isolated implementation/testing |
| Dependency security | Next.js / eslint-config-next 16.3.4; compatible overrides for `hono`, `js-yaml`, `qs`; `npm audit` = 0 | Keep upgrades reviewed and reversible; do not use force fixes |
| Delivery | Node 22/24 install/lint/typecheck/tests/syntax/build on PRs; current main production deploy is successful | Final exact-main smoke after remaining product/security gates |

## Account-entry evidence
A read-only aggregate production Auth check found 3 users; all 3 have `email_confirmed_at` and `last_sign_in_at`. No email, user ID or other personal value was read. This proves hosted confirmation/login worked historically, not that current outbound confirmation/reset delivery and expiry/session scenarios pass today.

## Member-journey evidence
Aggregate-only production evidence found 2 accepted connections, 2 conversations, 4 conversation memberships, 13 messages and 16 notifications; 13 notifications are read and 3 unread, and 3/4 memberships have `last_read_at`. No identities, message text or notification content were read.

Reviewed DB/application boundaries show recipient/participant ownership for connections, accepted-connection gating for direct conversations, conversation membership for message reads/writes, recipient/member scoping for read-state notifications, creator/owner RLS for content, and atomic event capacity enforcement through `FOR UPDATE` plus `(event_id, profile_id)` primary key.

## Profile privacy blocker — #67
`public.profiles` combines public profile data with private/internal columns while RLS and broad relation grants permit authenticated reads of public rows. Aggregate verification confirmed private columns such as non-null email are selectable for public profile rows; UI `.select(...)` lists are not a database privacy boundary.

The DB search function also structurally retains `coalesce(display_name, email)` and does not require completed onboarding. Application guards now refuse email-like member titles and recheck public/onboarding eligibility; new profile saves no longer copy account email into `display_name`. Aggregate checks found zero current `display_name=email` rows and no current public onboarding-incomplete rows, but the DB design still requires remediation.

The security package contains architecture/change-control docs, review-only SQL/application draft, persona test matrix, production snapshot, and a read-only direct-API persona harness. The harness hard-fails if its Supabase URL identifies production project `yussznmwjsvfvpabmwdc` and regression coverage rejects mutation verbs/RPCs. It is not a substitute for an isolated environment; it is the test runner for one.

Do not expose anonymous member discovery or change profile columns/RPC/policies in production until isolated persona tests and rollback pass.

## Least-privilege blocker — #80
Read-only production metadata confirms multiple public tables/default ACLs grant `anon`/`authenticated` more privileges than required, including structural privileges such as TRUNCATE/TRIGGER/REFERENCES/MAINTAIN. Default ACL exposure applies to both `postgres` and `supabase_admin` owners.

No arbitrary-SQL application RPC, direct PostgREST TRUNCATE endpoint or anon-callable SECURITY DEFINER function was found, so this is not labeled a demonstrated remote wipe. Eighteen SECURITY DEFINER functions are authenticated-callable; seven use empty search path and eleven reviewed older functions use `search_path=public`. Their inspected bodies largely schema-qualify sensitive object references, which lowers migration complexity but does not justify direct production DDL.

## Dependency security — resolved baseline
PR #101 upgraded `next` and `eslint-config-next` to 16.3.4 with Node 22/24 CI and Vercel verification. The audit then dropped from six findings to three transitive tooling advisories. Their ancestry was verified (`shadcn`/MCP and ESLint tooling), and PR #103 applied only compatible patch-level npm overrides (`hono` 4.13.7, `js-yaml` 4.3.2, `qs` 6.16.0). The resulting `npm audit` report is **0 vulnerabilities** across all severities. No `npm audit fix --force` or major dependency upgrade was used.

## Draft media — #93
Business/organization media buckets are public and have owner-bound writes plus configured MIME/size limits. Object paths use listing UUID plus predictable logo/cover names. Cross-owner write was not found, but draft media remains public-by-URL when a path is known. Decide desired lifecycle and test compatibility before bucket policy/visibility changes.

## Security Advisor
Warnings currently include `pg_trgm` in public, 18 authenticated-callable SECURITY DEFINER functions and leaked-password protection disabled. Performance advisor reports 43 unused-index INFO findings. Review individually; do not blanket revoke functions, remove indexes from low-traffic statistics, move the extension or enable plan-dependent password protection without compatibility/cost review.

## Migration constraint
Production has 45 applied migrations and the repo is not the original production baseline. Never `db push`, blindly repair history or replay repo migrations into production. Generate any final security migration from current production metadata after isolated testing and capture exact rollback first.

## Provider-error hardening completed
- Account/profile/settings provider errors are stable/user-safe (#84, #91).
- Media upload provider errors are stable/user-safe and business/org upload accessibility improved (#94).
- Business/Organization contribution and verification errors are redacted; verification uses centralized access context (#96).
- Event/Opportunity create/update/delete/save errors are redacted while RSVP semantic state mapping remains intentional (#97).

## Vercel/free-tier delivery condition
Current production main `b22a149041cc0fcb2e930bd2c9b79c883863ddf0` is deployed successfully. A later persona-harness branch preview initially hit Vercel's free-tier build-rate-limit page; treat quota failures as infrastructure limits, not application failures. Do not buy Pro or create no-op deployments. Batch meaningful changes and retry after cooldown.

## Isolated-environment constraint
The existing second Supabase project was rechecked read-only and still returns password-authentication failure through the connector, so it is not considered a trustworthy staging target. Do not create a potentially billable Supabase branch without explicit cost approval. Until a production-compatible isolated target exists, security DDL remains review-only.

## Priority work remaining
1. Fresh registration/confirmation/password-reset/expired-link/session/sign-out acceptance with a designated disposable test account.
2. Controlled 2-member + moderator/admin journey acceptance, including deny paths and hidden/unrelated users.
3. Run the read-only persona harness against a production-compatible isolated environment, then implement/test #67 profile safe-column/private-RPC/search remediation there.
4. Implement/test #80 table/default-ACL/function least-privilege remediation in isolation.
5. Decide/test #93 draft-media lifecycle.
6. Reconcile enough migration baseline to create production-specific reversible security migrations without replaying history.
7. Correct/unpublish disposable/test content where appropriate.
8. Provide factual operator identity, support contact, retention/deletion process and product decisions for privacy/terms/contact, deletion/export and abuse/blocking.
9. Final production-compatible release rehearsal, backup/recovery verification and exact-main smoke after the above gates.

## Cost/change control
Use deterministic CI/tests/builds and existing free infrastructure. Do not trigger paid agents, Vercel upgrade, new credits or a potentially billable Supabase branch. Do not modify production schema/RLS/grants/functions/storage visibility/auth-provider policy/data or public member visibility without isolated evidence, reviewed rollback and an explicit production risk decision.
