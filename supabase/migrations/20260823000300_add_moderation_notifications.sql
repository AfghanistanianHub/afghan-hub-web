alter table public.notifications
  add column if not exists content_type text,
  add column if not exists content_id uuid,
  add column if not exists content_slug text,
  add column if not exists content_title text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'notifications_content_type_check'
      and conrelid = 'public.notifications'::regclass
  ) then
    alter table public.notifications
      add constraint notifications_content_type_check
      check (content_type is null or content_type in ('opportunity', 'event'));
  end if;
end
$$;

create index if not exists notifications_content_id_idx
  on public.notifications (content_id)
  where content_id is not null;

create or replace function public.moderate_opportunity(
  target_opportunity_id uuid,
  target_decision text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  submission public.opportunities%rowtype;
begin
  if not public.can_moderate() then
    raise exception 'Not authorized to moderate content';
  end if;

  if target_decision not in ('approve', 'reject') then
    raise exception 'Invalid moderation decision';
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
    updated_at = now()
  where id = submission.id;

  insert into public.notifications (
    recipient_id,
    actor_id,
    type,
    content_type,
    content_id,
    content_slug,
    content_title
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
    submission.title
  );

  return true;
end;
$$;

create or replace function public.moderate_event(
  target_event_id uuid,
  target_decision text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  submission public.events%rowtype;
begin
  if not public.can_moderate() then
    raise exception 'Not authorized to moderate content';
  end if;

  if target_decision not in ('approve', 'reject') then
    raise exception 'Invalid moderation decision';
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
    updated_at = now()
  where id = submission.id;

  insert into public.notifications (
    recipient_id,
    actor_id,
    type,
    content_type,
    content_id,
    content_slug,
    content_title
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
    submission.title
  );

  return true;
end;
$$;
