-- Keep message history and conversation metadata immutable from direct
-- client writes. Read receipts continue through mark_conversation_read().

drop policy if exists "messages_update_sender" on public.messages;
drop policy if exists "messages_delete_sender" on public.messages;

revoke update, delete on public.messages from authenticated;

drop policy if exists "conversations_update_member" on public.conversations;
revoke update on public.conversations from authenticated;

drop policy if exists "conversation_members_update_self" on public.conversation_members;
revoke update on public.conversation_members from authenticated;
