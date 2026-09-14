-- Afghan Hub secondary-only messaging acceptance sync
-- Requires the earlier secondary role/RSVP refresh (notifications table present).
-- Does not modify production and does not implement Phase-B privilege reduction.

begin;

do $$
begin
  if to_regclass('public.notifications') is null then
    raise exception 'secondary messaging baseline mismatch: notifications table missing';
  end if;

  if exists (select 1 from public.connections limit 1)
     or exists (select 1 from public.conversation_members limit 1)
     or exists (select 1 from public.conversations limit 1)
     or exists (select 1 from public.messages limit 1)
     or exists (select 1 from public.saved_opportunities limit 1)
     or exists (select 1 from public.notifications limit 1) then
    raise exception 'secondary messaging baseline mismatch: expected disposable messaging tables to be empty';
  end if;

  if exists (select 1 from pg_policies where schemaname='public' and tablename in ('connections','conversation_members','conversations','messages','saved_opportunities')) then
    raise exception 'secondary messaging baseline changed: policy already exists';
  end if;

  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in (
      'send_connection_request','respond_connection_request','start_direct_conversation',
      'get_message_inbox','get_unread_message_counts','mark_conversation_read',
      'mark_all_notifications_read','mark_notification_read','is_conversation_member',
      'create_connection_request_notification','create_connection_accepted_notification','create_new_message_notifications'
    )
  ) then raise exception 'secondary messaging baseline changed: messaging function already exists'; end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='conversations' and column_name='created_by'
  ) then raise exception 'secondary messaging baseline changed: conversations.created_by already exists'; end if;

  if exists (
    select 1 from pg_type t join pg_namespace n on n.oid=t.typnamespace
    where n.nspname='public' and t.typname='connection_status'
  ) then raise exception 'secondary messaging baseline changed: connection_status already exists'; end if;
end $$;

-- Align the connection status contract with production.
alter table public.connections drop constraint if exists connections_valid_status;
create type public.connection_status as enum ('pending','accepted','declined','blocked');
alter table public.connections alter column status drop default;
alter table public.connections alter column status type public.connection_status using status::public.connection_status;
alter table public.connections alter column status set default 'pending'::public.connection_status;

-- Empty secondary table: no data backfill is needed.
alter table public.conversations
  add column created_by uuid not null references public.profiles(id) on delete cascade;

-- Notification uniqueness/performance required by the production triggers/read-state flow.
create unique index notifications_connection_event_unique_idx
  on public.notifications(recipient_id,type,connection_id)
  where connection_id is not null;
create unique index notifications_message_event_unique_idx
  on public.notifications(recipient_id,type,message_id)
  where message_id is not null;
create index notifications_unread_message_conversation_idx
  on public.notifications(recipient_id,conversation_id)
  where type='new_message' and read_at is null;

-- RLS policy contract.
create policy connections_select_participant on public.connections for select to authenticated
using (requester_id=(select auth.uid()) or recipient_id=(select auth.uid()) or public.is_admin());
create policy connections_delete_participant on public.connections for delete to authenticated
using (requester_id=(select auth.uid()) or recipient_id=(select auth.uid()) or public.is_admin());

create or replace function public.is_conversation_member(target_conversation_id uuid)
returns boolean language sql stable security definer set search_path=''
as $$
  select exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id=target_conversation_id
      and cm.profile_id=(select auth.uid())
  );
$$;
revoke all on function public.is_conversation_member(uuid) from public, anon;
grant execute on function public.is_conversation_member(uuid) to authenticated;

create policy conversation_members_select_member on public.conversation_members for select to authenticated
using (public.is_conversation_member(conversation_id));
create policy conversation_members_delete_self on public.conversation_members for delete to authenticated
using (profile_id=(select auth.uid()));
create policy conversations_select_member on public.conversations for select to authenticated
using (public.is_conversation_member(id));
create policy messages_select_member on public.messages for select to authenticated
using (public.is_conversation_member(conversation_id));
create policy messages_insert_member on public.messages for insert to authenticated
with check (sender_id=(select auth.uid()) and public.is_conversation_member(conversation_id));

create policy saved_opportunities_select_self on public.saved_opportunities for select to authenticated
using (profile_id=(select auth.uid()));
create policy saved_opportunities_insert_self on public.saved_opportunities for insert to authenticated
with check (profile_id=(select auth.uid()));
create policy saved_opportunities_delete_self on public.saved_opportunities for delete to authenticated
using (profile_id=(select auth.uid()));

