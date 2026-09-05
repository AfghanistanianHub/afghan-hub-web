-- Consolidate moderation RLS so authenticated reads use one policy per table
-- and moderation writes continue through the dedicated SECURITY DEFINER RPCs.

drop policy if exists "Moderators can review businesses" on public.businesses;
drop policy if exists "businesses_select_published_or_owner" on public.businesses;

create policy "businesses_select_published_public"
on public.businesses
for select
to anon
using (status = 'published'::public.entity_status);

create policy "businesses_select_published_or_owner"
on public.businesses
for select
to authenticated
using (
  status = 'published'::public.entity_status
  or owner_id = (select auth.uid())
  or public.can_moderate()
);

drop policy if exists "Moderators can review organizations" on public.organizations;
drop policy if exists "organizations_select_published_or_owner" on public.organizations;

create policy "organizations_select_published_public"
on public.organizations
for select
to anon
using (status = 'published'::public.entity_status);

create policy "organizations_select_published_or_owner"
on public.organizations
for select
to authenticated
using (
  status = 'published'::public.entity_status
  or owner_id = (select auth.uid())
  or public.can_moderate()
);

drop policy if exists "Moderators can review opportunities" on public.opportunities;
drop policy if exists "opportunities_select_published_or_author" on public.opportunities;

create policy "opportunities_select_published_public"
on public.opportunities
for select
to anon
using (status = 'published'::public.opportunity_status);

create policy "opportunities_select_published_or_author"
on public.opportunities
for select
to authenticated
using (
  status = 'published'::public.opportunity_status
  or author_id = (select auth.uid())
  or public.can_moderate()
);

drop policy if exists "Moderators can review events" on public.events;
drop policy if exists "events_select_published_or_creator" on public.events;

create policy "events_select_published_public"
on public.events
for select
to anon
using (status = 'published'::public.entity_status);

create policy "events_select_published_or_creator"
on public.events
for select
to authenticated
using (
  status = 'published'::public.entity_status
  or creator_id = (select auth.uid())
  or public.can_moderate()
);

-- Moderators should change publication state only through the validated
-- moderation RPCs. Direct row updates remain available to owners and admins.
drop policy if exists "Moderators can update opportunities" on public.opportunities;
drop policy if exists "Moderators can update events" on public.events;
