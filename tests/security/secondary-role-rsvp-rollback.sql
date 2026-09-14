-- Afghan Hub secondary-only rollback for tests/security/secondary-role-rsvp-forward.sql
-- Restores the known pre-refresh secondary baseline. Destructive to disposable secondary acceptance fixtures only.

begin;

-- Refuse rollback if tables/functions are not the expected refresh surface.
do $$
begin
  if to_regclass('public.notifications') is null or to_regclass('public.event_rsvps') is null then
    raise exception 'rollback refused: expected refresh tables are missing';
  end if;
  if to_regprocedure('public.moderate_event(uuid,text,text)') is null
     or to_regprocedure('public.moderate_opportunity(uuid,text,text)') is null
     or to_regprocedure('public.moderate_business(uuid,text,text)') is null
     or to_regprocedure('public.moderate_organization(uuid,text,text)') is null
     or to_regprocedure('public.set_profile_role(uuid,public.user_role)') is null
     or to_regprocedure('public.rsvp_to_event(uuid)') is null then
    raise exception 'rollback refused: expected refresh RPC is missing';
  end if;
end $$;

-- Drop policies introduced by the forward delta.
drop policy if exists events_insert_creator on public.events;
drop policy if exists events_update_creator on public.events;
drop policy if exists events_delete_creator on public.events;
drop policy if exists events_select_published_public on public.events;
drop policy if exists events_select_published_or_creator on public.events;

drop policy if exists opportunities_insert_author on public.opportunities;
drop policy if exists opportunities_update_author on public.opportunities;
drop policy if exists opportunities_delete_author on public.opportunities;
drop policy if exists opportunities_select_published_public on public.opportunities;
drop policy if exists opportunities_select_published_or_author on public.opportunities;

drop policy if exists businesses_insert_owner on public.businesses;
drop policy if exists businesses_update_owner on public.businesses;
drop policy if exists businesses_delete_owner on public.businesses;

drop policy if exists organizations_insert_owner on public.organizations;
drop policy if exists organizations_update_owner on public.organizations;
drop policy if exists organizations_delete_owner on public.organizations;

-- Drop triggers introduced by the forward delta.
drop trigger if exists enforce_event_moderation on public.events;
drop trigger if exists enforce_opportunity_moderation on public.opportunities;
drop trigger if exists enforce_business_moderation on public.businesses;
drop trigger if exists enforce_organization_moderation on public.organizations;
drop trigger if exists enforce_profile_role on public.profiles;
drop trigger if exists enforce_business_verification on public.businesses;
drop trigger if exists enforce_organization_verification on public.organizations;
drop trigger if exists preserve_event_identity on public.events;
drop trigger if exists preserve_opportunity_identity on public.opportunities;
drop trigger if exists preserve_business_identity on public.businesses;
drop trigger if exists preserve_organization_identity on public.organizations;

-- Drop RPCs and trigger helpers introduced by the forward delta.
drop function if exists public.moderate_event(uuid,text,text);
drop function if exists public.moderate_opportunity(uuid,text,text);
drop function if exists public.moderate_business(uuid,text,text);
drop function if exists public.moderate_organization(uuid,text,text);
drop function if exists public.set_profile_role(uuid,public.user_role);
drop function if exists public.get_event_rsvp_count(uuid);
drop function if exists public.rsvp_to_event(uuid);
drop function if exists public.enforce_event_moderation();
drop function if exists public.enforce_opportunity_moderation();
drop function if exists public.enforce_business_moderation();
drop function if exists public.enforce_organization_moderation();
drop function if exists public.enforce_profile_role();
drop function if exists public.enforce_business_verification();
drop function if exists public.enforce_organization_verification();
drop function if exists public.preserve_listing_identity();

-- Drop launch-only tables. This removes only disposable secondary acceptance rows.
drop table public.event_rsvps;
drop table public.notifications;

-- Remove moderation metadata and its indexes/constraints.
drop index if exists public.businesses_moderated_by_idx;
drop index if exists public.events_moderated_by_idx;
drop index if exists public.opportunities_moderated_by_idx;
drop index if exists public.organizations_moderated_by_idx;

alter table public.businesses
  drop constraint if exists businesses_moderation_note_length_check,
  drop column if exists moderation_note,
  drop column if exists moderated_at,
  drop column if exists moderated_by;
alter table public.events
  drop constraint if exists events_moderation_note_length_check,
  drop column if exists moderation_note,
  drop column if exists moderated_at,
  drop column if exists moderated_by;
alter table public.opportunities
  drop constraint if exists opportunities_moderation_note_length_check,
  drop column if exists moderation_note,
  drop column if exists moderated_at,
  drop column if exists moderated_by;
alter table public.organizations
  drop constraint if exists organizations_moderation_note_length_check,
  drop column if exists moderation_note,
  drop column if exists moderated_at,
  drop column if exists moderated_by;

notify pgrst, 'reload schema';
commit;
