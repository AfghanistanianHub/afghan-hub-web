create or replace function public.enforce_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.role := 'member'::public.user_role;
  else
    new.role := old.role;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_profile_role on public.profiles;
create trigger enforce_profile_role
before insert or update on public.profiles
for each row execute function public.enforce_profile_role();

revoke execute on function public.enforce_profile_role()
  from PUBLIC, anon, authenticated;
