# Afghan Hub current state

## Authoritative checkpoint — 2026-09-14

This is the concise continuation checkpoint. Detailed evidence remains in GitHub issues/PRs and the security/operations/privacy runbooks. Always verify live `main`, CI and deployments when resuming.

## Product / visual state

The visual/product track is now a first-class project track, not a launch-afterthought. The light teal/sand direction remains the design system; dark-first and harsh-green treatments are intentionally avoided.

Shipped visual passes:

- #180 — public home: community constellation hero, category navigation, live community-pulse mosaic and editorial section rhythm.
- #182 — member dashboard: compact command center, live opportunity/event signals, varied action grid, opportunity cards and event timeline.
- #184 — login/join: desktop split experience with Afghan Hub community identity while mobile stays a focused form flow. The initial CI regression caused by the new icon import was fixed by stubbing only the visual dependency; auth/password assertions remained intact.
- #186 — all four listing detail types: opportunity, event, business and organization now use stronger hero/meta/action hierarchy and less document-like long-form treatment.
- #188 — profile/network: profile editing is a grouped community-identity builder; Network has stronger live hierarchy and discovery context while existing connection behavior remains unchanged.
- #190 — password recovery/settings consistency: Forgot/Reset now match the refreshed auth language; Settings is organized as Identity / Privacy / Data / Help.

Already-good card-oriented surfaces such as Messages, Member Directory, Saved Opportunities and Search were audited and are not being redesigned merely for churn. Future visual work should target genuine hierarchy/consistency gaps, loading/error/empty states and remaining secondary surfaces rather than changing already-strong screens without cause.

No visual pass above changed schema, RLS, Auth behavior, moderation/owner permissions or application data semantics.

## Delivered security / privacy / operations

