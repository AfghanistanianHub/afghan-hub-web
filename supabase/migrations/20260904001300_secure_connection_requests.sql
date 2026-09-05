-- Require connection requests to go through one validated RPC so clients
-- cannot self-create accepted relationships or target hidden profiles.

drop policy if exists "connections_insert_requester" on public.connections;

revoke insert on public.connections from authenticated;

create or replace function public.send_connection_request(
  target_recipient_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile_id uuid := auth.uid();
  existing_connection_id uuid;
  created_connection_id uuid;
begin
  if current_profile_id is null then
    raise exception 'Authentication required';
  end if;

  if target_recipient_id is null or target_recipient_id = current_profile_id then
    raise exception 'Invalid connection recipient';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = target_recipient_id
      and is_public = true
      and onboarding_completed = true
  ) then
    raise exception 'Recipient is not available for connection requests';
  end if;

  select id
  into existing_connection_id
  from public.connections
  where
    (requester_id = current_profile_id and recipient_id = target_recipient_id)
    or
    (requester_id = target_recipient_id and recipient_id = current_profile_id)
  order by created_at asc
  limit 1;

  if existing_connection_id is not null then
    return existing_connection_id;
  end if;

  insert into public.connections (
    requester_id,
    recipient_id,
    status
  )
  values (
    current_profile_id,
    target_recipient_id,
    'pending'::public.connection_status
  )
  returning id into created_connection_id;

  return created_connection_id;
end;
$$;

revoke execute on function public.send_connection_request(uuid)
  from PUBLIC, anon;

grant execute on function public.send_connection_request(uuid)
  to authenticated;

notify pgrst, 'reload schema';
