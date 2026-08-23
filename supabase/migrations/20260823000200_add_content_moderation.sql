create or replace function public.can_moderate()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'moderator')
  );
$$;

revoke all on function public.can_moderate() from public;
grant execute on function public.can_moderate() to authenticated;

drop policy if exists "Moderators can review opportunities" on public.opportunities;
create policy "Moderators can review opportunities"
on public.opportunities
for select
to authenticated
using (public.can_moderate());

drop policy if exists "Moderators can update opportunities" on public.opportunities;
create policy "Moderators can update opportunities"
on public.opportunities
for update
to authenticated
using (public.can_moderate())
with check (public.can_moderate());

drop policy if exists "Moderators can review events" on public.events;
create policy "Moderators can review events"
on public.events
for select
to authenticated
using (public.can_moderate());

drop policy if exists "Moderators can update events" on public.events;
create policy "Moderators can update events"
on public.events
for update
to authenticated
using (public.can_moderate())
with check (public.can_moderate());

create or replace function public.moderate_opportunity(
  target_opportunity_id uuid,
  target_decision text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.can_moderate() then
    raise exception 'Not authorized to moderate content';
  end if;

  if target_decision not in ('approve', 'reject') then
    raise exception 'Invalid moderation decision';
  end if;

  update public.opportunities
  set
    status = case
      when target_decision = 'approve' then 'published'::public.opportunity_status
      else 'closed'::public.opportunity_status
    end,
    updated_at = now()
  where id = target_opportunity_id
    and status = 'draft';

  return found;
end;
$$;

revoke all on function public.moderate_opportunity(uuid, text) from public;
grant execute on function public.moderate_opportunity(uuid, text) to authenticated;

create or replace function public.moderate_event(
  target_event_id uuid,
  target_decision text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.can_moderate() then
    raise exception 'Not authorized to moderate content';
  end if;

  if target_decision not in ('approve', 'reject') then
    raise exception 'Invalid moderation decision';
  end if;

  update public.events
  set
    status = case
      when target_decision = 'approve' then 'published'::public.entity_status
      else 'suspended'::public.entity_status
    end,
    updated_at = now()
  where id = target_event_id
    and status = 'draft';

  return found;
end;
$$;

revoke all on function public.moderate_event(uuid, text) from public;
grant execute on function public.moderate_event(uuid, text) to authenticated;

create or replace function public.enforce_opportunity_moderation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or public.can_moderate() then
    return new;
  end if;

  new.status := 'draft'::public.opportunity_status;

  return new;
end;
$$;

drop trigger if exists enforce_opportunity_moderation on public.opportunities;
create trigger enforce_opportunity_moderation
before insert or update on public.opportunities
for each row execute function public.enforce_opportunity_moderation();

create or replace function public.enforce_event_moderation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or public.can_moderate() then
    return new;
  end if;

  new.status := 'draft'::public.entity_status;

  return new;
end;
$$;

drop trigger if exists enforce_event_moderation on public.events;
create trigger enforce_event_moderation
before insert or update on public.events
for each row execute function public.enforce_event_moderation();
