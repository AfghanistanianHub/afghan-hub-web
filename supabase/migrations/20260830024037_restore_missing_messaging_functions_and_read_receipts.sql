create index if not exists messages_conversation_created_at_active_idx
  on public.messages (conversation_id, created_at desc)
  where deleted_at is null;

create index if not exists conversation_members_profile_conversation_idx
  on public.conversation_members (profile_id, conversation_id);

create or replace function public.get_unread_message_counts()
returns table (
  conversation_id uuid,
  unread_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    membership.conversation_id,
    count(message.id)::bigint as unread_count
  from public.conversation_members as membership
  join public.messages as message
    on message.conversation_id = membership.conversation_id
   and message.sender_id <> auth.uid()
   and message.deleted_at is null
   and (
     membership.last_read_at is null
     or message.created_at > membership.last_read_at
   )
  where membership.profile_id = auth.uid()
  group by membership.conversation_id;
$$;

revoke all on function public.get_unread_message_counts() from public;
grant execute on function public.get_unread_message_counts() to authenticated;

create or replace function public.get_message_inbox()
returns table (
  conversation_id uuid,
  conversation_updated_at timestamptz,
  other_member_id uuid,
  latest_message_body text,
  latest_message_sender_id uuid,
  latest_message_created_at timestamptz,
  unread_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    conversation.id as conversation_id,
    conversation.updated_at as conversation_updated_at,
    other_member.profile_id as other_member_id,
    latest_message.body as latest_message_body,
    latest_message.sender_id as latest_message_sender_id,
    latest_message.created_at as latest_message_created_at,
    coalesce(unread.unread_count, 0)::bigint as unread_count
  from public.conversation_members as membership
  join public.conversations as conversation
    on conversation.id = membership.conversation_id
  left join lateral (
    select member.profile_id
    from public.conversation_members as member
    where member.conversation_id = membership.conversation_id
      and member.profile_id <> auth.uid()
    order by member.joined_at
    limit 1
  ) as other_member on true
  left join lateral (
    select message.body, message.sender_id, message.created_at
    from public.messages as message
    where message.conversation_id = membership.conversation_id
      and message.deleted_at is null
    order by message.created_at desc
    limit 1
  ) as latest_message on true
  left join lateral (
    select count(*)::bigint as unread_count
    from public.messages as message
    where message.conversation_id = membership.conversation_id
      and message.sender_id <> auth.uid()
      and message.deleted_at is null
      and (
        membership.last_read_at is null
        or message.created_at > membership.last_read_at
      )
  ) as unread on true
  where membership.profile_id = auth.uid()
  order by coalesce(latest_message.created_at, conversation.updated_at) desc;
$$;

revoke all on function public.get_message_inbox() from public;
grant execute on function public.get_message_inbox() to authenticated;

create or replace function public.mark_conversation_read(
  target_conversation_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  latest_message_at timestamptz;
begin
  if auth.uid() is null then
    return false;
  end if;

  select max(message.created_at)
  into latest_message_at
  from public.messages as message
  where message.conversation_id = target_conversation_id
    and message.deleted_at is null;

  if latest_message_at is null then
    return false;
  end if;

  update public.conversation_members
  set last_read_at = greatest(
    coalesce(last_read_at, '-infinity'::timestamptz),
    latest_message_at
  )
  where conversation_id = target_conversation_id
    and profile_id = auth.uid()
    and (
      last_read_at is null
      or last_read_at < latest_message_at
    );

  return found;
end;
$$;

revoke all on function public.mark_conversation_read(uuid) from public;
grant execute on function public.mark_conversation_read(uuid) to authenticated;

create or replace function public.start_direct_conversation(
  target_member_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile_id uuid := auth.uid();
  conversation_id uuid;
begin
  if current_profile_id is null then
    raise exception 'Authentication required';
  end if;

  if target_member_id is null or target_member_id = current_profile_id then
    raise exception 'Invalid conversation member';
  end if;

  if not exists (
    select 1
    from public.connections
    where status = 'accepted'
      and (
        (requester_id = current_profile_id and recipient_id = target_member_id)
        or
        (requester_id = target_member_id and recipient_id = current_profile_id)
      )
  ) then
    raise exception 'An accepted connection is required';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(
      least(current_profile_id::text, target_member_id::text)
      || ':' ||
      greatest(current_profile_id::text, target_member_id::text),
      0
    )
  );

  select conversation.id
  into conversation_id
  from public.conversations as conversation
  where exists (
    select 1 from public.conversation_members as member
    where member.conversation_id = conversation.id
      and member.profile_id = current_profile_id
  )
    and exists (
      select 1 from public.conversation_members as member
      where member.conversation_id = conversation.id
        and member.profile_id = target_member_id
    )
    and (
      select count(*) from public.conversation_members as member
      where member.conversation_id = conversation.id
    ) = 2
  limit 1;

  if conversation_id is not null then
    return conversation_id;
  end if;

  insert into public.conversations (created_by)
  values (current_profile_id)
  returning id into conversation_id;

  insert into public.conversation_members (conversation_id, profile_id)
  values
    (conversation_id, current_profile_id),
    (conversation_id, target_member_id);

  return conversation_id;
end;
$$;

revoke all on function public.start_direct_conversation(uuid) from public;
grant execute on function public.start_direct_conversation(uuid) to authenticated;


drop function if exists public.mark_conversation_read(uuid);

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


do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'conversation_members'
  ) then
    alter publication supabase_realtime
      add table public.conversation_members;
  end if;
end
$$;


revoke execute on function public.get_unread_message_counts(), public.get_message_inbox(), public.mark_conversation_read(uuid,uuid), public.start_direct_conversation(uuid) from anon;
