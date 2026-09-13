# Public-schema structural privilege forward rehearsal — 2026-09-12

Status: **isolated-environment rehearsal only — DO NOT APPLY TO PRODUCTION**

Related: #80, `public-schema-privilege-remediation.md`, `production-authorization-rollback-snapshot-2026-09-12.md`, `public-function-exposure-snapshot-2026-09-12.md`.

This is intentionally a narrow first phase of least-privilege hardening. It removes only structural table privileges that Afghan Hub's browser/server clients do not need for normal PostgREST DML:

- `TRUNCATE`
- `REFERENCES`
- `TRIGGER`
- `MAINTAIN`

It does **not** change `SELECT`, `INSERT`, `UPDATE` or `DELETE`, does not alter RLS, and does not touch any function execution grant.

Production is PostgreSQL 17.6. Current application relations are postgres-owned. `supabase_admin` currently owns only 31 `public` functions and all of them are extension-owned; the current postgres migration/session role is not a member of `supabase_admin`. This package therefore deliberately leaves `supabase_admin` defaults and pg_trgm/platform-owned objects alone.

## Explicit application table scope

The current postgres-owned application tables in scope are:

- `businesses`
- `connections`
- `conversation_members`
- `conversations`
- `event_rsvps`
- `events`
- `messages`
- `notifications`
- `opportunities`
- `organizations`
- `profiles`
- `saved_opportunities`

Using an explicit list prevents unrelated future/platform relations in `public` from being changed accidentally.

## Candidate forward SQL

```sql
-- ISOLATED REHEARSAL ONLY. NOT AUTHORIZED FOR PRODUCTION.
begin;

revoke truncate, references, trigger, maintain
on table
  public.businesses,
  public.connections,
  public.conversation_members,
  public.conversations,
  public.event_rsvps,
  public.events,
  public.messages,
  public.notifications,
  public.opportunities,
  public.organizations,
  public.profiles,
  public.saved_opportunities
from anon, authenticated;

-- Prevent future postgres-owned application tables created in public from
-- inheriting these structural privileges through the current broad default ACL.
alter default privileges for role postgres in schema public
  revoke truncate, references, trigger, maintain on tables from anon, authenticated;

commit;
```

## Why this phase should be behavior-preserving

Normal application requests use relation DML and RPCs. They do not require client roles to:

- truncate tables;
- create/alter database triggers;
- create foreign-key constraints;
- run PostgreSQL table-maintenance commands.

RLS does not govern `TRUNCATE`, so removing it reduces blast radius even though no arbitrary SQL RPC has been found.

This phase intentionally leaves all existing row-level DML privileges exactly as they are so owner/contribution/messaging/connection flows are not mixed into the same change.

## Preflight assertions for isolated execution

Before applying, verify:

```sql
select current_setting('server_version');
select current_user;
```

Expected production-compatible baseline:

- PostgreSQL 17.x with `MAINTAIN` table privilege support;
- migration role able to alter `postgres` default privileges;
- listed application tables owned by `postgres`.

If ownership differs in staging or future production, stop and regenerate the package from current metadata.

## Required post-forward assertions

For every listed table, verify `anon`/`authenticated` no longer have:

```text
TRUNCATE
REFERENCES
TRIGGER
MAINTAIN
```

Then separately verify pre-existing DML grants are unchanged.

Also inspect `pg_default_acl` for owner `postgres` in schema `public` and prove the structural table privilege letters are no longer inherited by `anon`/`authenticated` for future postgres-owned tables.

## Application regression set

Even though this phase should be DML-neutral, run the existing application paths before considering production:

- public published catalog reads;
- profile self update;
- member discovery;
- connection send/respond/remove;
- conversation creation and messaging;
- notification read state;
- opportunity/event/business/organization create/edit/delete/moderation;
- save opportunity;
- RSVP/cancel/count;
- admin role management.

## Deliberate exclusions

This phase does not yet:

- remove unnecessary direct INSERT/UPDATE/DELETE grants;
- change profile field-level SELECT (#67 package handles that separately);
- change function EXECUTE ACLs;
- normalize SECURITY DEFINER search paths;
- change extension-owned pg_trgm functions;
- touch `supabase_admin` default privileges;
- repair migration history;
- modify any data.

Those must remain separately reviewable phases.

## Production gate

Do not convert this document into a production migration until it passes in an isolated production-compatible database, the paired rollback is verified, DML grants are diffed before/after, application regressions pass, and explicit production authorization is given.
