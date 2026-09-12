# Public function exposure snapshot — 2026-09-12

Status: **read-only production metadata / review reference — not a migration**

Related: issue #80 and `production-authorization-rollback-snapshot-2026-09-12.md`.

This snapshot classifies functions in the production `public` schema that are executable by `anon` and/or `authenticated`. It was collected using metadata-only SQL. No production function, grant, schema, Auth setting, or row was changed.

## Why classification matters

The public schema contains three materially different function groups:

1. application RPC/security functions;
2. application trigger/helper functions;
3. `pg_trgm` extension-owned functions.

A blanket `REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public` is therefore not an acceptable production plan. Each group has different compatibility and exposure requirements.

## Application SECURITY DEFINER functions callable by `authenticated`

Production currently has 18 application `SECURITY DEFINER` functions callable by `authenticated` and not by `anon`:

- `can_moderate()`
- `get_event_rsvp_count(uuid)`
- `get_message_inbox()`
- `get_unread_message_counts()`
- `is_admin()`
- `is_conversation_member(uuid)`
- `mark_all_notifications_read()`
- `mark_conversation_read(uuid, uuid)`
- `mark_notification_read(uuid)`
- `moderate_business(uuid, text, text)`
- `moderate_event(uuid, text, text)`
- `moderate_opportunity(uuid, text, text)`
- `moderate_organization(uuid, text, text)`
- `respond_connection_request(uuid, text)`
- `rsvp_to_event(uuid)`
- `send_connection_request(uuid)`
- `set_profile_role(uuid, user_role)`
- `start_direct_conversation(uuid)`

### Empty `search_path` — 7

The following already use the newer empty-search-path style:

- `get_event_rsvp_count`
- `is_admin`
- `is_conversation_member`
- `mark_all_notifications_read`
- `mark_notification_read`
- `respond_connection_request`
- `rsvp_to_event`

### `search_path=public` — 11

The following older application SECURITY DEFINER functions still use `search_path=public`:

- `can_moderate`
- `get_message_inbox`
- `get_unread_message_counts`
- `mark_conversation_read`
- `moderate_business`
- `moderate_event`
- `moderate_opportunity`
- `moderate_organization`
- `send_connection_request`
- `set_profile_role`
- `start_direct_conversation`

These should be reviewed for normalization to an empty/fixed minimal search path, but only after their bodies and dependency resolution are tested in isolation. Do not mass-edit them merely to satisfy a linter/advisor.

## Application functions currently executable by anon/PUBLIC

### `search_afghan_hub(text, integer)`

- security invoker
- executable by PUBLIC, anon, authenticated, service role
- empty `search_path`
- current member branch has the known email-fallback/onboarding defects tracked by #67

Current launch policy does not require anonymous member search. The staged #67 remediation proposes revoking anon execution while preserving authenticated search after the safe rewrite.

### Trigger/helper functions

The following postgres-owned helper functions are currently executable by PUBLIC/anon/authenticated because of broad function defaults:

- `set_updated_at()`
- `update_business_search_vector()`
- `update_opportunity_search_vector()`
- `update_organization_search_vector()`
- `update_profile_search_vector()`

These are trigger helpers, not intended public RPC surfaces. Their broad EXECUTE grants are unnecessary in principle, but the final privilege change must be tested against trigger behavior and deployment tooling before revocation.

## `pg_trgm` extension-owned functions

A significant set of anon/PUBLIC-executable functions is owned by `supabase_admin` and belongs to the `pg_trgm` extension installed in `public`, including trigram GIN/GiST support functions and similarity functions.

Examples include:

- `gin_extract_query_trgm`
- `gin_extract_value_trgm`
- `gin_trgm_consistent`
- `gin_trgm_triconsistent`
- `gtrgm_*`
- `set_limit`
- `show_limit`
- `show_trgm`
- `similarity`
- `word_similarity*`
- `strict_word_similarity*`

Do **not** treat these as application RPCs and do not blanket-revoke or relocate the extension without isolated compatibility testing. Index/operator behavior and future migrations may depend on extension-owned objects.

## Default function ACL root cause

For both current owner paths (`postgres` and `supabase_admin`) in schema `public`, default function ACLs grant EXECUTE to anon and authenticated.

Semantic current default:

```text
owner=X, anon=X, authenticated=X, service_role=X
```

Therefore newly created functions can become application-role executable unless the migration explicitly hardens their ACLs or the owner-specific defaults are corrected.

Any #80 rollout must address default privileges **per owner** and then explicitly grant execute only to intended callers for application RPCs.

## Staged remediation rules

1. Keep a reviewed allowlist of application RPCs and intended caller roles.
2. For new SECURITY DEFINER functions, use empty/fixed search path and internal authorization checks.
3. Revoke PUBLIC/anon execute on trigger helpers that are not intended RPCs only after isolated trigger regression tests.
4. Harden `search_afghan_hub` as part of #67, not as an unrelated blanket function cleanup.
5. Do not blanket-revoke extension-owned `pg_trgm` functions without proving index/search compatibility.
6. Correct `ALTER DEFAULT PRIVILEGES` separately for `postgres` and `supabase_admin` owner contexts.
7. Capture same-window function ACLs immediately before production rollout and generate exact rollback SQL.

## Required regressions before production

- member search and published catalog search;
- connection send/respond/remove;
- direct conversation start;
- inbox/unread/read-state behavior;
- notification read/all-read;
- RSVP/capacity/count;
- moderation for all supported content types;
- admin role management;
- trigram-backed search/index behavior;
- trigger-driven updated timestamps and search-vector maintenance.

No production function privilege change is authorized by this document.
