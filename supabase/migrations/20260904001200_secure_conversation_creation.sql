-- Force direct-message conversations to be created only through the
-- validated start_direct_conversation() RPC, which requires an accepted
-- connection and prevents duplicate direct conversations.

drop policy if exists "conversations_insert_creator" on public.conversations;
drop policy if exists "conversation_members_insert_creator_or_self" on public.conversation_members;

revoke insert on public.conversations from authenticated;
revoke insert on public.conversation_members from authenticated;

-- Keep the RPC itself available to signed-in users.
revoke execute on function public.start_direct_conversation(uuid)
  from PUBLIC, anon;

grant execute on function public.start_direct_conversation(uuid)
  to authenticated;
