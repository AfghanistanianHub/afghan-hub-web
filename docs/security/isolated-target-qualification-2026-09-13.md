# Isolated security target qualification — 2026-09-13

## Purpose
Qualify a non-production Supabase project before running the #67 profile-privacy or #80 least-privilege rehearsals. Passing this checklist does not authorize production DDL.

## Current candidate
Management API discovery can see project `rurgmyiiytesknsfwjjl` (`loadsnft's Project`) in `ca-central-1`, PostgreSQL 17.6, ACTIVE_HEALTHY. Direct SQL/type-generation access currently fails with database password authentication errors, so this project is **not yet a trustworthy rehearsal target**.

Production is `yussznmwjsvfvpabmwdc`; rehearsal tooling must refuse that ref.

## Qualification gates
A target is accepted only when all are true:

1. Project is non-production and HTTPS.
2. Database management access works reliably (read-only metadata query + generated types or equivalent schema introspection).
3. Required Afghan Hub tables/functions exist and match the reviewed rehearsal assumptions.
4. The target contains disposable/synthetic personas only; no copied production member data is required.
5. #67 forward SQL, persona tests and rollback can run end-to-end there.
6. #80 Phase A can be applied and rolled back there after #67 validation.
7. No migration-history repair, blind `db push`, or replay of the repository migration directory is used to manufacture compatibility.

## Fast path once access works

- Capture a fresh schema/grants/policies/functions snapshot.
- Compare it to the production snapshots already under `docs/security/`.
- Seed only synthetic fixtures needed by `scripts/security-profile-personas.mjs`.
- Run #67 forward rehearsal.
- Run `npm run security:profile-personas`.
- Run #67 rollback rehearsal and re-check baseline.
- Only then move to #80 Phase A rehearsal.

## Stop conditions
Stop immediately if the target resolves to the production project ref, contains real member data, cannot be restored to the captured baseline, or its schema materially differs from the reviewed production assumptions.
