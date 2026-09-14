# Afghan Hub current state

## Authoritative checkpoint — 2026-09-14

This is the concise continuation checkpoint. Detailed evidence remains in GitHub issues/PRs and the security/operations/privacy runbooks. Always verify live `main`, CI and deployments when resuming.

## Delivered

- Public visual refresh is shipped across homepage, Explore, listing detail, mission and supporting states.
- #67 profile privacy and #93 media privacy are closed. Private profile/media access boundaries are enforced.
- #99 launch privacy/terms/support surfaces are shipped; account/profile JSON self-export is available.
- #105 production placeholder-content cleanup is complete under exact-ID authorization.
- #80 Phase A structural privilege hardening is in the target production state; #138 contains the rehearsed Phase B direct-DML package, still unexecuted in production.
- #134 SECURITY DEFINER review covers all 20 advisor-flagged authenticated-callable functions; reversible search-path hardening is rehearsed in #146 but not applied to production.
- #135 `pg_trgm` relocation is rehearsed in #150 but not applied to production. Free-plan leaked-password protection remains unavailable; the application password baseline shipped in #154.
- #137 Data API default-grant hardening is **closed completed**. #151 enforces RLS plus explicit anon/authenticated GRANT/REVOKE decisions for new public tables. Read-only production/secondary verification showed the controlled migration path executes as `postgres`, newly created migration objects are owned by `postgres`, and the `postgres` public-table default ACL is limited to `postgres` + `service_role`. Afghan Hub therefore does not depend on Supabase automatic Data API grants for future app migrations.
- Acceptance tooling on `main`:
  - `npm run acceptance:auth`
  - `npm run acceptance:member-pair`
  - `npm run acceptance:journey`
  - `npm run acceptance:rsvp`
  - `npm run acceptance:roles`
- Secondary acceptance target refresh is complete (#159/#160/#162/#163/#164). The secondary project now has the launch-critical RLS/RPC/trigger surface for member connections, conversations, messaging, notifications/read-state, saves, RSVP, content-owner, moderator and admin acceptance. No production DDL/data mutation occurred during that refresh.
- Zero-cost release/recovery tooling is shipped via #169/#166:
  - manual-only, anonymous/read-only `Production release smoke` workflow;
  - `npm run backup:free-plan` logical Supabase dump helper;
  - git-ignored backup output, `umask 077`, checksums and no DB URL in backup metadata;
  - encrypted off-site / isolated restore guidance in `docs/operations/free-plan-backup-recovery.md`.
- #171 is closed via #172. `docs/privacy/account-deletion-operations.md` now records the live production deletion dependency map and safe lifecycle ordering. CI also guards against introducing a member-facing direct Supabase Admin `deleteUser` primitive.
  - Current profile deletion cascades through substantial member-linked application data, including messages/conversations, connections, notifications, saves, RSVPs and owner/creator listing rows.
  - `auth.users` has only the create-profile INSERT trigger; there is no automatic account-delete cleanup trigger.
  - Storage ownership is policy/path-based rather than FK-coupled, so Storage objects must be inventoried and deleted **before** owning app rows/profile are removed.
  - No self-service deletion endpoint or production deletion was added.

## Current launch / security gates

1. **#120 hosted acceptance remains the main behavioral gate.** The secondary target is schema-compatible, but execution still requires explicitly designated disposable Member A/B + moderator/admin credentials/personas. Do not repurpose unrelated real accounts.
2. **#136 / #80 Phase B** remains blocked from production GRANT/REVOKE until the relevant controlled hosted acceptance succeeds.
3. **#134 search-path production hardening** remains unexecuted until persona/member/moderator/admin behavior and deny paths are verified.
4. **#135 platform/Auth hardening** remains partially constrained by plan/change control. `pg_trgm` relocation still needs separate production authorization; leaked-password protection requires Supabase Pro.
5. **#132 post-launch privacy operations remains open**, but its technical deletion dependency/Storage cleanup portion is now documented and CI-guarded. Remaining policy decisions are retention periods, deletion response target/SLA, governing jurisdiction, shared-content preservation/anonymization rules, abuse-evidence retention and broader export scope.
6. **#152 repository hardening** remains open. `main` is unprotected; the private-repo ruleset path requires a paid/public-repo change and the connector lacks repository-admin writes. Zero-cost mode leaves this as an operational gap.
7. **Release/recovery evidence remains partially operational.** The manual production smoke workflow is shipped but cannot be dispatched through the current connector. A real logical backup/restore rehearsal still requires operator DB credentials and an explicitly isolated disposable restore target.

## Privacy operations state

- Current self-export intentionally contains only `account` + `profile`; it explicitly excludes conversations, messages, connections, listings, saved opportunities, RSVPs and uploaded file contents.
- Broader export is not being added blindly because shared messages/content contain data about other members.
- Until a disposable deletion rehearsal proves the full lifecycle, account deletion remains a verified-support workflow and production profile/Auth deletion is prohibited as a shortcut.
- Safe future ordering is: verify request -> lock exact target UUID -> inventory app/Storage data -> delete exact Storage objects first -> guarded app/profile cleanup -> delete Auth identity last -> post-delete verification.

## Acceptance target state

- Production: `yussznmwjsvfvpabmwdc` — source of truth; untouched by the secondary refresh/privacy guardrail work.
- Secondary: `rurgmyiiytesknsfwjjl` — schema-compatible for controlled non-production behavioral acceptance.
- Secondary aggregate role availability was last observed as 1 admin / 1 moderator / 4 members. This is inventory only; identities were not inspected and these are not automatically disposable personas.

## Backup/recovery constraints

- Supabase Free has no automatic backups/PITR. Zero-cost recovery depends on regular logical dumps stored encrypted/off-site.
- Database logical dumps do not contain Storage object bytes; object-storage backup needs a separate procedure if those objects become irreplaceable.
- Never restore over production merely to prove the backup procedure.

## Operating constraints

- Zero-cost mode: no paid branches, purchased credits, Pro upgrade or unnecessary paid infrastructure unless explicitly approved.
- Do not blindly replay migrations, run remote destructive reset/db-push shortcuts, or repair migration history by guesswork.
- Preserve profile/media privacy, RLS and explicit authorization boundaries.
- Production mutations require exact scope, applicable acceptance evidence, rollback/cleanup and explicit authorization.
- Never commit passwords, tokens, cookies, reset/confirmation links, DB URLs or service-role credentials.
- Keep detailed issue evidence current: #80, #120, #132, #134, #135, #136 and #152.

## Exact main at this checkpoint

- `main`: `927fd202f048343ded33c064e7f7181e9a638306` (#172 squash merge).
- Node 22 + Node 24 checks for #172: **success**.
- Vercel combined status for exact main SHA `927fd202...`: **success**.
