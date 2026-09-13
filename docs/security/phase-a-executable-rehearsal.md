# Executable Phase A rehearsal

The `Isolated security rehearsal` workflow executes the existing documented forward and rollback SQL on a disposable PostgreSQL 17 service. It uses no Supabase credentials, no application records, no public database port and no paid branch. It runs only when its SQL, generator, workflow or source documents change.

## Evidence produced by a successful run

- Both application roles lose all four structural privileges on the explicit 12-table scope.
- Existing heterogeneous DML grants, excluded tables and service-role grants survive.
- A newly created table inherits DML but no structural privileges for the two application roles.
- Synthetic owner reads/writes still work, another owner's insert is denied, and authenticated TRUNCATE is denied.
- Rollback exactly restores the normalized table and default ACL baseline, including the notification/RSVP exceptions.
- RLS flags, policy definitions and the fixture function remain unchanged.
- A second run deliberately omits the forward SQL and must fail for a remaining structural privilege. Unexpected success or a different failure fails CI.

The generator extracts the marked SQL blocks from the existing rehearsal documents so tests exercise the proposed SQL, not a duplicate implementation. SQL aborts before fixture creation unless the database is fresh, named `ah_security_fixture`, uses PostgreSQL 17 and runs as postgres. Only run the generated SQL in the disposable service.

## Scope and remaining gate

This is a real PostgreSQL ACL/rollback test with synthetic tables, not a full Supabase staging environment. It does not validate production policies, triggers, RPCs, PostgREST, Auth, email delivery, storage, or the #67 profile transition. It does not close #80 or authorize production DDL. A production-compatible application/persona rehearsal and same-window rollback review are still required.

On 2026-09-13 the existing secondary Supabase project's read-only connection check still failed authentication. Production default-ACL metadata was read without member data: postgres/public defaults are schema-scoped, with no observed global default override; storage and supabase_admin defaults remain excluded. The fixture is based on the recorded Phase A grant map; it is not a production dump.

PostgreSQL default privileges are additive across global and schema scopes: a schema-only revoke cannot remove a global default grant. Future-table assertions protect against that assumption being silently missed. Reference: https://www.postgresql.org/docs/17/sql-alterdefaultprivileges.html

For the test result, inspect the `phase-a` job under GitHub Actions → `Isolated security rehearsal`. Both the forward/rollback step and negative-control step must pass.
