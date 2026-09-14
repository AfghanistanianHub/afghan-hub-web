-- Secondary-only rollback for the paired Phase B least-privilege rehearsal.
begin;

-- Restore anonymous DML on public catalogs to the captured secondary baseline.
grant insert, update, delete on table
  public.businesses,
  public.events,
  public.opportunities,
  public.organizations
 to anon;

-- Restore the captured broad anonymous baseline on these five member-private tables.
grant select, insert, update, delete on table
  public.connections,
  public.conversation_members,
  public.conversations,
  public.messages,
  public.saved_opportunities
 to anon;

-- event_rsvps and notifications had no anon DML before Phase B; do not grant them here.

-- Restore captured authenticated grants removed by the forward package.
grant insert, update on table public.connections to authenticated;
grant insert, update on table public.conversation_members to authenticated;
grant insert, update, delete on table public.conversations to authenticated;
grant update, delete on table public.messages to authenticated;
grant update on table public.saved_opportunities to authenticated;

-- Profiles remain untouched.
commit;
