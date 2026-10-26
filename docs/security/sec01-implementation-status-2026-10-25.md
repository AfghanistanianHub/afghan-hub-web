# SEC-01 implementation checkpoint — NOT READY FOR MERGE

The following source files were changed on this branch:
- `src/types/database.ts`: TypeScript RPC signatures
- `src/app/(dashboard)/submissions/page.tsx`: owner note RPC
- `src/app/(dashboard)/moderation/page.tsx`: reviewer history RPC
- `src/app/(dashboard)/businesses/[slug]/page.tsx`: owner note RPC, direct private column removed
- `src/app/(dashboard)/organizations/[slug]/page.tsx`: owner note RPC, direct private column removed
- `src/app/(dashboard)/events/[slug]/page.tsx`: owner note RPC, explicit safe projection
- `src/app/(dashboard)/opportunities/[slug]/page.tsx`: owner note RPC, explicit safe projection

SEC-01 SQL RPC prototypes accepted by PostgreSQL in a rolled-back Secondary transaction; persisted RPC count was zero post-rollback. Production unchanged. CI workflow run lookup for latest commit returned none at time checked; **typecheck, lint, unit, browser, full JWT persona and RLS regression tests NOT confirmed**.

## Blockers before merging
1. Confirm no other direct SELECT of three private moderation fields anywhere in all server/client code and API entrypoints. Search more than tracked exact text.
2. Plan migration and order: install RPCs, deploy compatible consumers, test, only then narrow table grants. Current branch cannot be deployed before its RPC dependencies.
3. Owner note RPC currently called once per entity on Submissions page; performance and error handling should be reviewed; failure must be visible instead of silently treating missing note as absent.
4. Review actual public-field allowlists and all table-level SELECT usage before narrowing grants. Preserve RLS and moderation/admin functionality.
5. Run full TypeScript, lint, unit, SSR build and browser tests on a disposable production-compatible local/staging environment; verify signed-in JWTs and rejected fixtures for owner A, other B, moderator, admin and anonymous.
6. Capture exact current ACL/function snapshots, implement independently tested rollback. Do not apply SQL on Production without approval.

## Security policy
Production is READ ONLY until authorized. No deployment, merge, Supabase db push, grants, functions, RLS or data changes performed during this work.
