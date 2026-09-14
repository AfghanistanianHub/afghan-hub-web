# Afghan Hub current state

## Authoritative checkpoint — 2026-09-14

This is the concise continuation checkpoint. Detailed evidence remains in GitHub issues/PRs and the security/operations runbooks. Always verify live `main`, CI and deployments when resuming.

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
  - `npm run acceptance:roles` — publishable-key-only member/moderator/admin role preflight with no application-data write path (#157).
- Secondary acceptance-target refresh is complete:
  - #160 locked the exact stale secondary baseline with read-only assertions and rollback-safety checks.
  - #162 shipped guarded role/moderation/RSVP forward + rollback packages; after Node 22/24, isolated rehearsal and Vercel passed, the forward package was applied to the non-production secondary target and post-forward assertions passed.
  - Secondary `handle_new_user()` and `rls_auto_enable()` EXECUTE ACLs were aligned with production (`postgres`/`service_role` only), removing anonymous SECURITY DEFINER exposure on those helpers.
  - #164 shipped guarded messaging acceptance forward + rollback packages. After Node 22/24, isolated rehearsal and Vercel passed, the messaging forward package was applied to secondary and `secondary_messaging_forward_assertions_passed`.
  - The secondary target now has the launch-critical RLS/RPC/trigger surface for member connections, conversations, messages, notifications/read-state, saves, RSVP, content-owner, moderator and admin acceptance.
  - Post-sync Secondary Security Advisor no longer reports `rls_enabled_no_policy` findings on the messaging/save tables.
  - #159 and #163 are closed completed. No production DDL/data mutation occurred during the secondary refresh.
- Zero-cost release/recovery tooling is shipped via #169 / #166:
  - manual-only `Production release smoke` GitHub Actions workflow; anonymous/read-only, secret-free, `contents: read`, no schedule/cron;
  - `npm run backup:free-plan` wraps the official Supabase CLI roles/schema/data logical dump flow;
  - backup output defaults to git-ignored `/backups/`, uses `umask 077`, writes checksums, and does not write the DB connection string into backup metadata;
  - `docs/operations/free-plan-backup-recovery.md` documents encrypted off-site storage and isolated restore rehearsal only;
  - CI regression tests guard this release/backup safety contract.

## Current launch / security gates

1. **#120 hosted acceptance is open and remains the main behavioral gate.** It was reopened after an earlier inconsistent closed state. The secondary target is schema-compatible, but actual behavioral evidence still requires explicitly designated disposable credentials/personas. Do not repurpose unrelated real accounts. Run Member A/B, messaging, RSVP and role journeys only with designated disposable personas and clean exact fixture IDs.
2. **#136 / #80 Phase B** remains blocked from production GRANT/REVOKE until the relevant controlled hosted acceptance succeeds.
3. **#134 search-path production hardening** remains unexecuted. The ten candidate functions are schema-qualified, but persona/member/moderator/admin behavior and deny paths must be verified before production ALTER FUNCTION.
4. **#135 platform/Auth hardening** remains partially constrained by plan and change control. Leaked-password protection requires Supabase Pro; the Free-plan application password baseline is shipped. `pg_trgm` relocation has a rehearsal but still needs separate production authorization.
5. **#132 post-launch privacy operations** remains open for retention, deletion lifecycle, response targets, jurisdiction and broader export scope.
6. **#152 repository hardening** remains open. `main` is not protected; GitHub ruleset/branch-protection administration is unavailable through the current connector and the current private-repo plan path returned a paid/public-repo requirement. No upgrade is being made in zero-cost mode.
7. **Release/recovery evidence remains partially operational.** The manual production smoke workflow is shipped but has not yet been dispatched from the current connector because no workflow-dispatch write action is exposed. A real logical backup/restore rehearsal also still requires an operator-supplied production DB connection string and an explicitly isolated disposable restore target. Do not claim either evidence until actually executed.

## Acceptance target state

- Afghan Hub Production: `yussznmwjsvfvpabmwdc`. Production remains the source of truth and was not mutated during the secondary refresh or release-readiness tooling work.
- Secondary Supabase project: `rurgmyiiytesknsfwjjl`.
- Secondary is deliberately refreshed and schema-compatible for the launch-critical acceptance surface. It is suitable for controlled non-production behavioral acceptance, subject to using explicitly designated disposable credentials.
- Secondary aggregate role availability was last observed as 1 admin / 1 moderator / 4 members. This is inventory only; identities were not inspected and these accounts are not automatically considered disposable.
- Known remaining secondary advisor warnings are not refresh blockers: `pg_trgm` in `public`, intentional authenticated SECURITY DEFINER application RPCs, and leaked-password protection unavailable on the current Free plan.
- Never test production with unrelated real members or inspect unrelated private content.

## Backup/recovery constraints

- Supabase Free does not include automatic backups or PITR. The zero-cost operational path is regular logical `supabase db dump` exports stored encrypted and off-site.
- A database logical dump does not contain Storage object bytes; object-storage backup needs a separate procedure if those objects become irreplaceable.
- The current Supabase connector does not expose a direct backup-download/restore evidence operation.
- Never restore over production merely to prove the backup procedure.

## Operating constraints

- Zero-cost mode: no paid branches, purchased credits, Pro upgrade, or unnecessary paid infrastructure unless explicitly approved.
- Do not blindly replay repo migrations, run `db push` against production, or repair migration history by guesswork. Production metadata and same-window rollback evidence govern security changes.
- Preserve profile/media privacy, RLS and explicit authorization boundaries. No blanket grants/revokes, Auth weakening, production resets or service-role exposure for test convenience.
- Production mutations require exact scope, applicable acceptance evidence, rollback/cleanup and explicit authorization.
- Never commit passwords, tokens, cookies, reset/confirmation links, database URLs or service-role credentials.
- Keep detailed issue evidence current: #80, #120, #132, #134, #135, #136, #137 and #152.

## Exact main at this checkpoint

- `main`: `750291f7bfecda5c1cd6b26d554842f5a42629a9` (#169 squash merge).
- Node 22 + Node 24 checks for #169: **success**.
- Vercel combined status for exact main SHA `750291f7...`: **success**.
