create or replace function public.enforce_business_verification()
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
    new.is_verified := false;
  else
    new.is_verified := old.is_verified;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_business_verification on public.businesses;
create trigger enforce_business_verification
before insert or update on public.businesses
for each row execute function public.enforce_business_verification();

create or replace function public.enforce_organization_verification()
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
    new.is_verified := false;
  else
    new.is_verified := old.is_verified;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_organization_verification on public.organizations;
create trigger enforce_organization_verification
before insert or update on public.organizations
for each row execute function public.enforce_organization_verification();

revoke execute on function public.enforce_business_verification()
  from PUBLIC, anon, authenticated;
revoke execute on function public.enforce_organization_verification()
  from PUBLIC, anon, authenticated;
