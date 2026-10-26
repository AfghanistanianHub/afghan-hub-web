# SEC-01 current-state read-only assertions

**Review-only. Never merge a privilege-changing remediation on the strength of these checks alone.**

Run `tests/security/sec01-current-exposure-readonly.sql` against production with a metadata-reading account. It reads Postgres catalogs and privilege metadata only; it does not access private application records or alter SQL objects.

## Acceptance
All 8 moderation column-access rows should eventually report PASS, *after* consumers have moved to a scoped data access surface. The present production configuration is expected to show FAIL for all 8 rows because table-wide SELECT still permits reading moderation metadata on RLS-visible published listings. RLS row filtering does not hide columns.

## Confirmed dependent code (main, 2026-10-25)
- `src/app/(dashboard)/submissions/page.tsx` reads moderation_note from each listing.
- `src/app/(dashboard)/moderation/page.tsx` reads moderation_note/moderated_at for four categories.
- Business and organization detail pages read moderation_note.

## Required before privilege changes
1. Agree an exact public column contract (especially email/phone/address and event online_url).
2. Implement **owner- and moderator-scoped private reads** with fixed outputs; avoid SECURITY DEFINER unless justified, carefully scope caller and role, lock search_path and EXECUTE.
3. Update every dependent page and regression test (including direct PostgREST field requests, anonymous published vs draft visibility, owner rejection reason, cross-user IDOR, moderator history).
4. Rehearse changes and exact rollback with synthetic personas in a production-compatible isolated database. The secondary Supabase project has a divergent migration ledger and is not automatically a qualified clone.
5. Obtain explicit production approval, capture same-window table/column ACL and function fingerprints, and require clean regression before rollout.

**Production is not authorized for DDL/DML by this PR.** No `supabase db push`; no changes to the Supabase settings, RLS, grants, functions, Auth, Storage or user data.
