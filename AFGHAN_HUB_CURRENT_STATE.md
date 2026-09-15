# Afghan Hub current state

## Authoritative checkpoint — 2026-09-15

This is the concise continuation checkpoint for Afghan Hub. Detailed evidence remains in GitHub issues/PRs and Supabase advisor/migration records. When resuming, verify live `main`, CI and exact-main Vercel status before mutating anything.

## Product / visual state

The product uses a modern, minimal, light visual system. Dark-first and harsh/bright-green treatments remain intentionally avoided. The site should feel like a contemporary community/product platform rather than a text directory.

Shipped visual/product passes include:

- #180 public home;
- #182 dashboard command center;
- #184 login/join identity;
- #186 listing detail hierarchy;
- #188 profile/network;
- #190 recovery/settings;
- #194 loading/recovery/404 alignment;
- #195 dashboard navigation active hierarchy and mobile parity.

#195 is merged and deployed. Messages, Member Directory, Saved Opportunities, Search, Moderation and My Submissions have already been audited as sufficiently strong; do not redesign them merely for churn.

## Secondary acceptance environment

Secondary Supabase: `rurgmyiiytesknsfwjjl`.
Production source of truth: `yussznmwjsvfvpabmwdc`.

Secondary has been aligned for the launch-critical acceptance surface without production mutation:

- all 12 launch tables have RLS enabled and production-equivalent policy counts;
- workflow-critical connection/messaging/RSVP/moderation RPC semantics are aligned;
- Realtime publication contains `conversation_members`, `messages` and `notifications`;
- Storage has all three expected buckets (`avatars`, `business-media`, `organization-media`) with exact production-equivalent configuration and policy fingerprints;
- launch-critical constraints and enums are aligned;
- Search is production-equivalent for columns, updater functions, triggers, GIN indexes and `search_afghan_hub()`; #197 is closed;
- `pg_trgm` is rehearsed and retained under `extensions` on secondary;
- SECURITY DEFINER search-path hardening was rehearsed successfully on secondary.

Existing secondary accounts are inventory only. Never assume an account is disposable merely because its role matches a required persona.

## Hosted acceptance tooling

Available commands:

- `npm run acceptance:auth`
- `npm run acceptance:member-pair`
- `npm run acceptance:journey`
- `npm run acceptance:rsvp`
- `npm run acceptance:roles`
- `npm run acceptance:avatar-storage`
- `npm run security:qualify-target`

The manual-only hosted acceptance workflow is hard-pinned to secondary and uses GitHub Secrets for designated disposable personas. It does not expose a production target selector.

Avatar Storage acceptance shipped in #206:

- generated synthetic 1x1 PNG fixture only;
- own-folder upload/update/delete positive paths;
- cross-user upload/delete deny paths;
- anonymous/public avatar read;
- profile `avatar_url` update and restoration;
- cleanup in `finally`;
- explicit write input/acknowledgement;
- production hard-blocked by exact secondary target assertion.

The current connector cannot create/delete Supabase Auth users safely, cannot write repository secrets, and does not expose workflow dispatch. Do not insert directly into `auth.users` and do not repurpose unrelated real accounts.

## Main launch gate — #120

#120 is OPEN and is the principal behavioral gate.

Structural/environment readiness is complete enough for the controlled hosted matrix. What remains is operational:

1. explicitly designate disposable Member A/B credentials;
2. designate moderator/admin personas for privileged positive/deny paths;
3. manually dispatch the hosted workflow with the relevant write inputs;
4. preserve/execute exact cleanup for generated fixtures;
5. record the behavioral evidence.

Until that succeeds, do not treat #134 or #136 as cleared for production merely because secondary structural parity is good.

## Migration reproducibility — #199 CLOSED

The earlier repository-history gap has been substantially repaired.

Recovered exact production migration SQL now tracked in the repo includes:

- the 16-migration July baseline (`extensions` through `storage`);
- Aug 8-9 connection/realtime/notifications prerequisites;
- Aug 30 messaging/read-receipt repair;
- missing Sep 4 RSVP/moderation permission hardening deltas;
- Sep 13 profile/privacy/default-ACL/admin-RPC/listing-media hardening migrations.

Relevant merged PRs: #200, #201, #202, #203 and #204.

CI protection now includes:

- #205 Storage migration-baseline regression guard;
- #211 migration replay-contract guard: 14-digit versions, uniqueness, required recovered migrations and key prerequisite ordering.

#207 is closed completed.

#199 is CLOSED following actual fresh isolated replay [35005042328](https://github.com/loadsnft/afghan-hub-web/actions/runs/35005042328) on main `bff0b27528e70785d2bbf879d916823784d7014b`.

