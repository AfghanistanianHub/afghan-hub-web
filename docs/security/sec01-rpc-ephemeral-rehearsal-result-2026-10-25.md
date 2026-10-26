# SEC-01 RPC ephemeral rehearsal, 2026-10-25

Environment: isolated Afghan Hub secondary (`rurgmyiiytesknsfwjjl`), NOT production.

## Executed, each inside BEGIN...ROLLBACK

1. Created `get_owned_listing_moderation_note(text,uuid)` and `get_moderation_history(integer)` from `sec01-owner-reviewer-rpcs.REHEARSAL-ONLY.sql`, replacing final COMMIT with an assertion and ROLLBACK. PostgreSQL accepted both function definitions.
2. Verified `prosecdef=true` on both; `anon EXECUTE=false`; `authenticated EXECUTE=true`.
3. `SET LOCAL ROLE authenticated`, with no Auth subject JWT: owner-note RPC returned NULL for an arbitrary UUID, as intended for an unauthenticated caller.
4. After rollback, query of `pg_proc` found neither new function; no persistent SQL objects created.

## Not yet verified

- Real JWT-signed owner, unrelated member, moderator and admin behavior.
- Rejection-note correctness on owned populated fixture rows.
- Reviewer history ordering, cross-tenant behavior and pagination.
- App consumers, CI/browser regression, storage access and exact production rollback.
- Production-replay equivalence; no production SQL executed.

## Important release constraint

This is **syntax and limited role-permission rehearsal**, not end-to-end authorization acceptance. Do not deploy phase B table ACL changes until app consumers are migrated and all necessary persona tests pass. Preserve `submissions` and `moderation` functionality. Separate deploy and explicit production authorization required. No claims of completed remediation.
