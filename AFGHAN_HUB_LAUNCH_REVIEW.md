# Afghan Hub launch review

Reviewed 2026-09-12 against main `925f1776ac3e880f8644a9638a5924bfaf986507` after launch hardening through PR #97. PR heads #94–#97 passed Node 22/24 CI and Vercel before merge. The current main merge commit is presently blocked only by Vercel free-tier build-rate-limit; no paid upgrade is authorized. No production schema/RLS/grant/function/storage-policy/content write was performed during this review sequence.

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
| Security/privacy | Application privacy seams/guards, production snapshot, persona matrix, least-privilege design; authorization reviewed on connection/messaging/contribution/RSVP | DB profile privacy #67, least privilege #80 and media lifecycle #93 require isolated implementation/testing |
| Delivery | Node 22/24 install/lint/typecheck/tests/syntax/build on PRs; meaningful changes batched to limit Vercel builds | Current main production deploy is free-tier rate-limited; final exact-main smoke after cooldown/security gates |

## Account-entry evidence
A read-only aggregate production Auth check found 3 users; all 3 have `email_confirmed_at` and `last_sign_in_at`. No email, user ID or other personal value was read. This proves hosted confirmation/login worked historically, not that current outbound confirmation/reset delivery and expiry/session scenarios pass today.

## Member-journey evidence
Aggregate-only production evidence found 2 accepted connections, 2 conversations, 4 conversation memberships, 13 messages and 16 notifications; 13 notifications are read and 3 unread, and 3/4 memberships have `last_read_at`. No identities, message text or notification content were read.

Reviewed DB/application boundaries show recipient/participant ownership for connections, accepted-connection gating for direct conversations, conversation membership for message reads/writes, recipient/member scoping for read-state notifications, creator/owner RLS for content, and atomic event capacity enforcement through `FOR UPDATE` plus `(event_id, profile_id)` primary key.

## Profile privacy blocker — #67
`public.profiles` combines public profile data with private/internal columns while RLS and broad relation grants permit authenticated reads of public rows. Aggregate verification confirmed private columns such as non-null email are selectable for public profile rows; UI `.select(...)` lists are not a database privacy boundary.

The DB search function also structurally retains `coalesce(display_name, email)` and does not require completed onboarding. Application guards now refuse email-like member titles and recheck public/onboarding eligibility; new profile saves no longer copy account email into `display_name`. Aggregate checks found zero current `display_name=email` rows and no current public onboarding-incomplete rows, but the DB design still requires remediation.

Main contains architecture/change-control docs, review-only SQL/application draft, persona test matrix and current production snapshot under `docs/security/`. Do not expose anonymous member discovery or change profile columns/RPC/policies in production until isolated persona tests and rollback pass.

## Least-privilege blocker — #80
Read-only production metadata confirms multiple public tables/default ACLs grant `anon`/`authenticated` more privileges than required, including structural privileges such as TRUNCATE/TRIGGER/REFERENCES/MAINTAIN. Default ACL exposure applies to both `postgres` and `supabase_admin` owners.

No arbitrary-SQL application RPC, direct PostgREST TRUNCATE endpoint or anon-callable SECURITY DEFINER function was found, so this is not labeled a demonstrated remote wipe. Eighteen SECURITY DEFINER functions are authenticated-callable; seven use empty search path and eleven reviewed older functions use `search_path=public`. Their inspected bodies largely schema-qualify sensitive object references, which lowers migration complexity but does not justify direct production DDL.

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
The #94–#97 PR heads had successful Vercel previews. Current main `925f1776ac3e880f8644a9638a5924bfaf986507` received a Vercel failure that points only to the free-tier build-rate-limit upgrade page. Treat this as infrastructure quota, not a code failure. Do not buy Pro; wait for cooldown and let the next meaningful verified deployment carry main forward. Batch multi-file work into one commit/branch push to conserve builds.

## Priority work remaining
1. Fresh registration/confirmation/password-reset/expired-link/session/sign-out acceptance with a designated disposable test account.
2. Controlled 2-member + moderator/admin journey acceptance, including deny paths and hidden/unrelated users.
3. Implement/test #67 profile safe-column/private-RPC/search remediation in a production-compatible isolated environment.
4. Implement/test #80 table/default-ACL/function least-privilege remediation in isolation.
5. Decide/test #93 draft-media lifecycle.
6. Reconcile enough migration baseline to create production-specific reversible security migrations without replaying history.
7. Correct/unpublish disposable/test content where appropriate.
8. Provide factual operator identity, support contact, retention/deletion process and product decisions for privacy/terms/contact, deletion/export and abuse/blocking.
9. Resolve dependency vulnerability identities: `npm ci` reports 6 findings (2 moderate, 3 high, 1 critical), but current connectors did not expose advisory/package identity. Do not guess or run force-upgrade fixes.
10. Final production-compatible release rehearsal, backup/recovery verification and exact-main smoke after the above gates.

## Cost/change control
Use deterministic CI/tests/builds and existing free infrastructure. Do not trigger paid agents, Vercel upgrade, new credits or a potentially billable Supabase branch. Do not modify production schema/RLS/grants/functions/storage visibility/auth-provider policy/data or public member visibility without isolated evidence, reviewed rollback and an explicit production risk decision.