-- Connection workflow RPCs.
create or replace function public.send_connection_request(target_recipient_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare
  current_profile_id uuid:=auth.uid();
  existing_connection_id uuid;
  created_connection_id uuid;
begin
  if current_profile_id is null then raise exception 'Authentication required'; end if;
  if target_recipient_id is null or target_recipient_id=current_profile_id then raise exception 'Invalid connection recipient'; end if;
  if not exists (
    select 1 from public.profiles
    where id=target_recipient_id and is_public=true and onboarding_completed=true
  ) then raise exception 'Recipient is not available for connection requests'; end if;

  select id into existing_connection_id
  from public.connections
  where (requester_id=current_profile_id and recipient_id=target_recipient_id)
     or (requester_id=target_recipient_id and recipient_id=current_profile_id)
  order by created_at asc limit 1;
  if existing_connection_id is not null then return existing_connection_id; end if;

  insert into public.connections(requester_id,recipient_id,status)
  values(current_profile_id,target_recipient_id,'pending'::public.connection_status)
  returning id into created_connection_id;
  return created_connection_id;
end $$;

create or replace function public.respond_connection_request(target_connection_id uuid,target_decision text)
returns boolean language plpgsql security definer set search_path='' as $$
declare
  recipient_profile_id uuid:=(select auth.uid());
  affected_rows integer;
begin
  if recipient_profile_id is null or target_decision is null or target_decision not in ('accepted','declined') then return false; end if;
  if target_decision='accepted' then
    update public.connections set status='accepted' where id=target_connection_id and recipient_id=recipient_profile_id and status='pending';
  else
    delete from public.connections where id=target_connection_id and recipient_id=recipient_profile_id and status='pending';
  end if;
  get diagnostics affected_rows=row_count;
  return affected_rows=1;
end $$;

create or replace function public.start_direct_conversation(target_member_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare
  current_profile_id uuid:=auth.uid();
  conversation_id uuid;
begin
  if current_profile_id is null then raise exception 'Authentication required'; end if;
  if target_member_id is null or target_member_id=current_profile_id then raise exception 'Invalid conversation member'; end if;
  if not exists (
    select 1 from public.connections
    where status='accepted'
      and ((requester_id=current_profile_id and recipient_id=target_member_id)
        or (requester_id=target_member_id and recipient_id=current_profile_id))
  ) then raise exception 'An accepted connection is required'; end if;

  perform pg_advisory_xact_lock(hashtextextended(
    least(current_profile_id::text,target_member_id::text)||':'||greatest(current_profile_id::text,target_member_id::text),0));

  select conversation.id into conversation_id
  from public.conversations as conversation
  where exists(select 1 from public.conversation_members member where member.conversation_id=conversation.id and member.profile_id=current_profile_id)
    and exists(select 1 from public.conversation_members member where member.conversation_id=conversation.id and member.profile_id=target_member_id)
    and (select count(*) from public.conversation_members member where member.conversation_id=conversation.id)=2
  limit 1;
  if conversation_id is not null then return conversation_id; end if;

  insert into public.conversations(created_by) values(current_profile_id) returning id into conversation_id;
  insert into public.conversation_members(conversation_id,profile_id)
  values(conversation_id,current_profile_id),(conversation_id,target_member_id);
  return conversation_id;
end $$;

-- Read-state/inbox RPCs.
create or replace function public.get_message_inbox()
returns table(conversation_id uuid,conversation_updated_at timestamptz,other_member_id uuid,latest_message_body text,latest_message_sender_id uuid,latest_message_created_at timestamptz,unread_count bigint)
language sql stable security definer set search_path=public as $$
  select conversation.id,conversation.updated_at,other_member.profile_id,
    latest_message.body,latest_message.sender_id,latest_message.created_at,
    coalesce(unread.unread_count,0)::bigint
  from public.conversation_members membership
  join public.conversations conversation on conversation.id=membership.conversation_id
  left join lateral (
    select member.profile_id from public.conversation_members member
    where member.conversation_id=membership.conversation_id and member.profile_id<>auth.uid()
    order by member.joined_at limit 1
  ) other_member on true
  left join lateral (
    select message.body,message.sender_id,message.created_at from public.messages message
    where message.conversation_id=membership.conversation_id and message.deleted_at is null
    order by message.created_at desc limit 1
  ) latest_message on true
  left join lateral (
    select count(*)::bigint as unread_count from public.messages message
    where message.conversation_id=membership.conversation_id and message.sender_id<>auth.uid()
      and message.deleted_at is null
      and (membership.last_read_at is null or message.created_at>membership.last_read_at)
  ) unread on true
  where membership.profile_id=auth.uid()
  order by coalesce(latest_message.created_at,conversation.updated_at) desc;
$$;

create or replace function public.get_unread_message_counts()
returns table(conversation_id uuid,unread_count bigint)
language sql stable security definer set search_path=public as $$
  select membership.conversation_id,count(message.id)::bigint
  from public.conversation_members membership
  join public.messages message on message.conversation_id=membership.conversation_id
    and message.sender_id<>auth.uid() and message.deleted_at is null
    and (membership.last_read_at is null or message.created_at>membership.last_read_at)
  where membership.profile_id=auth.uid()
  group by membership.conversation_id;
$$;

create or replace function public.mark_conversation_read(target_conversation_id uuid,read_through_message_id uuid)
returns boolean language plpgsql security definer set search_path=public as $$
declare
  read_through_at timestamptz;
  membership_updated boolean;
  notifications_updated boolean;
begin
  if auth.uid() is null then return false; end if;
  select message.created_at into read_through_at from public.messages message
  where message.id=read_through_message_id and message.conversation_id=target_conversation_id and message.deleted_at is null;
  if read_through_at is null then return false; end if;

  update public.conversation_members
  set last_read_at=greatest(coalesce(last_read_at,'-infinity'::timestamptz),read_through_at)
  where conversation_id=target_conversation_id and profile_id=auth.uid()
    and (last_read_at is null or last_read_at<read_through_at);
  membership_updated:=found;

  update public.notifications notification set read_at=now()
  from public.messages message
  where notification.recipient_id=auth.uid() and notification.type='new_message'
    and notification.conversation_id=target_conversation_id and notification.read_at is null
    and notification.message_id=message.id and message.conversation_id=target_conversation_id
    and message.created_at<=read_through_at;
  notifications_updated:=found;
  return membership_updated or notifications_updated;
end $$;

create or replace function public.mark_all_notifications_read()
returns integer language plpgsql security definer set search_path='' as $$
declare updated_count integer;
begin
  update public.notifications set read_at=now() where recipient_id=(select auth.uid()) and read_at is null;
  get diagnostics updated_count=row_count; return updated_count;
end $$;

create or replace function public.mark_notification_read(target_notification_id uuid)
returns boolean language plpgsql security definer set search_path='' as $$
begin
  update public.notifications set read_at=now()
  where id=target_notification_id and recipient_id=(select auth.uid()) and read_at is null;
  return found;
end $$;

-- Notification trigger helpers are internal-only.
create or replace function public.create_connection_request_notification()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.status='pending' then
    insert into public.notifications(recipient_id,actor_id,type,connection_id)
    values(new.recipient_id,new.requester_id,'connection_request',new.id)
    on conflict do nothing;
  end if;
  return new;
end $$;

create or replace function public.create_connection_accepted_notification()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if old.status='pending' and new.status='accepted' then
    insert into public.notifications(recipient_id,actor_id,type,connection_id)
    values(old.requester_id,old.recipient_id,'connection_accepted',old.id)
    on conflict do nothing;
  end if;
  return new;
end $$;

create or replace function public.create_new_message_notifications()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.deleted_at is null then
    insert into public.notifications(recipient_id,actor_id,type,conversation_id,message_id)
    select conversation_member.profile_id,new.sender_id,'new_message',new.conversation_id,new.id
    from public.conversation_members conversation_member
    where conversation_member.conversation_id=new.conversation_id and conversation_member.profile_id<>new.sender_id
    on conflict do nothing;
  end if;
  return new;
end $$;

revoke all on function public.create_connection_request_notification() from public,anon,authenticated;
revoke all on function public.create_connection_accepted_notification() from public,anon,authenticated;
revoke all on function public.create_new_message_notifications() from public,anon,authenticated;
grant execute on function public.create_connection_request_notification() to postgres,service_role;
grant execute on function public.create_connection_accepted_notification() to postgres,service_role;
grant execute on function public.create_new_message_notifications() to postgres,service_role;

create trigger connections_create_request_notification after insert on public.connections
for each row execute function public.create_connection_request_notification();
create trigger connections_create_accepted_notification after update of status on public.connections
for each row execute function public.create_connection_accepted_notification();
create trigger messages_create_notifications after insert on public.messages
for each row execute function public.create_new_message_notifications();

-- Public RPC grants: authenticated only.
revoke all on function public.send_connection_request(uuid) from public,anon;
revoke all on function public.respond_connection_request(uuid,text) from public,anon;
revoke all on function public.start_direct_conversation(uuid) from public,anon;
revoke all on function public.get_message_inbox() from public,anon;
revoke all on function public.get_unread_message_counts() from public,anon;
revoke all on function public.mark_conversation_read(uuid,uuid) from public,anon;
revoke all on function public.mark_all_notifications_read() from public,anon;
revoke all on function public.mark_notification_read(uuid) from public,anon;
grant execute on function public.send_connection_request(uuid) to authenticated;
grant execute on function public.respond_connection_request(uuid,text) to authenticated;
grant execute on function public.start_direct_conversation(uuid) to authenticated;
grant execute on function public.get_message_inbox() to authenticated;
grant execute on function public.get_unread_message_counts() to authenticated;
grant execute on function public.mark_conversation_read(uuid,uuid) to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;

notify pgrst,'reload schema';
commit;
