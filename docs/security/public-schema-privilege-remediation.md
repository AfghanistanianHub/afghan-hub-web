# Public-schema privilege remediation plan

Status: **review-only / not a migration**

Tracks: GitHub issue #80

## Why this exists

A read-only production audit found that `anon` and `authenticated` currently inherit broader PostgreSQL privileges than the application needs on a number of `public` tables. Existing/default ACLs include privilege strings equivalent to broad table access (`arwdDxtm`) and therefore include privileges such as `TRUNCATE`, `REFERENCES`, `TRIGGER` and `MAINTAIN` in addition to ordinary DML.

RLS remains the primary policy boundary for normal PostgREST `SELECT` / `INSERT` / `UPDATE` / `DELETE`, and no direct anonymous/authenticated arbitrary-SQL RPC was found during the audit. Supabase/PostgREST does not expose a normal table endpoint that directly issues `TRUNCATE`. For that reason this finding is not classified here as a demonstrated remote table-wipe exploit. It is still a material least-privilege defect because `TRUNCATE` is not governed by RLS and excessive grants increase blast radius if another SQL-capable path is introduced or exposed later.

## Confirmed production evidence

Read-only metadata inspection found broad object/default privileges for both `postgres`-owned and `supabase_admin`-owned objects in the public schema. Current table grants include `TRUNCATE` for anon/authenticated on multiple application tables, including profiles, content tables, connections, conversations, conversation membership and messages.

A dynamic-SQL review did not identify an anon/authenticated arbitrary-SQL application RPC. The relevant dynamic SQL found was the internal `rls_auto_enable` event-trigger function, which is executable only by privileged roles. Existing application RPCs reviewed for connections and messaging use explicit IDs and authorization checks rather than arbitrary SQL text.

## Desired end state

1. `anon` and `authenticated` have only privileges actually required by the application/API contract.
2. `TRUNCATE`, `TRIGGER`, `REFERENCES` and `MAINTAIN` are not granted to application roles unless a specific reviewed requirement exists.
3. Direct table DML is granted only where the application intentionally performs direct DML and RLS provides a tested boundary.
4. Operations intentionally implemented through security-definer RPCs do not also require broad direct-table mutation grants.
5. Public-schema default privileges are corrected so newly created tables/functions/sequences do not silently reintroduce broad application-role privileges.
6. Service-role/postgres maintenance capabilities remain available to trusted backend/administrative paths.

## Current minimum-privilege working matrix

This matrix is a design target and must be validated against application code and direct API persona tests before implementation.

| Object / area | anon | authenticated | Notes |
| --- | --- | --- | --- |
| Public catalog: opportunities/events/businesses/organizations | `SELECT` only where public RLS intentionally permits published rows | `SELECT` plus only owner-author mutations required by current app | Remove nonessential structural privileges. Preserve tested owner contribution flows. |
| `profiles` | no broad direct private-column access; public launch currently does not require anonymous member discovery | safe-field reads plus self-owned mutations only, with private/self/admin data moved behind reviewed RPCs | Must be coordinated with profile privacy remediation issue #67. |
| `connections` | none | participant `SELECT`/`DELETE` if direct delete remains; creation/response through RPCs | `send_connection_request` and `respond_connection_request` already enforce identity in DB. |
| `conversations` | none | `SELECT` for members only | Creation is through `start_direct_conversation`; direct insert is not required. |
| `conversation_members` | none | member `SELECT`; self-delete only if product intentionally supports leaving | Direct insert should remain unavailable; conversation creation RPC owns membership creation. |
| `messages` | none | `SELECT` and `INSERT` only | RLS requires membership and sender = `auth.uid()`. No direct update/delete is required by current send flow. |
| `notifications` | none | recipient-scoped `SELECT`; write/read-state operations should use narrow RPCs where possible | `mark_notification_read` enforces recipient ownership. |
| `saved_opportunities` | none unless a public use is explicitly documented | self-owned `SELECT`/`INSERT`/`DELETE` as required | Validate current saved-content code before final grants. |
| `event_rsvps` | none unless public aggregate reads require it | participant-owned reads/mutations required by RSVP flow | Validate RSVP/capacity flow before final grants. |

