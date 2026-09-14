-- Rollback for tests/security/secondary-messaging-forward.sql
-- Restores the pre-messaging-sync secondary baseline while preserving the earlier role/RSVP refresh.

begin;

do $$
begin
  if to_regprocedure('public.send_connection_request(uuid)') is null
     or to_regprocedure('public.start_direct_conversation(uuid)') is null
     or to_regprocedure('public.is_conversation_member(uuid)') is null then
    raise exception 'messaging rollback refused: expected messaging RPC is missing';
  end if;

  if exists (select 1 from public.connections limit 1)
     or exists (select 1 from public.conversation_members limit 1)
     or exists (select 1 from public.conversations limit 1)
     or exists (select 1 from public.messages limit 1)
     or exists (select 1 from public.saved_opportunities limit 1)
     or exists (select 1 from public.notifications where type in ('connection_request','connection_accepted','new_message') limit 1) then
    raise exception 'messaging rollback refused: disposable messaging fixtures must be cleaned first';
  end if;
end $$;

-- Remove notification triggers before their helper functions.
drop trigger if exists connections_create_request_notification on public.connections;
drop trigger if exists connections_create_accepted_notification on public.connections;
drop trigger if exists messages_create_notifications on public.messages;

drop function if exists public.create_connection_request_notification();
drop function if exists public.create_connection_accepted_notification();
drop function if exists public.create_new_message_notifications();

-- Remove application RPCs/helpers introduced by the messaging sync.
drop function if exists public.send_connection_request(uuid);
drop function if exists public.respond_connection_request(uuid,text);
drop function if exists public.start_direct_conversation(uuid);
drop function if exists public.get_message_inbox();
drop function if exists public.get_unread_message_counts();
drop function if exists public.mark_conversation_read(uuid,uuid);
drop function if exists public.mark_all_notifications_read();
drop function if exists public.mark_notification_read(uuid);

-- Policies depend on is_conversation_member, so drop them before the helper.
drop policy if exists connections_select_participant on public.connections;
drop policy if exists connections_delete_participant on public.connections;
drop policy if exists conversation_members_select_member on public.conversation_members;
drop policy if exists conversation_members_delete_self on public.conversation_members;
drop policy if exists conversations_select_member on public.conversations;
drop policy if exists messages_select_member on public.messages;
drop policy if exists messages_insert_member on public.messages;
drop policy if exists saved_opportunities_select_self on public.saved_opportunities;
drop policy if exists saved_opportunities_insert_self on public.saved_opportunities;
drop policy if exists saved_opportunities_delete_self on public.saved_opportunities;
drop function if exists public.is_conversation_member(uuid);

-- Notification indexes introduced only for messaging behavior.
drop index if exists public.notifications_connection_event_unique_idx;
drop index if exists public.notifications_message_event_unique_idx;
drop index if exists public.notifications_unread_message_conversation_idx;

-- Restore conversations to its known empty pre-sync shape.
alter table public.conversations drop column if exists created_by;

-- Restore connection status from production enum to the known secondary text/check contract.
alter table public.connections alter column status drop default;
alter table public.connections alter column status type text using status::text;
alter table public.connections alter column status set default 'pending'::text;
drop type if exists public.connection_status;
alter table public.connections add constraint connections_valid_status
  check (status = any (array['pending'::text,'accepted'::text,'declined'::text,'blocked'::text]));

notify pgrst,'reload schema';
commit;
