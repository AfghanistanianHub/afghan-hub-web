# Afghan Hub current state

## Current delivery checkpoint — 2026-09-13

Live GitHub reconciliation supersedes the historical checkpoint below. At review time, main is `72f3c28bc38dbb4976951bdf2b263d6bcac41fb5`.

- #115 merged: isolated-only SECURITY DEFINER Phase B rehearsal documentation.
- #116–#118 merged: production smoke semantics and explicit homepage/detail social image metadata.
- #121 merged: light public homepage and real-listing Community Pulse.
- #122 merged: Explore category rail, search panel, listing cards and result states.
- #123 merged: public listing detail hierarchy and next-step sidebar.
- #124 (`design/public-supporting-states`): mission page, matching Explore loading skeleton and listing not-found polish; this checkpoint ships with that PR.
- Reviewed UI head `47386f7a19abea445887190b5fb8f25fdc31a270` passed GitHub Actions run 34744935454 on Node 22 and 24 (install, lint, type check, regression tests, agent syntax and build), and Vercel reported success for that exact head.
- This documentation update requires fresh final-head checks before merge. Verify the resulting main SHA and production deployment after merge; preview success alone does not prove production delivery.

Current milestone: complete delivery of the public visual refresh (#121–#124), with current-head checks and anonymous production smoke. Browser visual acceptance has not been established by CI and remains a separate check.

Next milestone: controlled member/auth acceptance and isolated security rehearsal, subject to the existing launch gates below. UI delivery does not close #67, #80, #93 or #105. Keep zero-cost mode and all production-data/security constraints below.

## Historical security checkpoint (through #108)
Public website/discovery and the core member product are shipped. Production `main` is currently `50c226460ebea259972b0fb21a2ab5637f2be713` after hardening and security-rehearsal work through PR #108. That exact main commit has a successful Vercel production deployment. Continue in zero-cost mode: do not buy or upgrade infrastructure for routine delivery.

## Recently completed
- Account forms, callback/recovery, stable user-safe auth errors, auth-route noindex and redirect smoke coverage (#52, #62, #91, #95).
- Recovery/loading/global 404 and release-smoke infrastructure (#57, #64, #65, #95).
- Public/mobile/SEO/sitemap and placeholder-content guardrails (#56, #58, #59, #61, #75).
- CI aligned to Node 22/24 and current GitHub Actions (#60, #100).
- Profile privacy application seams and guards: Settings email comes from Auth, private profile reads are centralized in `profile-access.ts`, search/UI guards are in place, and direct profile-role dependencies have been reduced (#69–#72, #83–#87).
- Profile save no longer copies account email into public `display_name`; current production aggregate showed zero `display_name = email` rows (#84).
- Member/moderation/submission accessibility and pending/double-submit protection (#76–#78 and related tests).
- Connection, messaging, contribution ownership and RSVP authorization reviewed against production policies/functions; no ownership bypass found in reviewed paths (#79, #82).
- Upload hardening: avatar/business/organization media use stable user-safe provider failures; business/org upload controls are keyboard/focus/aria-live accessible (#94).
- Contribution error hardening: Business/Organization and Event/Opportunity create/update/delete/save/verification paths no longer expose raw provider/database messages; intentional RSVP semantic mapping remains (#96, #97).
- Next.js and `eslint-config-next` upgraded to 16.3.4; compatible transitive overrides reduced `npm audit` to **0 vulnerabilities** (#101–#103).
- A production-blocked, read-only profile privacy persona harness is now on main, with regression coverage forbidding production ref use and mutation verbs/RPCs (#104).
- Production authorization/default-ACL/function exposure snapshots and migration-baseline reconciliation are now documented from current metadata (#106).
- The #67 profile-privacy rehearsal package is complete in docs: forward SQL, exact rollback rehearsal, and the application transition plan for the centralized profile-access adapter (#107).
- The #80 Phase A structural-privilege rehearsal is complete in docs: narrow forward/rollback plans for `TRUNCATE`, `REFERENCES`, `TRIGGER`, and `MAINTAIN` only, on an explicit 12-table postgres-owned application scope (#108).

## Production evidence — aggregate/read-only only
- Auth: 3 users; all 3 email-confirmed and all 3 have successful sign-in history. No PII was read.
- Member journey: 2 accepted connections, 2 conversations, 4 memberships, 13 messages, 16 notifications; 13 read / 3 unread; 3 of 4 memberships have `last_read_at`. No message text or identities were read.
- Current public profiles: 3; prior aggregate checks found zero email-fallback display names and zero onboarding-incomplete public profiles.
- Disposable content audit found 8 obvious test records: 5 draft events, 1 draft opportunity, and 2 published opportunities with exact `test/Test` titles. The two published test opportunities are suppressed from public listing/detail and sitemap by existing placeholder guards. Cleanup is tracked in #105; no production row was modified.

## Authorization paths reviewed clean
- Connection creation validates eligible public/onboarded recipients and duplicate relationships; response is recipient-only/pending-only; deletion is participant-only via RLS with intended admin exception.
- Direct conversation creation requires an accepted connection. Conversation/message reads require membership; message insert requires membership and `sender_id = auth.uid()`.
- Notification/read-state RPCs scope changes to the authenticated recipient/member.
- Opportunities/events/businesses/organizations enforce creator/author/owner identity through RLS for writes, with intended moderation paths.
- Saved opportunities are self-only.
- Event RSVP locks the event row `FOR UPDATE` before capacity enforcement and `(event_id, profile_id)` is the primary key; cancellation is self-only.

## Confirmed profile privacy blocker — issue #67
`public.profiles` has RLS enabled but broad relation grants and mixes public profile fields with private/internal fields including `email` and `role`. UI `.select(...)` projections are not a database privacy boundary. Production `search_afghan_hub` also still structurally contains an email fallback and lacks the onboarding-completed requirement in its profile branch.

The design/rehearsal work is now complete enough to test rather than speculate:
- current production authorization snapshot;
- exact rollback snapshot;
- forward rehearsal SQL;
- application transition plan for `profile-access.ts` and generated DB function types;
- read-only persona matrix/harness with a hard production stop.

Do not apply #67 to production until it passes in an isolated production-compatible database and the persona matrix + rollback are verified.

## Confirmed least-privilege blocker — issue #80
Current production metadata confirms application roles have broader table/default privileges than needed. No arbitrary-SQL application RPC, direct PostgREST TRUNCATE endpoint, or anon-callable SECURITY DEFINER function was found, so this is not classified as a demonstrated remote table-wipe exploit.

The #80 scope is now materially clearer:
- production is PostgreSQL 17.6;
- 12 current application tables in `public` are postgres-owned;
- 31 `public` objects owned by `supabase_admin` are all extension-owned functions, so platform/pg_trgm objects are excluded from app remediation;
- the current postgres session cannot safely alter `supabase_admin` default privileges;
- Phase A forward/rollback docs remove/restore only structural privileges (`TRUNCATE`, `REFERENCES`, `TRIGGER`, `MAINTAIN`) while deliberately leaving DML, RLS and function EXECUTE grants untouched.

Later #80 phases can address unnecessary direct DML grants and SECURITY DEFINER/search-path hardening separately after isolated testing.

## Draft-media lifecycle — issue #93
`business-media` and `organization-media` buckets are public and owner-bound for writes. Draft media would be public-by-URL if the object path became known. A current aggregate impact check found **0 non-published businesses and 0 non-published organizations**, therefore there is no current draft-media exposure in production. Treat #93 as a future lifecycle design decision rather than an active data-leak blocker.

## Security advisor / platform notes
Read-only warnings include `pg_trgm` installed in `public`, authenticated-callable SECURITY DEFINER functions, and leaked-password protection disabled. Performance advisor reports unused-index INFO findings only. Do not blanket-revoke functions, move extension objects, remove low-usage indexes, or enable plan-dependent password protection without compatibility/cost review.

## Migration baseline — reconciled enough for reversible security work
Production reports 45 applied migrations while the repo has 29 migration files. The mismatch is now documented: missing July baseline, repo-only August files, timestamp-divergent logical matches, and production-only entries. Never run `db push`, blindly repair history, or replay the repo migration directory against production.

For #67/#80, **current production metadata + same-window rollback snapshot** is the source of truth. Historical migration-history repair is no longer a prerequisite to designing a reversible security change.

## Delivery state
- PR #104, #106, #107 and #108 all passed exact-head Vercel checks before merge.
- Their GitHub CI gates passed Node 22 and Node 24 install/lint/typecheck/regression/syntax/build where applicable.
- Production main `50c226460ebea259972b0fb21a2ab5637f2be713` has a successful Vercel deployment.
- Do not create no-op deployments or buy Vercel Pro to bypass free-tier build limits; batch meaningful changes.

## Remaining launch gates
1. Fresh signup/confirmation/password-reset delivery and expired-link/session/cross-tab sign-out acceptance using a designated disposable test account.
2. Controlled multi-persona acceptance with at least two ordinary users plus moderator/admin, including deny paths.
3. Obtain a trustworthy production-compatible isolated database target, then run the read-only #67 persona harness and rehearse the #67 forward/rollback/application transition there.
4. Rehearse #80 Phase A and later least-privilege/function-hardening phases in isolation before any production DDL.
5. Decide the long-term #93 draft-media lifecycle before draft business/organization media is used in production.
6. Review and clean confirmed disposable/test production content (#105) only with deliberate production-content approval.
7. Provide factual operator identity, support contact, retention/deletion process and product decisions for privacy/terms/contact, deletion/export and abuse/blocking surfaces.
8. Final release rehearsal, backup/recovery verification and exact-main production smoke after the security/product gates above.

## Cost and safety constraints
Prefer deterministic CI/tests/builds and current free infrastructure. Do not trigger token-consuming Autopilot, paid agents, Vercel upgrades, new credits or a potentially billable Supabase branch. The existing second Supabase project is not treated as staging because connector access has failed authentication. Do not modify production schema/RLS/grants/functions/storage visibility/auth policy/data or expose member data without isolated evidence, reviewed rollback and an explicit production risk decision.
