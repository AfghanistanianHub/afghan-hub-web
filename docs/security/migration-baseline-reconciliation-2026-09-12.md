# Migration baseline reconciliation — 2026-09-12

Status: **read-only reconciliation / safety reference — not migration-history repair**

This document compares the migration filenames currently committed in `supabase/migrations/` with the migration ledger currently applied to Afghan Hub Production (`yussznmwjsvfvpabmwdc`). It exists to prevent accidental `db push`, blind history repair, or replay of repository migrations against a production database whose historical baseline is not one-to-one with the repository.

No migration ledger row, schema object, policy, grant, function, Auth setting, storage setting, or production data was changed while preparing this comparison.

## Summary

- Repository migration files: **29**
- Production applied migration ledger rows: **45**
- Repository migrations with an exact **logical name** match in production: **20**
- Repository-only migration names: **9**
- Production-only migration names: **25**
- Original production July baseline present in production but absent from the repository: **16 migrations**

A logical-name match does **not** prove byte-for-byte SQL equivalence. For the 20 logical-name matches below, production records one stored statement per migration and no rollback array. Exact SQL/content equivalence must be checked only when needed for a future isolated migration rehearsal.

## Production-only original baseline — 16

These establish the original schema but are not present as migration files in the current repository:

| Production version | Name |
| --- | --- |
| `20260719000100` | `extensions` |
| `20260719000200` | `enums` |
| `20260719000300` | `functions` |
| `20260719000400` | `profiles` |
| `20260719000500` | `businesses` |
| `20260719000600` | `organizations` |
| `20260719000700` | `opportunities` |
| `20260719000800` | `events` |
| `20260719000900` | `messaging` |
| `20260719001000` | `connections` |
| `20260719001100` | `indexes` |
| `20260719001200` | `search` |
| `20260719001300` | `rls_enable` |
| `20260719001350` | `auth_helpers` |
| `20260719001400` | `policies` |
| `20260719001500` | `storage` |

Implication: a fresh environment cannot be reconstructed safely by running the current repository migration directory alone. The repository is a continuation history, not the complete production origin history.

## Production-only August / recovery history — 5

| Production version | Name | Reconciliation note |
| --- | --- | --- |
| `20260808000100` | `connections_update_policy` | No same-name repo file. Historical production-only connection policy change. |
| `20260809000100` | `messages_realtime` | Repo has later `enable_messages_realtime`; semantic relationship must not be assumed identical. |
| `20260809000200` | `notifications` | No same-name repo file. Baseline notification change. |
| `20260809000300` | `connections_respond_rpc` | No same-name repo file. Historical connection RPC change. |
| `20260830024037` | `restore_missing_messaging_functions_and_read_receipts` | Repo keeps deployment evidence under `docs/deployments/20260830024037_messaging_restore.sql`; several Aug 23/25 repo migrations likely represent source work around the same messaging/read-receipt period, but equivalence is not assumed. |

## Repository-only August 23/25 history — 9

These migration filenames exist in the repository but have no same-name production ledger entry:

1. `20260823000100_enable_messages_realtime.sql`
2. `20260823000200_add_content_moderation.sql`
3. `20260823000300_add_moderation_notifications.sql`
4. `20260823000400_add_moderation_feedback.sql`
5. `20260823000500_optimize_message_inbox.sql`
6. `20260823000600_enable_read_receipts_realtime.sql`
7. `20260825000100_precise_message_read_receipts.sql`
8. `20260825000200_sync_message_notifications.sql`
9. `20260825000300_enable_notifications_realtime.sql`

These are the highest-risk files for any blind migration replay because production followed a different deployment path and later recorded a consolidated messaging/read-receipt restore. Treat them as repository development history, **not pending production migrations**.

## Logical-name matches with different timestamps — 20

The following repository files match production by migration **name**, but their timestamps differ. Production stores one statement for each and no rollback array.

