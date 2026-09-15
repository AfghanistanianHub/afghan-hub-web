create index if not exists event_rsvps_profile_id_idx
on public.event_rsvps (profile_id);

drop policy if exists "Members can view their own event RSVPs" on public.event_rsvps;
drop policy if exists "Event creators can view event RSVPs" on public.event_rsvps;

create policy "Members and event creators can view event RSVPs"
on public.event_rsvps
for select
to authenticated
using (
  (select auth.uid()) = profile_id
  or exists (
    select 1
    from public.events
    where events.id = event_rsvps.event_id
      and events.creator_id = (select auth.uid())
  )
);
