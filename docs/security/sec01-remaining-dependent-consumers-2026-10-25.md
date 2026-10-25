# SEC-01 remaining blockers (2026-10-25)

Review-only branch; not production-ready.

Current branch replaces public-table direct `moderation_note` reads in submissions and business/organization details with `get_listing_moderation_feedback` calls. The RPC does not yet exist in production, so deploying these page changes BEFORE the new function would break moderation feedback. Route rollout in an isolated environment first.

## Still not migrated
The moderation history in `src/app/(dashboard)/moderation/page.tsx` directly selects `moderation_note` and `moderated_at` across all four listing tables. This screen needs a moderator-scoped, bounded and paginated history RPC, or another server-verified private read route, with no direct sensitive column access.

The public field contract is unresolved: emails, phone numbers, addresses, private online event URLs and search vector visibility need a deliberate privacy review. The current proposed allowlist is not approved.

## Required tests
- Browser and typecheck/build on review branch with RPC installed in isolated Supabase.
- Owner A versus owner B denial for each of four entities.
- Unauthenticated request denied; ordinary signed-in member denied.
- Moderator and Admin see authorized history, with result row bounds.
- Rest endpoint explicit column probe confirms moderation metadata denied after ACL change.
- Rollback preserves existing pages and function callers.
- Migration ledger and storage policy parity checked on isolated DB.

## Production
No change authorized; do not merge PR #560; no automatic deploy and no `supabase db push`.
