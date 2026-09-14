# Phase B direct-DML privilege forward rehearsal — 2026-09-13

Status: **review/rehearsal only — DO NOT APPLY TO PRODUCTION**

Related: #80, #136. Phase A structural privilege hardening is complete for the explicit application-table scope. This phase narrows only direct table DML that has no matching application/RLS use in current production metadata.

## Production metadata basis

Fresh read-only inventory on 2026-09-13/14 confirmed:

- anonymous public catalog access is policy-backed only by `SELECT` on `businesses`, `events`, `opportunities`, and `organizations`;
- `connections`, `conversation_members`, `conversations`, `messages`, and `saved_opportunities` have no anon policies;
- `conversations` has only authenticated `SELECT` policy; direct creation is RPC-driven;
- `saved_opportunities` has authenticated `SELECT`, `INSERT`, and `DELETE` policies, but no `UPDATE` policy;
- `profiles` uses privacy-specific/column-level grants after #67 and is excluded from this phase;
- `event_rsvps` and `notifications` are already narrow enough at the table-grant layer for this phase.

## Candidate forward SQL

```sql
-- REHEARSAL ONLY. NOT AUTHORIZED FOR PRODUCTION.
begin;

-- Anonymous users only need SELECT on the four published public catalogs.
revoke insert, update, delete on table
  public.businesses,
  public.events,
  public.opportunities,
  public.organizations
from anon;

-- No anonymous RLS policy or application path exists for these member-private tables.
revoke select, insert, update, delete on table
  public.connections,
  public.conversation_members,
  public.conversations,
  public.messages,
  public.saved_opportunities
from anon;

-- Authenticated direct DML should match current policy-backed application behavior.
revoke delete on table public.conversations from authenticated;
revoke update on table public.saved_opportunities from authenticated;

commit;
```

## Deliberate non-changes

This phase does not change:

- any RLS policy;
- any function/RPC EXECUTE grant;
- any profile table/column privilege;
- any structural privilege (`TRUNCATE`, `REFERENCES`, `TRIGGER`, `MAINTAIN`), already handled in Phase A;
- authenticated CRUD on public catalog owner/creator flows;
- authenticated connection/member/message/RSVP/notification grants that correspond to current policies;
- default privileges for platform-owned roles.

## Required post-forward assertions

1. `anon` retains only `SELECT` on the four public catalog tables above and has no direct table privileges on the five member-private tables listed above.
2. `authenticated` no longer has `DELETE` on `conversations` or `UPDATE` on `saved_opportunities`.
3. All other pre-existing application grants remain unchanged, especially all profile column grants.
4. Public anonymous catalog reads still succeed and unpublished rows remain hidden by RLS.
5. Controlled member journeys still pass for connection send/respond/remove, direct-conversation creation, messaging, notification read state, save/remove opportunity, and event RSVP flows.
6. Direct attempts at the newly revoked operations fail at the grant layer.

## Production gate

Do not apply until paired rollback is reviewed, exact pre-change ACLs are recaptured in the same change window, controlled hosted acceptance (#120) covers the RPC-dependent paths, and explicit production authorization is recorded.
