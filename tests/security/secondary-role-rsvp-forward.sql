-- Afghan Hub secondary-only role/moderation/RSVP refresh
-- Target: known non-production secondary Supabase project only.
-- This file intentionally does NOT include search-vector, Realtime, or messaging notification side-effects.

begin;

-- Fail closed unless the known secondary baseline still matches.
do $$
begin
  if to_regclass('public.notifications') is not null
     or to_regclass('public.event_rsvps') is not null then
    raise exception 'secondary baseline changed: launch tables already exist';
  end if;

  if to_regprocedure('public.get_my_access_context()') is null
     or to_regprocedure('public.can_moderate()') is null
     or to_regprocedure('public.is_admin()') is null then
    raise exception 'secondary baseline changed: required access helper is missing';
  end if;

  if exists (
    select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname in (
      'moderate_business','moderate_event','moderate_opportunity','moderate_organization',
      'set_profile_role','rsvp_to_event','get_event_rsvp_count'
    )
  ) then
    raise exception 'secondary baseline changed: target RPC already exists';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema='public'
      and table_name in ('businesses','events','opportunities','organizations')
      and column_name in ('moderation_note','moderated_at','moderated_by')
  ) then
    raise exception 'secondary baseline changed: moderation column already exists';
  end if;
end $$;

-- Moderation metadata.
alter table public.businesses
  add column moderation_note text,
  add column moderated_at timestamptz,
  add column moderated_by uuid references public.profiles(id) on delete set null;
alter table public.events
  add column moderation_note text,
  add column moderated_at timestamptz,
  add column moderated_by uuid references public.profiles(id) on delete set null;
alter table public.opportunities
  add column moderation_note text,
  add column moderated_at timestamptz,
  add column moderated_by uuid references public.profiles(id) on delete set null;
alter table public.organizations
  add column moderation_note text,
  add column moderated_at timestamptz,
  add column moderated_by uuid references public.profiles(id) on delete set null;

alter table public.businesses add constraint businesses_moderation_note_length_check check (moderation_note is null or char_length(moderation_note) <= 1000);
alter table public.events add constraint events_moderation_note_length_check check (moderation_note is null or char_length(moderation_note) <= 1000);
alter table public.opportunities add constraint opportunities_moderation_note_length_check check (moderation_note is null or char_length(moderation_note) <= 1000);
alter table public.organizations add constraint organizations_moderation_note_length_check check (moderation_note is null or char_length(moderation_note) <= 1000);

create index businesses_moderated_by_idx on public.businesses(moderated_by);
create index events_moderated_by_idx on public.events(moderated_by);
create index opportunities_moderated_by_idx on public.opportunities(moderated_by);
create index organizations_moderated_by_idx on public.organizations(moderated_by);

