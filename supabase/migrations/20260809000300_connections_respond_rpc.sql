drop policy if exists connections_update_participant
on public.connections;

drop policy if exists connections_update_recipient
on public.connections;

revoke update on table public.connections
from public, anon, authenticated;

create or replace function public.respond_connection_request(
  target_connection_id uuid,
  target_decision text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  recipient_profile_id uuid := (select auth.uid());
  affected_rows integer;
begin
  if recipient_profile_id is null
    or target_decision is null
    or target_decision not in ('accepted', 'declined') then
    return false;
  end if;

  if target_decision = 'accepted' then
    update public.connections
    set status = 'accepted'
    where id = target_connection_id
      and recipient_id = recipient_profile_id
      and status = 'pending';
  else
    delete from public.connections
    where id = target_connection_id
      and recipient_id = recipient_profile_id
      and status = 'pending';
  end if;

  get diagnostics affected_rows = row_count;
  return affected_rows = 1;
end;
$$;

revoke all on function public.respond_connection_request(uuid, text)
from public, anon, authenticated;

grant execute on function public.respond_connection_request(uuid, text)
to authenticated;
