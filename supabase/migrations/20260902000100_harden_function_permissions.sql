-- Remove direct API access from trigger-only and internal helper functions.
-- Keep application RPC functions available only to signed-in users.

revoke execute on function public.handle_new_user()
from public, anon, authenticated;

-- Supabase's optional RLS event-trigger helper is not installed by local CLI.
-- Revoke its API access wherever it exists; application helpers remain mandatory.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable()
    from public, anon, authenticated;
  end if;
end
$$;

revoke execute on function public.is_admin()
from public, anon;
grant execute on function public.is_admin()
to authenticated;

revoke execute on function public.is_conversation_member(uuid)
from public, anon;
grant execute on function public.is_conversation_member(uuid)
to authenticated;
