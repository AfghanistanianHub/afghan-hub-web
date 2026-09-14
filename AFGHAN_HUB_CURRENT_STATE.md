# Afghan Hub current state

## Authoritative checkpoint — 2026-09-14

This file is the concise continuation checkpoint. Detailed evidence lives in the linked GitHub issues/PRs and security runbooks. Verify live `main`, CI and deployments when resuming; do not infer completion from historical checkpoints alone.

## Delivered

- Public visual refresh is shipped across homepage, Explore, listing detail, mission and supporting states.
- #67 profile privacy is closed. Production uses narrowed profile access and safe access-context/admin RPCs; ordinary members cannot directly select private profile email/role data.
- #93 media privacy is closed. Business/organization media uses the intended private storage/access boundary.
- #99 launch privacy/terms/support dependency is closed. `/privacy`, `/terms` and `/support` are published with confirmed operator `SAM Azad` and `info@apnbc.ca`; links exist in public/footer/auth/settings surfaces.
- Scoped account/profile JSON self-export is shipped via the protected same-origin account export route. Broader export/deletion policy remains post-launch work in #132.
- #80 Phase A structural privilege hardening is in the target production state: the 12 application tables no longer expose `TRUNCATE`, `REFERENCES`, `TRIGGER` or `MAINTAIN` to `anon`/`authenticated`, and the isolated PostgreSQL 17 forward/rollback rehearsal is merged.
- #80 Phase B direct-DML forward/rollback rehearsal is merged (#138). Production Phase B authorization has **not** been executed.
- #134 SECURITY DEFINER review classified the 20 authenticated-callable functions. All are closed to `anon` and contain identity/role/ownership boundaries. Ten already use an empty search path; the remaining ten `search_path=public` functions now have a narrow reversible hardening rehearsal merged in #146. No production function alteration has been executed from that rehearsal.
- Acceptance tooling is substantially expanded:
  - `npm run acceptance:auth` — guarded account/session checks.
  - `npm run acceptance:member-pair` — read-only Member A/B safe-discovery/privacy/isolation preflight, merged in #143.
  - `npm run acceptance:journey` — guarded connection/messaging/notification/read-state journey, merged in #145. It defaults to plan mode; write mode requires explicit acknowledgements and generates exact assertion-guarded cleanup material.
- Production connection/message notification trigger behavior was re-verified read-only: connection request, connection accepted and new-message notifications are created by dedicated trigger functions with empty search paths.

## Current launch / security gates

1. **#120 hosted acceptance remains open.** The harnesses are shipped, but the production write journey has not been executed. Required evidence still includes designated disposable accounts, reviewed cleanup after any write run, browser/mailbox signup-reset-session checks, and the remaining moderator/admin/content/RSVP portions.
2. **#136 / #80 Phase B** remains blocked from production authorization until the relevant controlled hosted acceptance succeeds. Do not apply the prepared direct-DML REVOKEs merely because the rehearsal docs exist.
3. **#134 search-path production hardening** remains unexecuted. The forward/rollback package for the ten legacy `search_path=public` SECURITY DEFINER RPCs is prepared; run persona behavior/deny checks before any authorized production ALTER FUNCTION.
4. **#135 platform/Auth hardening** remains open: leaked-password protection is disabled and `pg_trgm` is installed in `public`. Do not move/recreate the extension or change Auth configuration without impact verification.
5. **#105 production content hygiene** remains open. Previously identified placeholder/test records must not be deleted or unpublished until their disposable status is deliberately confirmed.
6. **#132 post-launch privacy operations** remains open for retention schedules, deletion lifecycle, request SLAs, governing jurisdiction and broader export scope. It is not the old #99 launch blocker.
7. Final exact-main browser smoke/release rehearsal and recovery/backup evidence are still required before declaring the entire project complete.

## Acceptance target constraints

- Afghan Hub Production project: `yussznmwjsvfvpabmwdc`.
- The secondary Supabase project `rurgmyiiytesknsfwjjl` is reachable and healthy but is **not production-compatible**. It lacks at least `notifications` and `event_rsvps`, and several shared tables have fewer columns than production. Do not treat it as final staging evidence unless it is deliberately refreshed and re-qualified.
- Do not mutate the secondary project simply to make a test pass without a deliberate schema plan.
- Do not test production using unrelated real members or inspect unrelated private content.

## In-progress / next work

- #147 is preparing a disposable event/RSVP acceptance harness. Its write mode is intentionally hard-blocked on production and should be exercised only on a production-compatible isolated target. At the time of this checkpoint its PR may still be pending CI/merge; verify live status before continuing.
- After the RSVP harness, the next remaining #120 automation surface is controlled content-owner/moderator/admin acceptance. Keep role-changing/admin-positive tests isolated from real accounts.
- Continue reducing review-only work by turning accepted designs into executable, guarded tests where a safe target exists.

## Operating constraints

- Zero-cost mode: no paid branches, purchased credits or unnecessary paid infrastructure.
- Do not blindly replay repository migrations, run `db push` against production, repair the production ledger by guesswork, or assume repository migration history exactly matches production.
- Current production metadata and same-window rollback evidence govern security changes.
- Preserve profile privacy, media privacy, RLS and explicit authorization boundaries. No blanket grant, blanket function revoke, Auth weakening, production reset or service-role exposure for test convenience.
- Production mutations require the applicable acceptance evidence, exact scope, rollback/cleanup plan and explicit risk decision.
- Never commit passwords, tokens, cookies, reset/confirmation links or service-role credentials. Acceptance logs/issues should contain persona labels and non-sensitive pass/fail evidence only.
- Keep detailed issue evidence current: #80, #105, #120, #132, #134, #135, #136, #137 and #147.
