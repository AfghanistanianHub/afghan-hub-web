-- Restrict profile updates to the profile owner and expose role changes
-- through one validated admin-only RPC.

drop policy if exists "profiles_update_self" on public.profiles;

create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create or replace function public.set_profile_role(
  target_profile_id uuid,
  target_role public.user_role
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can manage member roles';
  end if;

  if target_profile_id = auth.uid() then
    raise exception 'Admins cannot change their own role';
  end if;

  update public.profiles
  set
    role = target_role,
    updated_at = now()
  where id = target_profile_id;

  return found;
end;
$$;

revoke execute on function public.set_profile_role(uuid, public.user_role)
  from PUBLIC, anon;

grant execute on function public.set_profile_role(uuid, public.user_role)
  to authenticated;

notify pgrst, 'reload schema';
