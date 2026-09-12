# Afghan Hub current state

## Stage
Public website/discovery and the core member product are shipped. Production `main` is currently `b22a149041cc0fcb2e930bd2c9b79c883863ddf0` after security/delivery hardening through PR #103. That exact main commit has a successful Vercel production deployment. Do not buy or upgrade infrastructure to accelerate routine delivery.

## Recently completed
- Account forms, callback/recovery, stable account error messages and auth route noindex/redirect smoke coverage (#52, #62, #91, #95).
- Recovery/loading/global 404 and release smoke infrastructure (#57, #64, #65, #95).
- Public/mobile/SEO/sitemap and placeholder-content guardrails (#56, #58, #59, #61, #75).
- CI aligned to Node 22/24 and current GitHub Actions (#60, #100).
- Profile privacy preparation: Settings email from Auth, profile access adapter, privacy/search guards, remediation architecture/drafts/persona tests and production snapshot (#69–#72, #83–#87; issue #67).
- Profile save no longer copies account email into public `display_name`; current production aggregate shows zero `display_name = email` rows (#84).
- Member/moderation/submission accessibility and pending/double-submit protection (#76–#78 and related tests).
- Connection, messaging, contribution ownership and RSVP authorization reviewed against production policies/functions; no ownership bypass found in reviewed paths (#79, #82).
- Public-schema least-privilege issue documented with a review-only remediation plan (issue #80, #81).
- Upload hardening: avatar/business/organization media now use stable user-safe provider failures; business/org upload controls are keyboard/focus/aria-live accessible (#94).
- Contribution error hardening: Business/Organization and Event/Opportunity create/update/delete/save/verification paths no longer expose raw database/provider messages; intentional RSVP semantic mapping for `event_full`/`event_has_started` remains (#96, #97).
- Business/Organization verification now uses centralized profile access context instead of direct profile-role reads (#96).
- Next.js and `eslint-config-next` upgraded from 16.2.10 to 16.3.4 with Node 22/24 CI and Vercel verification (#101).
- Residual transitive advisories were traced to tooling dependencies and patched with compatible npm overrides only; `npm audit` now reports **0 vulnerabilities** (#102, #103). No `npm audit fix --force` or major package upgrade was used.
- A production-safe, read-only profile privacy persona harness now exists with a hard stop for production project ref `yussznmwjsvfvpabmwdc` and regression coverage preventing mutation verbs/RPCs. It is intended only for an isolated production-compatible environment.

## Production evidence — aggregate only
- Auth: 3 users; all 3 email-confirmed and all 3 have successful sign-in history. No PII was read.
- Member journey: 2 accepted connections, 2 conversations, 4 memberships, 13 messages, 16 notifications; 13 read / 3 unread; 3 of 4 memberships have `last_read_at`. No message text or identities were read.
- Content status during the last read-only count: 2 pending opportunities, 5 pending events, 2 published opportunities, 1 published event, 1 published business, 2 published organizations.
- Current public profiles: 3; aggregate checks found zero email-fallback display names and zero onboarding-incomplete public profiles at the time checked.

## Authorization paths reviewed clean
- Connection creation validates eligible public/onboarded recipients and duplicate relationships; response is recipient-only/pending-only; deletion is participant-only via RLS with admin exception.
- Direct conversation creation requires an accepted connection. Conversation/message reads require membership; message insert requires membership and `sender_id = auth.uid()`.
- Notification/read-state RPCs scope changes to the authenticated recipient/member.
- Opportunities/events/businesses/organizations enforce creator/author/owner identity through RLS for writes, with intended admin moderation paths.
- Saved opportunities are self-only.
- Event RSVP locks the event row `FOR UPDATE` before capacity enforcement and `(event_id, profile_id)` is the primary key; cancellation is self-only.

## Confirmed profile privacy blocker — issue #67
`public.profiles` has RLS enabled but broad table ACLs and mixes public fields with private/internal fields including `email` and `role`. An authenticated user can directly select public profile rows including private columns; UI projections are not a database boundary. The current DB `search_afghan_hub` profile branch also still contains structural risks (`coalesce(display_name, email)` and no onboarding requirement), although application guards prevent rendering email-like titles and current aggregate data did not trigger that fallback.

Do not expose anonymous member discovery or apply profile-column/RPC/policy changes directly to production. The reviewed solution requires isolated persona testing and an exact rollback first. The read-only persona harness must be run only against an isolated production-compatible target; it explicitly rejects the production project ref.

## Confirmed least-privilege blocker — issue #80
Read-only production metadata shows `anon`/`authenticated` have broader table/default privileges than needed on multiple public objects, including privileges such as `TRUNCATE`, `TRIGGER`, `REFERENCES` and `MAINTAIN`. Default ACL exposure applies to both `postgres` and `supabase_admin` owners.

This is not classified as a demonstrated remote table-wipe exploit: PostgREST does not directly expose TRUNCATE, no arbitrary-SQL application RPC was found, and zero public SECURITY DEFINER functions are executable by `anon`. Eighteen SECURITY DEFINER functions are callable by `authenticated`; seven use an empty `search_path` and eleven older reviewed functions use `search_path=public`. The older definitions inspected largely schema-qualify sensitive references with `public.*`/`auth.*`, making later fixed/empty-search-path hardening more tractable, but production DDL still requires isolated testing.

## Draft-media lifecycle blocker — issue #93
`business-media` and `organization-media` are public buckets with owner-bound writes, configured MIME/size limits, and predictable object paths based on listing UUID. No cross-owner write defect was found. Draft/unpublished media remains public-by-URL if the path becomes known. Decide and test the intended lifecycle before changing bucket visibility/policies.

## Security Advisor
Current read-only warnings:
- `pg_trgm` installed in public;
- 18 authenticated-callable SECURITY DEFINER functions;
- leaked-password protection disabled.

Performance advisor reports 43 unused indexes as INFO only. Do not remove low-usage indexes merely from that signal. Do not enable leaked-password protection without confirming free-plan availability/cost, and do not blanket-revoke core RPCs.

## Migration baseline
Production reports 45 applied migrations. Repo migrations are not a one-to-one baseline: the original July baseline is missing and some later logical migrations have different production timestamps. Never run `db push`, blindly repair migration history or replay the repo migration directory against production. Production security changes must be generated from current metadata, tested in isolation and paired with deterministic rollback.

## Vercel / delivery state
- PR #101 (Next 16.3.4) and PR #103 (residual advisory patches) passed Node 22/24 CI and Vercel before merge.
- Production main `b22a149041cc0fcb2e930bd2c9b79c883863ddf0` has a successful Vercel deployment.
- A later persona-harness preview initially hit the Vercel free-tier build-rate limit. Treat quota responses as infrastructure limits, not code failures. Do not buy Pro or create no-op deployments; batch meaningful changes and retry after cooldown.

## Remaining launch gates
1. Fresh signup/confirmation/password-reset delivery and expired-link/session/cross-tab sign-out acceptance using a designated disposable test account.
2. Controlled multi-persona acceptance with at least two ordinary users plus moderator/admin, including deny paths.
3. Run the read-only profile privacy persona harness against a production-compatible isolated environment, then implement/test profile privacy remediation (#67) there.
4. Implement/test least-privilege/default-ACL/function hardening (#80) in isolation before production.
5. Decide/test draft-media lifecycle (#93).
6. Reconcile enough production migration baseline to generate reversible security migrations without replaying history.
7. Correct or unpublish remaining disposable/test production content where appropriate.
8. Provide factual operator identity/support contact/retention/deletion terms before privacy/terms/contact/account-deletion/export/abuse surfaces can be finalized.
9. Final controlled release rehearsal, backup/recovery verification and exact-main production smoke after the security/product gates above.

## Cost and safety constraints
Prefer deterministic CI/tests/builds and current free infrastructure. Do not trigger token-consuming Autopilot, paid agents, Vercel upgrades or a potentially billable Supabase branch. The existing second Supabase project is not being treated as staging because connector access currently fails authentication. Do not modify production schema/RLS/grants/functions/storage visibility/auth policy/data or expose member data without isolated persona evidence, reviewed rollback and an explicit production risk decision.
