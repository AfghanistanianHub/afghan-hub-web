# SEC-01 — moderation-field disclosure: release-blocking implementation contract

**Status:** REVIEW ONLY; no production changes authorized. 2026-10-25.

## Current proof

For `public.businesses`, `public.events`, `public.opportunities`, `public.organizations`, direct `SELECT` grants to `anon` and `authenticated` include `moderation_note`, `moderated_at`, and `moderated_by` on RLS-visible rows. This is a confirmed SQL-level field-exposure boundary defect, **not** proof that data has been exfiltrated.

Production and secondary table ACLs matched at review time: `anon=r`, `authenticated=arwd`; no per-column grants on these four tables. Secondary transactional rehearsal (BEGIN/REVOKE/column-GRANT/ASSERT/ROLLBACK) passed all 24 negative column-privilege checks. A post-ROLLBACK catalog query confirmed exact original table ACLs and zero residual per-column ACLs.

**No production schema, grants, RLS, Auth, Storage, or data modified.**

## Critical application dependencies

- `src/app/(dashboard)/submissions/page.tsx` selects `moderation_note` from all four tables to display an owner's rejection feedback.
- `src/app/(dashboard)/moderation/page.tsx` selects `moderation_note` and `moderated_at` from all four tables to show reviewer history.
- Detail pages (e.g. business detail) may read an owner's rejection feedback.

Revoking table-wide SELECT and regranting safe columns before migrating those consumers **will break these screens**. Also, column-GRANT safe list must not inadvertently regrant sensitive future columns.

## Proposed application/data contract

1. Explicit `catalog_public_fields` contract for each catalog; approved fields only. Treat `moderation_note`, `moderated_by`, `moderated_at` as non-public (and evaluate contact fields, `search_vector`, verification/audit metadata separately).
2. Owner note read: SECURITY DEFINER narrow RPC taking (entity_type enum/validated text, entity_id uuid), deriving caller from `auth.uid()`, checking relevant `owner_id` / `author_id` / `creator_id` and returning only `moderation_note` for the caller's own record. No caller-supplied owner ID. Reject null identities and unsupported entity types. `SET search_path = ''`, explicit schema qualification, `REVOKE EXECUTE FROM PUBLIC, anon`, explicit `GRANT EXECUTE TO authenticated`.
3. Reviewer history read: separate capability-checked RPC; verify `public.can_moderate()` internally (not UI-only), return only approved fields, preserve ordering/pagination limits and scoped access; ensure no anon execute.
4. Migrate all consumers and update database TypeScript types before changing table grants. Test exact projections for owners, reviewers and detail routes.
5. Use **allow-list of approved columns**, not dynamic `information_schema.columns EXCEPT moderation_*` in deployed SQL; otherwise new private columns may be exposed automatically.
6. Then revoke table-level SELECT for `anon` and `authenticated`; explicitly GRANT SELECT on approved safe columns. Preserve authenticated INSERT/UPDATE/DELETE subject to current RLS/triggers. No generic GRANT ALL.
7. Preserve moderation decision RPCs and existing triggers, verify moderation audit notes are still visible to authorized owners/reviewers, not unauthorized clients.

## Transactional rehearsal and authorization matrix

Secondary is not fully proven equivalent to production (migration-ledger divergence; isolated dataset). Use synthetic personas: anon; owner A; unrelated authenticated B; moderator; admin. Test both raw PostgREST and application routes.

- Public SELECT on published catalogs: approved columns succeed; direct private columns fail with SQL permission error.
- Anonymous unpublished row reads: denied by RLS.
- Owner's rejection note RPC: only own entity succeeds; other entities denied.
- Member B cannot read owner A note even through direct RPC, nested relationships, select-star or query parameters.
- Moderator history works with correct ordering; ordinary member cannot call it successfully.
- Admin role changes retain database-enforced checks; no self-promotion.
- Published/draft media and signed URL tests, submission/detail pages, connections, notifications, event RSVP and member search all pass.
- Rehearse forward **and exact rollback** against identical synthetic fixtures; assert ACL, functions and policy fingerprints.

## Production forward and rollback construction — do not execute as-is

Before authoring migration, capture same-window exact:
- `pg_class.relacl` and `pg_attribute.attacl`, object owner, policy metadata for all four tables.
- Current `pg_get_functiondef`, `proacl`, `proowner`, `proconfig` for affected RPCs; unique signatures.
- Grants on schema and sequences; RLS status, dependency snapshots.
- Application commit SHA and deployed version.

**Forward:** create/rehearse narrowly authorized RPCs; deploy updated application; verify behavior; only then apply tightly scoped table ACL narrowing.

**Rollback:** restore the **exact captured ACL** (including column privileges) and each replaced function definition/owner/EXECUTE grant from the same-window snapshot; revert the app deploy if required. A synthetic `GRANT SELECT ON TABLE ... TO anon,authenticated` matches the *2026-10-25 observed* four-table baseline, but is NOT a reliable future exact rollback if production has drifted. Stop rollout when fingerprints differ. Do not merge partial stages silently.

## Current completion

- [x] Live baseline metadata review and secondary SQL mechanism rehearsal
- [x] Secondary transaction rolled back and ACL restored
- [ ] Approved public-field allow-list
- [ ] Owner/reviewer RPC implementation and direct persona execution
- [ ] Migrate all frontend consumers and run CI/browser regression
- [ ] Independent exact forward/rollback replay against production-compatible isolated baseline
- [ ] Production change-control sign-off

Security Advisor's 20 authenticated SECURITY DEFINER warnings are **not 20 proven vulnerabilities**. Existing functions must retain their intended per-caller authorization checks; avoid blanket EXECUTE revocation.
