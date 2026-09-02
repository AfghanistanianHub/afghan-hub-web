-- Remove direct API access from trigger-only and internal helper functions.
-- Keep application RPC functions available only to signed-in users.

revoke execute on function public.handle_new_user()
from public, anon, authenticated;

revoke execute on function public.rls_auto_enable()
from public, anon, authenticated;

revoke execute on function public.is_admin()
from public, anon;
grant execute on function public.is_admin()
to authenticated;

revoke execute on function public.is_conversation_member(uuid)
from public, anon;
grant execute on function public.is_conversation_member(uuid)
to authenticated;