-- Notification surface needed by moderation decisions.
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  connection_id uuid references public.connections(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  message_id uuid references public.messages(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  content_type text,
  content_id uuid,
  content_slug text,
  content_title text,
  content_note text,
  constraint notifications_actor_not_recipient check (actor_id is null or actor_id <> recipient_id),
  constraint notifications_content_note_length_check check (content_note is null or char_length(content_note) <= 1000),
  constraint notifications_content_type_check check (content_type is null or content_type in ('opportunity','event','business','organization')),
  constraint notifications_type_check check (type in ('connection_request','connection_accepted','new_message','content_approved','content_rejected')),
  constraint notifications_target_check check (
    (type in ('connection_request','connection_accepted') and connection_id is not null and conversation_id is null and message_id is null and content_id is null and content_type is null)
    or
    (type='new_message' and connection_id is null and conversation_id is not null and message_id is not null and content_id is null and content_type is null)
    or
    (type in ('content_approved','content_rejected') and connection_id is null and conversation_id is null and message_id is null and content_id is not null and content_type in ('opportunity','event','business','organization') and content_slug is not null and content_title is not null)
  )
);
alter table public.notifications enable row level security;
create index notifications_actor_id_idx on public.notifications(actor_id);
create index notifications_connection_id_idx on public.notifications(connection_id);
create index notifications_content_id_idx on public.notifications(content_id) where content_id is not null;
create index notifications_conversation_id_idx on public.notifications(conversation_id);
create index notifications_message_id_idx on public.notifications(message_id);
create index notifications_recipient_created_at_idx on public.notifications(recipient_id, created_at desc);
create index notifications_recipient_unread_idx on public.notifications(recipient_id, created_at desc) where read_at is null;

revoke all on table public.notifications from anon, authenticated;
grant select on table public.notifications to authenticated;
create policy notifications_select_recipient on public.notifications for select to authenticated using (recipient_id=(select auth.uid()));

-- RSVP surface.
create table public.event_rsvps (
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'going' check (status='going'),
  created_at timestamptz not null default now(),
  primary key(event_id, profile_id)
);
alter table public.event_rsvps enable row level security;
create index event_rsvps_profile_id_idx on public.event_rsvps(profile_id);
revoke all on table public.event_rsvps from anon, authenticated;
grant select, delete on table public.event_rsvps to authenticated;
create policy "Members and event creators can view event RSVPs" on public.event_rsvps for select to authenticated
using ((select auth.uid())=profile_id or exists(select 1 from public.events where events.id=event_rsvps.event_id and events.creator_id=(select auth.uid())));
create policy "Members can cancel their own event RSVPs" on public.event_rsvps for delete to authenticated using ((select auth.uid())=profile_id);

create or replace function public.get_event_rsvp_count(target_event_id uuid)
returns bigint language sql stable security definer set search_path=''
as $$
  select count(*) from public.event_rsvps
  where event_id=target_event_id
    and (select auth.uid()) is not null
    and exists(select 1 from public.events where id=target_event_id and (status='published' or creator_id=(select auth.uid())));
$$;

create or replace function public.rsvp_to_event(target_event_id uuid)
returns void language plpgsql security definer set search_path=''
as $$
declare
  current_user_id uuid := (select auth.uid());
  event_record public.events%rowtype;
  attendee_count bigint;
begin
  if current_user_id is null then raise exception 'authentication_required'; end if;
  select * into event_record from public.events where id=target_event_id for update;
  if event_record.id is null or event_record.status <> 'published' then raise exception 'event_not_available'; end if;
  if event_record.starts_at <= now() then raise exception 'event_has_started'; end if;
  if event_record.creator_id=current_user_id then raise exception 'event_creator_cannot_rsvp'; end if;
  if exists(select 1 from public.event_rsvps where event_id=target_event_id and profile_id=current_user_id) then return; end if;
  if event_record.capacity is not null then
    select count(*) into attendee_count from public.event_rsvps where event_id=target_event_id;
    if attendee_count >= event_record.capacity then raise exception 'event_full'; end if;
  end if;
  insert into public.event_rsvps(event_id,profile_id) values(target_event_id,current_user_id);
end;
$$;
revoke all on function public.get_event_rsvp_count(uuid) from public, anon;
revoke all on function public.rsvp_to_event(uuid) from public, anon;
grant execute on function public.get_event_rsvp_count(uuid) to authenticated;
grant execute on function public.rsvp_to_event(uuid) to authenticated;

-- Database-side write protections.
create or replace function public.enforce_event_moderation() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if auth.role()='service_role' or public.can_moderate() then return new; end if;
  new.status:='draft'::public.entity_status; new.moderation_note:=null; new.moderated_at:=null; new.moderated_by:=null; return new;
end $$;
create or replace function public.enforce_opportunity_moderation() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if auth.role()='service_role' or public.can_moderate() then return new; end if;
  new.status:='draft'::public.opportunity_status; new.moderation_note:=null; new.moderated_at:=null; new.moderated_by:=null; return new;
end $$;
create or replace function public.enforce_business_moderation() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if auth.role()='service_role' or public.can_moderate() then return new; end if;
  new.status:='draft'::public.entity_status; new.moderation_note:=null; new.moderated_at:=null; new.moderated_by:=null; return new;
end $$;
create or replace function public.enforce_organization_moderation() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if auth.role()='service_role' or public.can_moderate() then return new; end if;
  new.status:='draft'::public.entity_status; new.moderation_note:=null; new.moderated_at:=null; new.moderated_by:=null; return new;
end $$;
create or replace function public.enforce_profile_role() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if auth.role()='service_role' or public.is_admin() then return new; end if;
  if tg_op='INSERT' then new.role:='member'::public.user_role; else new.role:=old.role; end if; return new;
end $$;
create or replace function public.enforce_business_verification() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if auth.role()='service_role' or public.is_admin() then return new; end if;
  if tg_op='INSERT' then new.is_verified:=false; else new.is_verified:=old.is_verified; end if; return new;
end $$;
create or replace function public.enforce_organization_verification() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if auth.role()='service_role' or public.is_admin() then return new; end if;
  if tg_op='INSERT' then new.is_verified:=false; else new.is_verified:=old.is_verified; end if; return new;
end $$;
create or replace function public.preserve_listing_identity() returns trigger language plpgsql set search_path=public as $$
begin
  if tg_op='INSERT' then
    if current_user='authenticated' then new.id:=gen_random_uuid(); new.created_at:=now(); end if;
    return new;
  end if;
  new.id:=old.id; new.created_at:=old.created_at; return new;
end $$;

revoke execute on function public.enforce_event_moderation() from public, anon, authenticated;
revoke execute on function public.enforce_opportunity_moderation() from public, anon, authenticated;
revoke execute on function public.enforce_business_moderation() from public, anon, authenticated;
revoke execute on function public.enforce_organization_moderation() from public, anon, authenticated;
revoke execute on function public.enforce_profile_role() from public, anon, authenticated;
revoke execute on function public.enforce_business_verification() from public, anon, authenticated;
revoke execute on function public.enforce_organization_verification() from public, anon, authenticated;

create trigger enforce_event_moderation before insert or update on public.events for each row execute function public.enforce_event_moderation();
create trigger enforce_opportunity_moderation before insert or update on public.opportunities for each row execute function public.enforce_opportunity_moderation();
create trigger enforce_business_moderation before insert or update on public.businesses for each row execute function public.enforce_business_moderation();
create trigger enforce_organization_moderation before insert or update on public.organizations for each row execute function public.enforce_organization_moderation();
create trigger enforce_profile_role before insert or update on public.profiles for each row execute function public.enforce_profile_role();
create trigger enforce_business_verification before insert or update on public.businesses for each row execute function public.enforce_business_verification();
create trigger enforce_organization_verification before insert or update on public.organizations for each row execute function public.enforce_organization_verification();
create trigger preserve_event_identity before insert or update on public.events for each row execute function public.preserve_listing_identity();
create trigger preserve_opportunity_identity before insert or update on public.opportunities for each row execute function public.preserve_listing_identity();
create trigger preserve_business_identity before insert or update on public.businesses for each row execute function public.preserve_listing_identity();
create trigger preserve_organization_identity before insert or update on public.organizations for each row execute function public.preserve_listing_identity();

-- Owner/creator write policies missing on the secondary target.
create policy events_insert_creator on public.events for insert to authenticated with check (creator_id=(select auth.uid()));
create policy events_update_creator on public.events for update to authenticated using (creator_id=(select auth.uid()) or public.is_admin()) with check (creator_id=(select auth.uid()) or public.is_admin());
create policy events_delete_creator on public.events for delete to authenticated using (creator_id=(select auth.uid()) or public.is_admin());
create policy events_select_published_public on public.events for select to anon using (status='published'::public.entity_status);
create policy events_select_published_or_creator on public.events for select to authenticated using (status='published'::public.entity_status or creator_id=(select auth.uid()) or public.can_moderate());

create policy opportunities_insert_author on public.opportunities for insert to authenticated with check (author_id=(select auth.uid()));
create policy opportunities_update_author on public.opportunities for update to authenticated using (author_id=(select auth.uid()) or public.is_admin()) with check (author_id=(select auth.uid()) or public.is_admin());
create policy opportunities_delete_author on public.opportunities for delete to authenticated using (author_id=(select auth.uid()) or public.is_admin());
create policy opportunities_select_published_public on public.opportunities for select to anon using (status='published'::public.opportunity_status);
create policy opportunities_select_published_or_author on public.opportunities for select to authenticated using (status='published'::public.opportunity_status or author_id=(select auth.uid()) or public.can_moderate());

create policy businesses_insert_owner on public.businesses for insert to authenticated with check (owner_id=(select auth.uid()));
create policy businesses_update_owner on public.businesses for update to authenticated using (owner_id=(select auth.uid()) or public.is_admin()) with check (owner_id=(select auth.uid()) or public.is_admin());
create policy businesses_delete_owner on public.businesses for delete to authenticated using (owner_id=(select auth.uid()) or public.is_admin());

create policy organizations_insert_owner on public.organizations for insert to authenticated with check (owner_id=(select auth.uid()));
create policy organizations_update_owner on public.organizations for update to authenticated using (owner_id=(select auth.uid()) or public.is_admin()) with check (owner_id=(select auth.uid()) or public.is_admin());
create policy organizations_delete_owner on public.organizations for delete to authenticated using (owner_id=(select auth.uid()) or public.is_admin());

-- Moderation RPCs matching the current production behavior.
create or replace function public.moderate_event(target_event_id uuid, target_decision text, target_note text default null)
returns boolean language plpgsql security definer set search_path=public as $$
declare submission public.events%rowtype; cleaned_note text:=nullif(btrim(target_note),''); moderator_id uuid:=auth.uid();
begin
  if not public.can_moderate() then raise exception 'Not authorized to moderate content'; end if;
  if target_decision not in ('approve','reject') then raise exception 'Invalid moderation decision'; end if;
  if target_decision='reject' and (cleaned_note is null or char_length(cleaned_note)<10 or char_length(cleaned_note)>1000) then raise exception 'A rejection reason between 10 and 1000 characters is required'; end if;
  select * into submission from public.events where id=target_event_id and status='draft' for update;
  if not found then return false; end if;
  update public.events set status=case when target_decision='approve' then 'published'::public.entity_status else 'suspended'::public.entity_status end,
    moderation_note=case when target_decision='reject' then cleaned_note else null end, moderated_at=now(), moderated_by=moderator_id, updated_at=now() where id=submission.id;
  if submission.creator_id is distinct from moderator_id then
    insert into public.notifications(recipient_id,actor_id,type,content_type,content_id,content_slug,content_title,content_note)
    values(submission.creator_id,moderator_id,case when target_decision='approve' then 'content_approved' else 'content_rejected' end,'event',submission.id,submission.slug,submission.title,case when target_decision='reject' then cleaned_note else null end);
  end if;
  return true;
end $$;

create or replace function public.moderate_opportunity(target_opportunity_id uuid, target_decision text, target_note text default null)
returns boolean language plpgsql security definer set search_path=public as $$
declare submission public.opportunities%rowtype; cleaned_note text:=nullif(btrim(target_note),''); moderator_id uuid:=auth.uid();
begin
  if not public.can_moderate() then raise exception 'Not authorized to moderate content'; end if;
  if target_decision not in ('approve','reject') then raise exception 'Invalid moderation decision'; end if;
  if target_decision='reject' and (cleaned_note is null or char_length(cleaned_note)<10 or char_length(cleaned_note)>1000) then raise exception 'A rejection reason between 10 and 1000 characters is required'; end if;
  select * into submission from public.opportunities where id=target_opportunity_id and status='draft' for update;
  if not found then return false; end if;
  update public.opportunities set status=case when target_decision='approve' then 'published'::public.opportunity_status else 'closed'::public.opportunity_status end,
    moderation_note=case when target_decision='reject' then cleaned_note else null end, moderated_at=now(), moderated_by=moderator_id, updated_at=now() where id=submission.id;
  if submission.author_id is distinct from moderator_id then
    insert into public.notifications(recipient_id,actor_id,type,content_type,content_id,content_slug,content_title,content_note)
    values(submission.author_id,moderator_id,case when target_decision='approve' then 'content_approved' else 'content_rejected' end,'opportunity',submission.id,submission.slug,submission.title,case when target_decision='reject' then cleaned_note else null end);
  end if;
  return true;
end $$;

create or replace function public.moderate_business(target_business_id uuid, target_decision text, target_note text default null)
returns boolean language plpgsql security definer set search_path=public as $$
declare submission public.businesses%rowtype; cleaned_note text:=nullif(btrim(target_note),''); moderator_id uuid:=auth.uid();
begin
  if not public.can_moderate() then raise exception 'Not authorized to moderate content'; end if;
  if target_decision not in ('approve','reject') then raise exception 'Invalid moderation decision'; end if;
  if target_decision='reject' and (cleaned_note is null or char_length(cleaned_note)<10 or char_length(cleaned_note)>1000) then raise exception 'A rejection reason between 10 and 1000 characters is required'; end if;
  select * into submission from public.businesses where id=target_business_id and status='draft' for update;
  if not found then return false; end if;
  update public.businesses set status=case when target_decision='approve' then 'published'::public.entity_status else 'suspended'::public.entity_status end,
    moderation_note=case when target_decision='reject' then cleaned_note else null end, moderated_at=now(), moderated_by=moderator_id, updated_at=now() where id=submission.id;
  if submission.owner_id is distinct from moderator_id then
    insert into public.notifications(recipient_id,actor_id,type,content_type,content_id,content_slug,content_title,content_note)
    values(submission.owner_id,moderator_id,case when target_decision='approve' then 'content_approved' else 'content_rejected' end,'business',submission.id,submission.slug,submission.name,case when target_decision='reject' then cleaned_note else null end);
  end if;
  return true;
end $$;

create or replace function public.moderate_organization(target_organization_id uuid, target_decision text, target_note text default null)
returns boolean language plpgsql security definer set search_path=public as $$
declare submission public.organizations%rowtype; cleaned_note text:=nullif(btrim(target_note),''); moderator_id uuid:=auth.uid();
begin
  if not public.can_moderate() then raise exception 'Not authorized to moderate content'; end if;
  if target_decision not in ('approve','reject') then raise exception 'Invalid moderation decision'; end if;
  if target_decision='reject' and (cleaned_note is null or char_length(cleaned_note)<10 or char_length(cleaned_note)>1000) then raise exception 'A rejection reason between 10 and 1000 characters is required'; end if;
  select * into submission from public.organizations where id=target_organization_id and status='draft' for update;
  if not found then return false; end if;
  update public.organizations set status=case when target_decision='approve' then 'published'::public.entity_status else 'suspended'::public.entity_status end,
    moderation_note=case when target_decision='reject' then cleaned_note else null end, moderated_at=now(), moderated_by=moderator_id, updated_at=now() where id=submission.id;
  if submission.owner_id is distinct from moderator_id then
    insert into public.notifications(recipient_id,actor_id,type,content_type,content_id,content_slug,content_title,content_note)
    values(submission.owner_id,moderator_id,case when target_decision='approve' then 'content_approved' else 'content_rejected' end,'organization',submission.id,submission.slug,submission.name,case when target_decision='reject' then cleaned_note else null end);
  end if;
  return true;
end $$;

create or replace function public.set_profile_role(target_profile_id uuid, target_role public.user_role)
returns boolean language plpgsql security definer set search_path=public as $$
begin
  if not public.is_admin() then raise exception 'Only admins can manage member roles'; end if;
  if target_profile_id=auth.uid() then raise exception 'Admins cannot change their own role'; end if;
  update public.profiles set role=target_role, updated_at=now() where id=target_profile_id;
  return found;
end $$;

revoke all on function public.moderate_event(uuid,text,text) from public, anon;
revoke all on function public.moderate_opportunity(uuid,text,text) from public, anon;
revoke all on function public.moderate_business(uuid,text,text) from public, anon;
revoke all on function public.moderate_organization(uuid,text,text) from public, anon;
revoke all on function public.set_profile_role(uuid,public.user_role) from public, anon;
grant execute on function public.moderate_event(uuid,text,text) to authenticated;
grant execute on function public.moderate_opportunity(uuid,text,text) to authenticated;
grant execute on function public.moderate_business(uuid,text,text) to authenticated;
grant execute on function public.moderate_organization(uuid,text,text) to authenticated;
grant execute on function public.set_profile_role(uuid,public.user_role) to authenticated;

notify pgrst, 'reload schema';
commit;