- #67 profile privacy and #93 media privacy are closed. Private profile/media access boundaries are enforced.
- #99 launch privacy/terms/support surfaces are shipped; account/profile JSON self-export is available.
- #105 production placeholder-content cleanup is complete under exact-ID authorization.
- #80 Phase A structural privilege hardening is in the target production state; #138 contains the rehearsed Phase B direct-DML package, still unexecuted in production.
- #134 SECURITY DEFINER review covers all 20 advisor-flagged authenticated-callable functions; reversible search-path hardening is rehearsed in #146 but not applied to production.
- #135 `pg_trgm` relocation is rehearsed in #150 but not applied to production. Free-plan leaked-password protection remains unavailable; the application password baseline shipped in #154.
- #137 Data API default-grant hardening is closed completed. #151 enforces RLS plus explicit anon/authenticated GRANT/REVOKE decisions for new public tables. Read-only production/secondary verification showed the controlled migration path executes as `postgres`, newly created migration objects are owned by `postgres`, and the `postgres` public-table default ACL is limited to `postgres` + `service_role`.
- Secondary acceptance refresh is complete (#159/#160/#162/#163/#164). The secondary project has the launch-critical RLS/RPC/trigger surface for connections, conversations, messaging, notifications/read-state, saves, RSVP, content-owner, moderator and admin acceptance. No production DDL/data mutation occurred during that refresh.
- Internal function ACL cleanup on secondary removed accidental PUBLIC/anon/authenticated execution from internal-only helpers such as `handle_new_user()` and `rls_auto_enable()`.
- Zero-cost release/recovery tooling is shipped via #169/#166: manual anonymous production smoke, `npm run backup:free-plan`, credential-minimized backup metadata/checksums and isolated restore guidance.
- #171/#172 document the live deletion dependency map and safe account-deletion lifecycle. Storage objects must be inventoried/deleted before owning app/profile rows; Auth identity is last. No self-service destructive deletion endpoint was added.

## Acceptance tooling on main

Available commands:

- `npm run acceptance:auth`
- `npm run acceptance:member-pair`
- `npm run acceptance:journey`
- `npm run acceptance:rsvp`
- `npm run acceptance:roles`
- `npm run security:qualify-target`

#192 adds a manual-only GitHub Actions hosted-acceptance workflow for the secondary project:

- hard-pinned to secondary `rurgmyiiytesknsfwjjl`; production is not selectable;
- disposable Member A/B plus optional Member C/moderator/admin credentials come only from GitHub Secrets;
- defaults journey and RSVP to plan/read-only mode;
- explicit workflow inputs are required for non-production writes;
- isolated-target qualification and role-persona preflight run before write acceptance;
- member-journey write mode preserves the exact manifest/cleanup SQL as a short-retention artifact;
- CI guards manual-only, secondary-only, secret-only and cleanup-artifact behavior.

The connector cannot safely create Supabase Auth users, and direct inserts into `auth.users` remain prohibited. Existing secondary accounts are inventory only and must not be assumed disposable.

## Current launch / security gates

1. **#120 hosted acceptance remains the main behavioral gate.** Schema/workflow readiness is complete, but execution still requires explicitly designated disposable Member A/B credentials and, for positive privileged paths, designated moderator/admin personas. Do not repurpose unrelated real accounts.
2. **#136 / #80 Phase B** remains blocked from production GRANT/REVOKE until the relevant controlled hosted acceptance succeeds.
3. **#134 search-path production hardening** remains unexecuted until persona/member/moderator/admin behavior and deny paths are verified.
4. **#135 platform/Auth hardening** remains partially constrained by plan/change control. `pg_trgm` relocation still needs separate production authorization; leaked-password protection requires Supabase Pro.
5. **#132 post-launch privacy operations remains open.** Remaining policy decisions include retention periods, deletion response target/SLA, governing jurisdiction, shared-content preservation/anonymization, abuse-evidence retention and broader export scope.
6. **#152 repository hardening** remains open. `main` is unprotected; the private-repo ruleset path requires a paid/public-repo change and the connector lacks repository-admin writes. Zero-cost mode leaves this as an operational gap.
7. **Release/recovery evidence remains partially operational.** The manual production smoke workflow is shipped but cannot be dispatched through the current connector. A real logical backup/restore rehearsal still requires operator DB credentials and an explicitly isolated disposable restore target.

## Privacy operations state

- Current self-export intentionally contains only `account` + `profile`; it excludes conversations, messages, connections, listings, saved opportunities, RSVPs and uploaded file contents.
- Broader export is not being added blindly because shared messages/content contain data about other members.
- Until a disposable deletion rehearsal proves the full lifecycle, account deletion remains a verified-support workflow and production profile/Auth deletion is prohibited as a shortcut.
- Safe ordering: verify request -> lock exact target UUID -> inventory app/Storage data -> delete exact Storage objects first -> guarded app/profile cleanup -> delete Auth identity last -> post-delete verification.

## Acceptance target state

- Production: `yussznmwjsvfvpabmwdc` — source of truth; untouched by secondary acceptance-refresh and visual work.
- Secondary: `rurgmyiiytesknsfwjjl` — schema-compatible and workflow-ready for controlled non-production behavioral acceptance.
- Secondary aggregate role availability was last observed as 1 admin / 1 moderator / 4 members. This is inventory only; identities were not inspected and these are not automatically disposable personas.

## Backup / recovery constraints

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
- Visual work must preserve the modern/minimal/light Afghan Hub product identity and should improve genuine weak surfaces rather than redesign for churn.

## Verified application / operations checkpoint before this documentation-only update

- Application/ops main SHA: `3a441a1d178fc1345dd60ba76f13d778c4b85716` (#192 squash merge).
- PR CI for #190 and #192: Node 22 + Node 24 **success**.
- Vercel combined status for exact SHA `3a441a1d178f...`: **success**.
- Because this file is updated through a documentation-only PR, live `main` after that PR will naturally have a newer docs SHA; do not treat this section as a permanent branch-head pointer.