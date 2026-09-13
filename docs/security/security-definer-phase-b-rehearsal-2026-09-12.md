# SECURITY DEFINER Phase B rehearsal — 2026-09-12

Status: **review-only / isolated-environment rehearsal — DO NOT APPLY TO PRODUCTION**

Related: #80, `public-function-exposure-snapshot-2026-09-12.md`, `production-authorization-rollback-snapshot-2026-09-12.md`.

## Why this exists

Supabase Security Advisor currently reports 18 `SECURITY DEFINER` functions callable by `authenticated`. That warning must not be interpreted as 18 equivalent vulnerabilities or as a reason to blanket-revoke `EXECUTE`.

Read-only production inspection shows that these RPCs and helper functions are deliberately part of Afghan Hub's authorization boundary. Several are referenced directly from RLS policies; others perform authenticated recipient/member/moderator/admin checks before reading or mutating rows that callers do not have unrestricted direct access to.

This Phase B therefore separates **intentional execution exposure** from **legacy search-path hardening**.

## Active helper dependencies — do not blanket revoke

### `public.can_moderate()`
Used by active SELECT policies on businesses, events, opportunities and organizations, and by moderation enforcement/RPC paths. Removing authenticated execution without redesign/testing would break moderation visibility and authorization.

### `public.is_admin()`
Used by active owner/admin update/delete policies across businesses, events, opportunities, organizations, connections and profiles, plus role/verification enforcement. It is part of the current RLS authorization boundary.

### `public.is_conversation_member(uuid)`
Used directly by RLS on conversations, conversation_members and messages, including message insert checks. It is part of the messaging authorization boundary.

## Already hardened to `search_path = ''`

Seven authenticated-callable SECURITY DEFINER functions already use an empty search path and do not need a Phase B search-path change:

- `get_event_rsvp_count(uuid)`
- `is_admin()`
- `is_conversation_member(uuid)`
- `mark_all_notifications_read()`
- `mark_notification_read(uuid)`
- `respond_connection_request(uuid, text)`
- `rsvp_to_event(uuid)`

Their execution exposure should be retained unless a separate usage review proves the function is unused and a replacement authorization path exists.

## Legacy `search_path = 'public'` candidates

Eleven authenticated-callable SECURITY DEFINER functions still use `search_path = 'public'`:

- `can_moderate()`
- `get_message_inbox()`
- `get_unread_message_counts()`
- `mark_conversation_read(uuid, uuid)`
- `moderate_business(uuid, text, text)`
- `moderate_event(uuid, text, text)`
- `moderate_opportunity(uuid, text, text)`
- `moderate_organization(uuid, text, text)`
- `send_connection_request(uuid)`
- `set_profile_role(uuid, public.user_role)`
- `start_direct_conversation(uuid)`

Read-only production definitions show their application-object references are already schema-qualified (`public.*`, `auth.uid()`) and built-in functions/types remain available through PostgreSQL's system schemas. That makes search-path hardening a plausible isolated rehearsal without rewriting function bodies.

## Candidate isolated rehearsal SQL

Do **not** execute this on production. In an isolated production-compatible database, after taking a same-window `pg_get_functiondef`/ACL snapshot:

```sql
begin;

alter function public.can_moderate()
  set search_path = '';

alter function public.get_message_inbox()
  set search_path = '';

alter function public.get_unread_message_counts()
  set search_path = '';

alter function public.mark_conversation_read(uuid, uuid)
  set search_path = '';

alter function public.moderate_business(uuid, text, text)
  set search_path = '';

alter function public.moderate_event(uuid, text, text)
  set search_path = '';

alter function public.moderate_opportunity(uuid, text, text)
  set search_path = '';

alter function public.moderate_organization(uuid, text, text)
  set search_path = '';

alter function public.send_connection_request(uuid)
  set search_path = '';

alter function public.set_profile_role(uuid, public.user_role)
  set search_path = '';

alter function public.start_direct_conversation(uuid)
  set search_path = '';

commit;
```

## Required isolated verification

After the candidate change, verify both function metadata and application behavior:

1. All 18 authenticated-callable SECURITY DEFINER functions retain their intended EXECUTE ACLs unless separately reviewed.
2. The 11 candidate functions report an empty configured search path.
3. Moderator/admin checks still work for allowed and denied personas.
4. Business/event/opportunity/organization moderation succeeds only for authorized moderator/admin roles.
5. Role management remains admin-only and self-role mutation remains denied.
6. Connection request/send/respond flows remain constrained to valid users/recipients.
7. Direct conversations still require an accepted connection.
8. Inbox/unread/read-state behavior remains scoped to the authenticated conversation member.
9. RLS paths using `can_moderate`, `is_admin`, and `is_conversation_member` continue to pass authorized cases and deny unrelated users.
10. Run the full Node 22/24 application regression/build suite against the isolated database where applicable.

## Rollback

A real rollout must capture same-window function settings first. For the current 2026-09-12 production state, the candidate rollback for these 11 functions would restore:

```sql
alter function public.can_moderate() set search_path = 'public';
alter function public.get_message_inbox() set search_path = 'public';
alter function public.get_unread_message_counts() set search_path = 'public';
alter function public.mark_conversation_read(uuid, uuid) set search_path = 'public';
alter function public.moderate_business(uuid, text, text) set search_path = 'public';
alter function public.moderate_event(uuid, text, text) set search_path = 'public';
alter function public.moderate_opportunity(uuid, text, text) set search_path = 'public';
alter function public.moderate_organization(uuid, text, text) set search_path = 'public';
alter function public.send_connection_request(uuid) set search_path = 'public';
alter function public.set_profile_role(uuid, public.user_role) set search_path = 'public';
alter function public.start_direct_conversation(uuid) set search_path = 'public';
```

Regenerate rollback from current production metadata immediately before any real rollout rather than relying on this dated snapshot.

## Explicit exclusions

This Phase B does not:

- revoke authenticated EXECUTE from intentional application RPCs;
- convert SECURITY DEFINER functions to SECURITY INVOKER;
- modify function bodies;
- touch extension-owned `pg_trgm` objects;
- change table grants, RLS, Auth, storage or production data;
- claim that the Supabase Advisor warning disappears completely after search-path hardening (the advisor also flags intentional authenticated execution).

The goal is to reduce avoidable search-path risk while preserving the intentional authorization boundary, then separately review whether any individual RPC is truly unused before considering EXECUTE revocation.