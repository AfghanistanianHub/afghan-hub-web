# Phase B direct-DML privilege rollback rehearsal — 2026-09-13

Status: **review/rehearsal only — DO NOT APPLY TO PRODUCTION**

Related: #80, #136 and the paired Phase B forward rehearsal.

This rollback restores only the direct DML privileges removed by the paired Phase B candidate. It does not alter RLS, functions, profile column grants, structural privileges, or default ACLs.

## Candidate rollback SQL

```sql
-- REHEARSAL ONLY. NOT AUTHORIZED FOR PRODUCTION.
begin;

-- Restore the exact anonymous DML grants observed before Phase B.
grant insert, update, delete on table
  public.businesses,
  public.events,
  public.opportunities,
  public.organizations
 to anon;

grant select, insert, update, delete on table
  public.connections,
  public.conversation_members,
  public.conversations,
  public.messages,
  public.saved_opportunities
 to anon;

-- Restore the two authenticated grants removed by Phase B.
grant delete on table public.conversations to authenticated;
grant update on table public.saved_opportunities to authenticated;

commit;
```

## Rollback verification

Before any real production use, regenerate the baseline in the same change window and compare exact ACL rows. After rollback, verify:

- the affected grant tuples match the captured pre-change baseline exactly;
- profile table and column grants are unchanged;
- Phase A structural privileges remain revoked;
- RLS policy definitions and enabled/forced flags are unchanged;
- public catalog and member/RPC flows return to the pre-change behavior.

## Important limitation

This file is based on the read-only production ACL inventory captured on 2026-09-13/14. It is not a timeless migration. If grants drift before a production window, stop and regenerate both forward and rollback packages from current metadata.
