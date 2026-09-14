# Afghan Hub current state

## Authoritative checkpoint — 2026-09-14

This is the concise continuation checkpoint. Detailed evidence remains in GitHub issues/PRs and the security runbooks. Always verify live `main`, CI and deployments when resuming.

## Delivered

- Public visual refresh is shipped across homepage, Explore, listing detail, mission and supporting states.
- #67 profile privacy is closed. Production uses narrowed profile access and safe access-context/admin RPCs; ordinary members cannot directly select private profile email/role data.
- #93 media privacy is closed. Business/organization media uses the intended private storage/access boundary.
- #99 launch privacy/terms/support dependency is closed. `/privacy`, `/terms` and `/support` publish the confirmed operator/support facts and link from public/auth/settings surfaces.
- Scoped account/profile JSON self-export is shipped. Broader export/deletion policy remains in #132.
- #105 production hygiene is complete. After explicit operator authorization, exactly five draft `test` events and three `test`/`Test` opportunities were deleted using ID/title/status/owner assertions. A follow-up production query returned zero remaining placeholder records in the checked title set.
- #80 Phase A structural privilege hardening is in the target production state: the 12 application tables no longer expose `TRUNCATE`, `REFERENCES`, `TRIGGER` or `MAINTAIN` to `anon`/`authenticated`; the executable PostgreSQL 17 rehearsal is merged.
- #80 Phase B direct-DML forward/rollback rehearsal is merged (#138). Production Phase B authorization has not been executed.
- #134 SECURITY DEFINER review covers all 20 advisor-flagged authenticated-callable functions. All are closed to `anon` and contain caller/role boundaries. Ten already use empty search paths. The other ten have schema-qualified app references and a reversible `search_path=''` rehearsal merged in #146. No production ALTER FUNCTION has been executed.
- #135 `pg_trgm` review found version 1.6 in `public`, `extrelocatable=true`, with no discovered application/index dependencies. Reversible relocation rehearsal is merged in #150; no production extension DDL has been executed.
- #137 future Data API grant behavior is guarded in CI (#151): migrations from the 2026-09-14 checkpoint forward that create a `public` table must enable RLS and explicitly address both `anon` and `authenticated` privileges. Synthetic pass/fail tests run on Node 22/24.
- #153 is closed via #154. Because Supabase leaked-password protection is Pro-only while Afghan-Hub Org is on Free, signup and password reset now share a zero-cost application policy: minimum 12 characters and at least 3 of 4 groups (lowercase, uppercase, digit, symbol). Existing sign-in is intentionally not retroactively blocked. This is a mitigation, not a replacement for leaked-password checking.
- Acceptance tooling on `main`:
  - `npm run acceptance:auth` — guarded account/session checks.
  - `npm run acceptance:member-pair` — read-only Member A/B preflight (#143).
  - `npm run acceptance:journey` — guarded connection/messaging/notification/read-state journey with exact cleanup material (#145).
  - `npm run acceptance:rsvp` — self-cleaning non-production RSVP journey, hard-blocked from production write mode (#148).

## Current launch / security gates

1. **#120 hosted acceptance remains the main behavioral gate.** Tooling exists, but full hosted evidence with designated disposable accounts/mailbox is incomplete. Do not use unrelated real members.
2. **#136 / #80 Phase B** remains blocked from production GRANT/REVOKE until the relevant controlled hosted acceptance succeeds.
3. **#134 search-path production hardening** remains unexecuted. The ten candidate functions are schema-qualified, but persona/member/moderator/admin behavior and deny paths must be verified before production ALTER FUNCTION.
4. **#135 platform/Auth hardening** remains partially constrained by plan and change control. Leaked-password protection requires Supabase Pro; the Free-plan application password baseline is shipped. `pg_trgm` relocation has a rehearsal but still needs separate production authorization.
5. **#132 post-launch privacy operations** remains open for retention, deletion lifecycle, response targets, jurisdiction and broader export scope.
6. **#152 repository hardening** remains open. GitHub API inspection showed `main` is currently unprotected with no required status checks. The current connector cannot safely change branch-protection administration.
7. Final exact-main browser smoke/release rehearsal and backup/recovery evidence are still required before declaring the entire project complete.

## Acceptance target constraints

- Afghan Hub Production: `yussznmwjsvfvpabmwdc`.
- Secondary Supabase project `rurgmyiiytesknsfwjjl` is reachable but not production-compatible: it lacks at least `notifications` and `event_rsvps` and several tables differ from production. Do not treat it as final staging evidence unless deliberately refreshed and re-qualified.
- Do not mutate the secondary project merely to make a test pass.
- Never test production with unrelated real members or inspect unrelated private content.

## Operating constraints

- Zero-cost mode: no paid branches, purchased credits, Pro upgrade, or unnecessary paid infrastructure unless explicitly approved.
- Do not blindly replay repo migrations, run `db push` against production, or repair migration history by guesswork. Production metadata and same-window rollback evidence govern security changes.
- Preserve profile/media privacy, RLS and explicit authorization boundaries. No blanket grants/revokes, Auth weakening, production resets or service-role exposure for test convenience.
- Production mutations require exact scope, applicable acceptance evidence, rollback/cleanup and explicit authorization.
- Never commit passwords, tokens, cookies, reset/confirmation links or service-role credentials.
- Keep detailed issue evidence current: #80, #120, #132, #134, #135, #136, #137 and #152.
