create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  connection_id uuid references public.connections(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  message_id uuid references public.messages(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now(),

  constraint notifications_type_check check (
    type in (
      'connection_request',
      'connection_accepted',
      'new_message'
    )
  ),
  constraint notifications_actor_not_recipient check (
    actor_id is null or actor_id <> recipient_id
  ),
  constraint notifications_target_check check (
    (
      type in ('connection_request', 'connection_accepted')
      and connection_id is not null
      and conversation_id is null
      and message_id is null
    )
    or
    (
      type = 'new_message'
      and connection_id is null
      and conversation_id is not null
      and message_id is not null
    )
  )
)

create index notifications_recipient_created_at_idx
  on public.notifications(recipient_id, created_at desc)

create index notifications_recipient_unread_idx
  on public.notifications(recipient_id, created_at desc)
  where read_at is null

create unique index notifications_connection_event_unique_idx
  on public.notifications(recipient_id, type, connection_id)
  where connection_id is not null

create unique index notifications_message_event_unique_idx
  on public.notifications(recipient_id, type, message_id)
  where message_id is not null

revoke all on table public.notifications from anon, authenticated

grant select on table public.notifications to authenticated

alter table public.notifications enable row level security

create policy notifications_select_recipient
on public.notifications for select
to authenticated
using (recipient_id = (select auth.uid()))

create or replace function public.mark_notification_read(
  target_notification_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.notifications
  set read_at = now()
  where id = target_notification_id
    and recipient_id = (select auth.uid())
    and read_at is null;

  return found;
end;
$$

revoke all on function public.mark_notification_read(uuid)
from public, anon, authenticated

grant execute on function public.mark_notification_read(uuid) to authenticated

create or replace function public.mark_all_notifications_read()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_count integer;
begin
  update public.notifications
  set read_at = now()
  where recipient_id = (select auth.uid())
    and read_at is null;

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$

revoke all on function public.mark_all_notifications_read()
from public, anon, authenticated

grant execute on function public.mark_all_notifications_read() to authenticated

create or replace function public.create_connection_request_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'pending' then
    insert into public.notifications (
      recipient_id,
      actor_id,
      type,
      connection_id
    )
    values (
      new.recipient_id,
      new.requester_id,
      'connection_request',
      new.id
    )
    on conflict do nothing;
  end if;

  return new;
end;
$$

revoke all on function public.create_connection_request_notification()
from public, anon, authenticated

create trigger connections_create_request_notification
after insert on public.connections
for each row execute function public.create_connection_request_notification()

create or replace function public.create_connection_accepted_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status = 'pending' and new.status = 'accepted' then
    insert into public.notifications (
      recipient_id,
      actor_id,
      type,
      connection_id
    )
    values (
      old.requester_id,
      old.recipient_id,
      'connection_accepted',
      old.id
    )
    on conflict do nothing;
  end if;

  return new;
end;
$$

revoke all on function public.create_connection_accepted_notification()
from public, anon, authenticated

create trigger connections_create_accepted_notification
after update of status on public.connections
for each row execute function public.create_connection_accepted_notification()

create or replace function public.create_new_message_notifications()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.deleted_at is null then
    insert into public.notifications (
      recipient_id,
      actor_id,
      type,
      conversation_id,
      message_id
    )
    select
      conversation_member.profile_id,
      new.sender_id,
      'new_message',
      new.conversation_id,
      new.id
    from public.conversation_members as conversation_member
    where conversation_member.conversation_id = new.conversation_id
      and conversation_member.profile_id <> new.sender_id
    on conflict do nothing;
  end if;

  return new;
end;
$$

revoke all on function public.create_new_message_notifications()
from public, anon, authenticated

create trigger messages_create_notifications
after insert on public.messages
for each row execute function public.create_new_message_notifications()

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime
    add table public.notifications;
  end if;
end
$$