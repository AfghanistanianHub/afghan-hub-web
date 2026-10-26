# SEC-01 combined RPC + restricted-column transaction test — 2026-10-25

Environment: **Secondary**, not production. No persistent changes.

Combined in **one** `BEGIN ... ROLLBACK`:
1. Created both scoped RPCs from `supabase/migrations/20261025195000_sec01_add_caller_scoped_moderation_rpcs.sql`.
2. Applied the fixed-column SELECT ACLs from `docs/security/sec01-phase-b-fixed-allowlist-REHEARSAL-ONLY.sql`.
3. Assertions checked private moderation columns denied, no whole-table SELECT grants, RLS enabled, and authenticated INSERT/UPDATE/DELETE privileges preserved.
4. Under `SET LOCAL ROLE authenticated` with no caller JWT, owner RPC returned NULL for a synthetic UUID.
5. Under the same role, reviewer history RPC rejected the caller with PostgreSQL `42501`; a transaction-local catch verified rejection.
6. After rollback, table ACLs matched the original four-table fingerprint, zero per-column ACLs remained, and neither RPC persisted.

**Limitations:** This proves combined SQL compatibility and denial for a *no-JWT* caller. It DOES NOT simulate valid independently signed owner A / unrelated member B / reviewer / admin JWTs. Does not prove frontend read/write functionality under narrowed ACL, nor exact production deployment rollback. Never mistake temporary tester `SET LOCAL ROLE` for an authenticated Supabase API request.

**Release gate:** Keep Draft, do not merge/deploy. Build an isolated seeded multi-persona fixture, apply phase A+B there, exercise PostgREST with distinct JWTs and browser paths; approve explicit column privacy policy and exact ACL rollback before production change authorization.
