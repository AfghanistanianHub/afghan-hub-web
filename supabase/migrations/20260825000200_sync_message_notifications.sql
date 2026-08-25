create index if not exists notifications_unread_message_conversation_idx
  on public.notifications (recipient_id, conversation_id)
  where type = 'new_message' and read_at is null;

create or replace function public.mark_conversation_read(
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
  membership_updated boolean;
  notifications_updated boolean;
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

  membership_updated := found;

  update public.notifications as notification
  set read_at = now()
  from public.messages as message
  where notification.recipient_id = auth.uid()
    and notification.type = 'new_message'
    and notification.conversation_id = target_conversation_id
    and notification.read_at is null
    and notification.message_id = message.id
    and message.conversation_id = target_conversation_id
    and message.created_at <= read_through_at;

  notifications_updated := found;

  return membership_updated or notifications_updated;
end;
$$;

revoke all on function public.mark_conversation_read(uuid, uuid) from public;
grant execute on function public.mark_conversation_read(uuid, uuid) to authenticated;