- local Supabase startup passed;
- `supabase db reset --local --no-seed` passed;
- launch-critical verifier passed (`fresh migration replay invariants passed`);
- local stack cleanup passed;
- exact-main Node 22/24 CI and Vercel passed.

Replay-driven repairs: #214 SQL terminators; #215 predecessor/recovery read-receipt replacement; #216/#217 optional event-helper ACL portability and complete dollar delimiters. Independent native parsing also passed for 60 SQL files and 56 PL/pgSQL statements.

Under the user's explicit test-execution authorization, #217 automatically runs the isolated local replay after relevant migration/config/verifier/tooling changes on main. Manual dispatch remains available. No hosted secrets/project selector or remote database commands; concurrency queues rather than cancelling cleanup. The separate hosted persona acceptance workflow remains manual-only.

This clears repository reproducibility only. #120/#198 behavioral acceptance and the separate production authorization/evidence gates remain unchanged.

## Storage parity — #198

Environment parity is complete and repository baseline protection is now present.

- Secondary bucket config fingerprint matches production.
- Secondary Storage policy fingerprint matches production.
- July Storage baseline is restored in repository history.
- Sep 13 listing-media privacy transition is restored.
- #205 prevents silent removal of this migration contract.
- #206 provides disposable avatar behavioral acceptance tooling.

#198 remains OPEN only until the manual disposable-user avatar write acceptance is actually executed successfully and cleaned up.

## Production security gates

### #134 — SECURITY DEFINER hardening

20 authenticated-callable SECURITY DEFINER functions remain the production advisor surface. Secondary rehearsal of `search_path=''` succeeded. Exact production forward/rollback SQL is documented. Do not apply production ALTER FUNCTION changes until the relevant disposable member/moderator/admin behavioral evidence exists and explicit production authorization is given.

### #136 / #80 — Phase B DML least privilege

Production Phase B direct DML reduction remains unexecuted. Secondary has the intended narrower ACL matrix and the exact production forward/rollback package is documented.

Important invariant: `profiles` is excluded from Phase B. Capture production profile table+column ACL fingerprint immediately before a Phase B change and require it unchanged immediately after.

No production GRANT/REVOKE until #120 behavioral acceptance clears the relevant flows and explicit authorization is given.

### #135 — platform/Auth hardening

- Production `pg_trgm` 1.6 remains in `public`.
- Secondary relocation to `extensions` succeeded and removed the advisor warning.
- No Afghan Hub trigram index/function dependency was found; Search uses PostgreSQL full-text search.
- Production relocation remains a separate production DDL decision with rollback.
- Supabase leaked-password/HIBP protection is unavailable on the current Free plan; the stronger application password baseline is mitigation, not an equivalent replacement.

### #152 — repository hardening

`main` remains unprotected. Private-repo native protection/ruleset options are constrained by current plan/integration permissions. Continue procedural PR + Node22/24 + Vercel gating in zero-cost mode.

## Privacy operations — #132

Technical mechanics are substantially complete. Do not invent the remaining policy/legal/product decisions:

- retention periods by data class;
- privacy-request SLA/target;
- governing jurisdiction;
- shared-content treatment on deletion;
- abuse/safety evidence retention;
- broader export scope;
- self-service deletion vs verified support flow.

Current self-export intentionally contains only account/profile data. Production deletion remains a verified-support workflow with Storage-first cleanup and Auth identity last.

## Release / recovery

- manual anonymous production smoke exists;
- `npm run backup:free-plan` exists;
- encrypted/off-site logical backup guidance exists;
- Supabase Free has no automatic backups/PITR;
- DB dumps do not include Storage object bytes;
- never restore over production merely to prove recovery.

## Operating constraints

- Zero-cost mode: no paid branches/upgrades/credits unless explicitly approved.
- No production mutation without exact scope, relevant evidence, rollback/cleanup and explicit authorization.
- Never commit passwords, tokens, service-role keys, cookies, confirmation/reset links or DB credentials.
- Do not create fake Auth users by SQL or repurpose unrelated real identities.
- Do not blindly replay migrations, use destructive reset/db-push shortcuts, or rewrite production history by guesswork.
- Keep detailed evidence current in #80, #120, #132, #134, #135, #136, #198 and #199.
- Visual changes should target genuine UX hierarchy/state gaps and preserve the modern/minimal/light Afghan Hub identity.

## Verified checkpoint before this documentation update

- main: `bff0b27528e70785d2bbf879d916823784d7014b` (#217);
- exact-main Node 22/24 CI and Vercel succeeded;
- automatic isolated replay 35005042328 succeeded, including reset, all verifier assertions and cleanup;
- #199 closed completed;
- #120 remains the next behavioral launch gate, requiring explicitly designated disposable secondary personas;
- documentation updates naturally create newer SHAs; verify live main on continuation.