| Repository file | Production version/name |
| --- | --- |
| `20260902000100_harden_function_permissions.sql` | `20260902070621_harden_function_permissions` |
| `20260902000200_add_missing_foreign_key_indexes.sql` | `20260902072633_add_missing_foreign_key_indexes` |
| `20260904000100_add_event_rsvps.sql` | `20260904054424_add_event_rsvps` |
| `20260904000200_skip_self_moderation_notifications.sql` | `20260904184840_skip_self_moderation_notifications` |
| `20260904000300_allow_content_moderation_notifications.sql` | `20260904185335_allow_content_moderation_notifications` |
| `20260904000400_search_events_and_active_opportunities.sql` | `20260904212709_search_events_and_active_opportunities` |
| `20260904000500_moderate_businesses_and_organizations.sql` | `20260904215610_moderate_businesses_and_organizations` |
| `20260904000600_protect_listing_verification.sql` | `20260904220830_protect_listing_verification` |
| `20260904000700_protect_profile_roles.sql` | `20260904221711_protect_profile_roles` |
| `20260904000800_fix_business_media_storage_policies.sql` | `20260904222536_fix_business_media_storage_policies` |
| `20260904000900_add_moderation_foreign_key_indexes.sql` | `20260905000352_add_moderation_foreign_key_indexes` |
| `20260904001000_consolidate_moderation_rls.sql` | `20260905000708_consolidate_moderation_rls` |
| `20260904001100_add_admin_role_management.sql` | `20260905035347_add_admin_role_management` |
| `20260904001200_secure_conversation_creation.sql` | `20260905040307_secure_conversation_creation` |
| `20260904001300_secure_connection_requests.sql` | `20260905043504_secure_connection_requests` |
| `20260904001400_protect_messaging_history.sql` | `20260905070910_protect_messaging_history` |
| `20260905000100_protect_listing_identity.sql` | `20260905092036_protect_listing_identity` |
| `20260905000200_protect_listing_creation_identity.sql` | `20260905093425_protect_listing_creation_identity` |
| `20260905000300_harden_external_url_schemes.sql` | `20260905094229_harden_external_url_schemes` |
| `20260905000400_enforce_contact_email_integrity.sql` | `20260905211141_enforce_contact_email_integrity` |

Working classification: **logically matched / timestamp divergent / content equivalence not yet asserted**.

For future security work, do not attempt to “repair” production history by rewriting these production versions to repository timestamps. The production ledger is evidence of what was actually applied and should remain authoritative unless a separately reviewed migration-history recovery procedure is explicitly approved.

## Production-only September migrations — 4

These production migrations have no same-name file in the repo migration directory:

| Production version | Name | Note |
| --- | --- | --- |
| `20260904054521` | `optimize_event_rsvps` | Follow-up to `add_event_rsvps`; current DB behavior includes this production-only optimization. |
| `20260904184443` | `reconcile_content_moderation` | Likely reconciles earlier moderation development history; do not replace with the repo Aug moderation files. |
| `20260904184515` | `harden_moderation_function_permissions` | Production-only security hardening. |
| `20260904184543` | `remove_public_moderation_function_execute` | Production-only security hardening. |

Together with the 16 July baseline and 5 August/recovery items, these account for the **25 production-only names**.

## Why this matters for #67 and #80

The profile-privacy and least-privilege remediation must **not** be introduced by replaying the existing repository migration directory. Instead:

1. treat current production metadata as the source of truth;
2. generate a new production-specific forward migration from current definitions;
3. generate deterministic rollback from a same-window production snapshot;
4. rehearse both in an isolated production-compatible database;
5. run direct API persona tests and application regressions;
6. only then consider production application with explicit approval.

The current security remediation can therefore proceed without solving historical migration identity perfectly. We need enough reconciliation to avoid replay/history mistakes, not a cosmetic rewrite of every historical timestamp.

## Content-equivalence policy

Do not spend time proving SQL equality for all 20 logical-name matches unless a concrete operation depends on it. Content-level comparison is required only when:

- reconstructing an isolated production-compatible schema from historical migrations;
- relying on an old migration as rollback/forward SQL;
- deciding whether a specific historical migration can be safely omitted or replaced.

For #67/#80, current production metadata and new forward/rollback SQL are safer than depending on historical file equivalence.

## Explicit non-actions

This reconciliation does **not** authorize:

- `supabase db push` against production;
- `migration repair` against production;
- editing `supabase_migrations.schema_migrations`;
- renaming historical production migration versions;
- replaying repository-only Aug 23/25 migrations;
- applying the repo directory to production from scratch;
- production schema/RLS/grant/function/storage/data changes.

## Current conclusion

The baseline mismatch is now bounded and documented rather than unknown:

- the repository is missing the original 16-migration production baseline;
- nine repo Aug migrations are not ledger-equivalent entries in production;
- twenty later repo migrations have clear logical-name counterparts with different applied timestamps;
- four additional September production migrations exist only in the production ledger;
- one consolidated production messaging restore explains why the August histories must not be replayed mechanically.

This is sufficient to keep migration history off the critical path for preparing new isolated #67/#80 remediation packages, provided all future security SQL is generated from current production metadata and not from assumed migration replay.
