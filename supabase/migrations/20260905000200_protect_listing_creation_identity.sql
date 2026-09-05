-- Extend listing identity protection to authenticated inserts.
-- Client-created rows must receive server-generated ids and creation times,
-- while service-role/admin maintenance remains unaffected.

create or replace function public.preserve_listing_identity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if current_user = 'authenticated' then
      new.id := gen_random_uuid();
      new.created_at := now();
    end if;

    return new;
  end if;

  new.id := old.id;
  new.created_at := old.created_at;
  return new;
end;
$$;

drop trigger if exists preserve_business_identity on public.businesses;
create trigger preserve_business_identity
before insert or update on public.businesses
for each row execute function public.preserve_listing_identity();

drop trigger if exists preserve_organization_identity on public.organizations;
create trigger preserve_organization_identity
before insert or update on public.organizations
for each row execute function public.preserve_listing_identity();

drop trigger if exists preserve_opportunity_identity on public.opportunities;
create trigger preserve_opportunity_identity
before insert or update on public.opportunities
for each row execute function public.preserve_listing_identity();

drop trigger if exists preserve_event_identity on public.events;
create trigger preserve_event_identity
before insert or update on public.events
for each row execute function public.preserve_listing_identity();

revoke execute on function public.preserve_listing_identity()
  from PUBLIC, anon, authenticated;
