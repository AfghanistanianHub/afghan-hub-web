create table if not exists public.event_rsvps (
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'going' check (status = 'going'),
  created_at timestamptz not null default now(),
  primary key (event_id, profile_id)
);

alter table public.event_rsvps enable row level security;

revoke all on table public.event_rsvps from anon;
revoke insert, update on table public.event_rsvps from authenticated;
grant select, delete on table public.event_rsvps to authenticated;

drop policy if exists "Members can view their own event RSVPs" on public.event_rsvps;
create policy "Members can view their own event RSVPs"
on public.event_rsvps
for select
to authenticated
using ((select auth.uid()) = profile_id);

drop policy if exists "Event creators can view event RSVPs" on public.event_rsvps;
create policy "Event creators can view event RSVPs"
on public.event_rsvps
for select
to authenticated
using (
  exists (
    select 1
    from public.events
    where events.id = event_rsvps.event_id
      and events.creator_id = (select auth.uid())
  )
);

drop policy if exists "Members can cancel their own event RSVPs" on public.event_rsvps;
create policy "Members can cancel their own event RSVPs"
on public.event_rsvps
for delete
to authenticated
using ((select auth.uid()) = profile_id);

create or replace function public.get_event_rsvp_count(target_event_id uuid)
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)
  from public.event_rsvps
  where event_id = target_event_id
    and (select auth.uid()) is not null
    and exists (
      select 1
      from public.events
      where id = target_event_id
        and (
          status = 'published'
          or creator_id = (select auth.uid())
        )
    );
$$;

create or replace function public.rsvp_to_event(target_event_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  event_record public.events%rowtype;
  attendee_count bigint;
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  select *
  into event_record
  from public.events
  where id = target_event_id
  for update;

  if event_record.id is null or event_record.status <> 'published' then
    raise exception 'event_not_available';
  end if;

  if event_record.starts_at <= now() then
    raise exception 'event_has_started';
  end if;

  if event_record.creator_id = current_user_id then
    raise exception 'event_creator_cannot_rsvp';
  end if;

  if exists (
    select 1
    from public.event_rsvps
    where event_id = target_event_id
      and profile_id = current_user_id
  ) then
    return;
  end if;

  if event_record.capacity is not null then
    select count(*)
    into attendee_count
    from public.event_rsvps
    where event_id = target_event_id;

    if attendee_count >= event_record.capacity then
      raise exception 'event_full';
    end if;
  end if;

  insert into public.event_rsvps (event_id, profile_id)
  values (target_event_id, current_user_id);
end;
$$;

revoke all on function public.get_event_rsvp_count(uuid) from public, anon;
revoke all on function public.rsvp_to_event(uuid) from public, anon;
grant execute on function public.get_event_rsvp_count(uuid) to authenticated;
grant execute on function public.rsvp_to_event(uuid) to authenticated;
