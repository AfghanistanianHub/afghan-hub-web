drop function if exists public.mark_conversation_read(uuid);

create function public.mark_conversation_read(
  target_conversation_id uuid,
  read_through_message_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  read_through_at timestamptz;
begin
  if auth.uid() is null then
    return false;
  end if;

  select message.created_at
  into read_through_at
  from public.messages as message
  where message.id = read_through_message_id
    and message.conversation_id = target_conversation_id
    and message.deleted_at is null;

  if read_through_at is null then
    return false;
  end if;

  update public.conversation_members
  set last_read_at = greatest(
    coalesce(last_read_at, '-infinity'::timestamptz),
    read_through_at
  )
  where conversation_id = target_conversation_id
    and profile_id = auth.uid()
    and (
      last_read_at is null
      or last_read_at < read_through_at
    );

  return found;
end;
$$;

revoke all on function public.mark_conversation_read(uuid, uuid) from public;
grant execute on function public.mark_conversation_read(uuid, uuid) to authenticated;