## Default privilege correction

The eventual production-specific migration should change default privileges for every role that owns/creates application objects in `public` (at least the currently observed `postgres` and `supabase_admin` ownership paths). Do not assume changing one owner's defaults changes the other owner's defaults.

Conceptually, the migration should revoke broad default grants from `anon` and `authenticated`, then deliberately grant only the narrow defaults the project wants. Exact SQL must be generated and reviewed against current production ownership/ACL metadata in an isolated environment first.

**Do not paste a generic `ALTER DEFAULT PRIVILEGES` snippet into production without checking the object owner context.** Default privileges are owner-specific.

## Existing table privilege correction

The final migration should separately address existing tables because changing default privileges does not retroactively change current object ACLs.

For each application table:

1. capture current owner, ACL, RLS state and policies;
2. derive required direct operations from application code and RPC usage;
3. revoke structural privileges not needed by application roles (`TRUNCATE`, `TRIGGER`, `REFERENCES`, `MAINTAIN`);
4. revoke unnecessary direct DML when a reviewed RPC is the intended mutation path;
5. re-grant only the explicit required direct DML;
6. run persona tests through the same publishable/authenticated API path used by the app.

## Function privilege follow-up

The same audit showed broad default `EXECUTE` grants on public functions. This plan does **not** recommend blanket revocation because core application behavior relies on authenticated RPCs. Instead:

- inventory every public application RPC;
- classify intended callers: anon, authenticated, service role, admin-only/internal;
- revoke anon/authenticated execute from functions not intentionally exposed;
- keep security-definer functions on explicit empty/fixed `search_path` and verify authorization internally.

Known follow-up: several older functions such as `send_connection_request`, `start_direct_conversation`, and `mark_conversation_read` use a fixed `search_path=public` rather than the newer empty search path style. Because application roles do not currently have schema `CREATE`, this is not being treated as an immediate exploit, but they should be normalized during reviewed security hardening.

## Required pre-production tests

The isolated/staging environment must prove at minimum:

- anonymous public catalog reads still return only allowed published fields/rows;
- anon cannot mutate or structurally alter application tables;
- ordinary authenticated member can update own profile fields required by the product but not another member's private/internal fields;
- connection send/respond/remove behavior still works for valid participants and fails for unrelated users;
- direct conversation creation still requires an accepted connection;
- conversation/message reads fail for unrelated users;
- message insert succeeds only for a conversation member sending as self;
- notification read operations affect only the authenticated recipient;
- contribution create/edit/delete flows preserve owner-only authorization;
- RSVP/save flows still work for the owner/participant persona;
- moderator/admin flows continue through their intended RPCs;
- `TRUNCATE`, `TRIGGER`, `REFERENCES` and `MAINTAIN` are absent from anon/authenticated after remediation unless explicitly documented otherwise;
- newly created test objects do not inherit the old broad defaults.

## Rollout gates

Do not apply this plan directly to production until all of these are true:

1. a production-compatible isolated database is available;
2. the current production ACL/owner/default-ACL snapshot is captured;
3. the exact change set is tested against application persona scenarios;
4. rollback SQL is generated from the pre-change snapshot;
5. profile privacy remediation (#67) and privilege remediation (#80) are checked for interaction;
6. production migration-history mismatch is accounted for without `db push`/blind history repair;
7. an explicit production security-change decision is made.

## Rollback principle

Rollback must restore the captured pre-change ACL/default-ACL state, not rely on broad `GRANT ALL` guesses. Keep the pre-change privilege snapshot with the reviewed migration package so rollback is deterministic.

## Explicit non-actions

This document does not authorize or perform:

- production `REVOKE` / `GRANT` changes;
- Supabase branch creation or other potentially billable infrastructure;
- migration-history repair;
- production data modification;
- expansion of anonymous member discovery.
