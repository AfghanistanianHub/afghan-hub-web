alter table public.opportunities
  add column if not exists moderation_note text,
  add column if not exists moderated_at timestamptz,
  add column if not exists moderated_by uuid references public.profiles(id) on delete set null;

alter table public.events
  add column if not exists moderation_note text,
  add column if not exists moderated_at timestamptz,
  add column if not exists moderated_by uuid references public.profiles(id) on delete set null;

alter table public.notifications
  add column if not exists content_note text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'opportunities_moderation_note_length_check'
      and conrelid = 'public.opportunities'::regclass
  ) then
    alter table public.opportunities
      add constraint opportunities_moderation_note_length_check
      check (moderation_note is null or char_length(moderation_note) <= 1000);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'events_moderation_note_length_check'
      and conrelid = 'public.events'::regclass
  ) then
    alter table public.events
      add constraint events_moderation_note_length_check
      check (moderation_note is null or char_length(moderation_note) <= 1000);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'notifications_content_note_length_check'
      and conrelid = 'public.notifications'::regclass
  ) then
    alter table public.notifications
      add constraint notifications_content_note_length_check
      check (content_note is null or char_length(content_note) <= 1000);
  end if;
end
$$;

drop function if exists public.moderate_opportunity(uuid, text);
drop function if exists public.moderate_event(uuid, text);

create or replace function public.moderate_opportunity(
  target_opportunity_id uuid,
  target_decision text,
  target_note text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  submission public.opportunities%rowtype;
  cleaned_note text := nullif(btrim(target_note), '');
begin
  if not public.can_moderate() then
    raise exception 'Not authorized to moderate content';
  end if;

  if target_decision not in ('approve', 'reject') then
    raise exception 'Invalid moderation decision';
  end if;

  if target_decision = 'reject' and (
    cleaned_note is null
    or char_length(cleaned_note) < 10
    or char_length(cleaned_note) > 1000
  ) then
    raise exception 'A rejection reason between 10 and 1000 characters is required';
  end if;

  select *
  into submission
  from public.opportunities
  where id = target_opportunity_id
    and status = 'draft'
  for update;

  if not found then
    return false;
  end if;

  update public.opportunities
  set
    status = case
      when target_decision = 'approve' then 'published'::public.opportunity_status
      else 'closed'::public.opportunity_status
    end,
    moderation_note = case
      when target_decision = 'reject' then cleaned_note
      else null
    end,
    moderated_at = now(),
    moderated_by = auth.uid(),
    updated_at = now()
  where id = submission.id;

  insert into public.notifications (
    recipient_id,
    actor_id,
    type,
    content_type,
    content_id,
    content_slug,
    content_title,
    content_note
  ) values (
    submission.author_id,
    auth.uid(),
    case
      when target_decision = 'approve' then 'content_approved'
      else 'content_rejected'
    end,
    'opportunity',
    submission.id,
    submission.slug,
    submission.title,
    case when target_decision = 'reject' then cleaned_note else null end
  );

  return true;
end;
$$;

revoke all on function public.moderate_opportunity(uuid, text, text) from public;
grant execute on function public.moderate_opportunity(uuid, text, text) to authenticated;

create or replace function public.moderate_event(
  target_event_id uuid,
  target_decision text,
  target_note text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  submission public.events%rowtype;
  cleaned_note text := nullif(btrim(target_note), '');
begin
  if not public.can_moderate() then
    raise exception 'Not authorized to moderate content';
  end if;

  if target_decision not in ('approve', 'reject') then
    raise exception 'Invalid moderation decision';
  end if;

  if target_decision = 'reject' and (
    cleaned_note is null
    or char_length(cleaned_note) < 10
    or char_length(cleaned_note) > 1000
  ) then
    raise exception 'A rejection reason between 10 and 1000 characters is required';
  end if;

  select *
  into submission
  from public.events
  where id = target_event_id
    and status = 'draft'
  for update;

  if not found then
    return false;
  end if;

  update public.events
  set
    status = case
      when target_decision = 'approve' then 'published'::public.entity_status
      else 'suspended'::public.entity_status
    end,
    moderation_note = case
      when target_decision = 'reject' then cleaned_note
      else null
    end,
    moderated_at = now(),
    moderated_by = auth.uid(),
    updated_at = now()
  where id = submission.id;

  insert into public.notifications (
    recipient_id,
    actor_id,
    type,
    content_type,
    content_id,
    content_slug,
    content_title,
    content_note
  ) values (
    submission.creator_id,
    auth.uid(),
    case
      when target_decision = 'approve' then 'content_approved'
      else 'content_rejected'
    end,
    'event',
    submission.id,
    submission.slug,
    submission.title,
    case when target_decision = 'reject' then cleaned_note else null end
  );

  return true;
end;
$$;

revoke all on function public.moderate_event(uuid, text, text) from public;
grant execute on function public.moderate_event(uuid, text, text) to authenticated;

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
  new.moderation_note := null;
  new.moderated_at := null;
  new.moderated_by := null;
  return new;
end;
$$;

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
  new.moderation_note := null;
  new.moderated_at := null;
  new.moderated_by := null;
  return new;
end;
$$;
