drop policy if exists connections_update_participant
on public.connections

drop policy if exists connections_update_recipient
on public.connections

create policy connections_update_recipient
on public.connections for update
to authenticated
using (
  recipient_id = (select auth.uid())
  or public.is_admin()
)
with check (
  recipient_id = (select auth.uid())
  or public.is_admin()
)