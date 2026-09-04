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
  moderator_id uuid := auth.uid();
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
    moderated_by = moderator_id,
    updated_at = now()
  where id = submission.id;

  if submission.author_id is distinct from moderator_id then
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
      moderator_id,
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
  end if;

  return true;
end;
$$;

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
  moderator_id uuid := auth.uid();
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
    moderated_by = moderator_id,
    updated_at = now()
  where id = submission.id;

  if submission.creator_id is distinct from moderator_id then
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
      moderator_id,
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
  end if;

  return true;
end;
$$;

revoke execute on function public.moderate_opportunity(uuid, text, text) from PUBLIC, anon;
revoke execute on function public.moderate_event(uuid, text, text) from PUBLIC, anon;
grant execute on function public.moderate_opportunity(uuid, text, text) to authenticated;
grant execute on function public.moderate_event(uuid, text, text) to authenticated;
