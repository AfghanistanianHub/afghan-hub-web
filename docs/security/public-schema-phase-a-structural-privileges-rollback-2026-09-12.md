# Public-schema structural privilege rollback rehearsal — 2026-09-12

Status: **isolated-environment rollback rehearsal only — DO NOT APPLY TO PRODUCTION**

Related: #80 and `public-schema-structural-privilege-forward-rehearsal-2026-09-12.md`.

This rollback restores only the structural table privileges removed by the paired Phase A forward rehearsal. It is based on the 2026-09-12 production ACL snapshot and must be regenerated from same-window metadata before any real production rollout.

## Captured pre-change structural grant map

### `anon` had structural privileges on 10 tables

- `businesses`
- `connections`
- `conversation_members`
- `conversations`
- `events`
- `messages`
- `opportunities`
- `organizations`
- `profiles`
- `saved_opportunities`

`anon` did **not** have the captured structural grants on `event_rsvps` or `notifications`.

### `authenticated` had structural privileges on 11 tables

- `businesses`
- `connections`
- `conversation_members`
- `conversations`
- `event_rsvps`
- `events`
- `messages`
- `opportunities`
- `organizations`
- `profiles`
- `saved_opportunities`

`authenticated` had only table-level `SELECT` on `notifications` in the captured state, so rollback must not invent structural grants there.

## Candidate rollback SQL

```sql
-- ISOLATED REHEARSAL ONLY. NOT AUTHORIZED FOR PRODUCTION.
begin;

-- Restore captured anon structural privileges only where they existed.
grant truncate, references, trigger, maintain
on table
  public.businesses,
  public.connections,
  public.conversation_members,
  public.conversations,
  public.events,
  public.messages,
  public.opportunities,
  public.organizations,
  public.profiles,
  public.saved_opportunities
to anon;

-- Restore captured authenticated structural privileges only where they existed.
grant truncate, references, trigger, maintain
on table
  public.businesses,
  public.connections,
  public.conversation_members,
  public.conversations,
  public.event_rsvps,
  public.events,
  public.messages,
  public.opportunities,
  public.organizations,
  public.profiles,
  public.saved_opportunities
to authenticated;

-- Restore the captured postgres-owned default table behavior for future
-- public tables. This intentionally affects only the privileges changed by
-- the paired forward phase.
alter default privileges for role postgres in schema public
  grant truncate, references, trigger, maintain on tables to anon, authenticated;

commit;
```

## Post-rollback verification

Compare the table ACLs to the captured pre-forward snapshot and verify:

- `notifications` remains `authenticated=SELECT` only at table level;
- `event_rsvps` remains without anon structural privileges;
- all pre-existing DML grants are unchanged from before Phase A;
- postgres-owned default table ACL again contains the structural privileges for both application roles;
- no `supabase_admin` default ACL or extension-owned function was changed by either direction.

## Why rollback is intentionally narrow

Phase A does not touch DML, RLS, functions, #67 column boundaries, Auth, storage or data. The rollback therefore must not modify them either.

A real production rollback package must be regenerated immediately before rollout if any table ownership, ACL or application table list has changed since this snapshot.
