alter table public.businesses
  add column if not exists moderation_note text,
  add column if not exists moderated_at timestamptz,
  add column if not exists moderated_by uuid references public.profiles(id) on delete set null;

alter table public.organizations
  add column if not exists moderation_note text,
  add column if not exists moderated_at timestamptz,
  add column if not exists moderated_by uuid references public.profiles(id) on delete set null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname='businesses_moderation_note_length_check'
      and conrelid='public.businesses'::regclass
  ) then
    alter table public.businesses
      add constraint businesses_moderation_note_length_check
      check (moderation_note is null or char_length(moderation_note) <= 1000);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname='organizations_moderation_note_length_check'
      and conrelid='public.organizations'::regclass
  ) then
    alter table public.organizations
      add constraint organizations_moderation_note_length_check
      check (moderation_note is null or char_length(moderation_note) <= 1000);
  end if;
end $$;

alter table public.notifications
  drop constraint if exists notifications_content_type_check;

alter table public.notifications
  add constraint notifications_content_type_check
  check (
    content_type is null
    or content_type in ('opportunity','event','business','organization')
  );

alter table public.notifications
  drop constraint if exists notifications_target_check;

alter table public.notifications
  add constraint notifications_target_check
  check (
    (
      type in ('connection_request', 'connection_accepted')
      and connection_id is not null
      and conversation_id is null
      and message_id is null
      and content_id is null
      and content_type is null
    )
    or
    (
      type = 'new_message'
      and connection_id is null
      and conversation_id is not null
      and message_id is not null
      and content_id is null
      and content_type is null
    )
    or
    (
      type in ('content_approved', 'content_rejected')
      and connection_id is null
      and conversation_id is null
      and message_id is null
      and content_id is not null
      and content_type in ('opportunity','event','business','organization')
      and content_slug is not null
      and content_title is not null
    )
  );

drop policy if exists "businesses_select_published_or_owner" on public.businesses;
create policy "businesses_select_published_or_owner"
on public.businesses
for select
to anon, authenticated
using (
  status = 'published'::public.entity_status
  or owner_id = (select auth.uid())
  or public.can_moderate()
);

drop policy if exists "organizations_select_published_or_owner" on public.organizations;
create policy "organizations_select_published_or_owner"
on public.organizations
for select
to anon, authenticated
using (
  status = 'published'::public.entity_status
  or owner_id = (select auth.uid())
  or public.can_moderate()
);

create or replace function public.moderate_business(
  target_business_id uuid,
  target_decision text,
  target_note text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  submission public.businesses%rowtype;
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
  from public.businesses
  where id = target_business_id
    and status = 'draft'
  for update;

  if not found then
    return false;
  end if;

  update public.businesses
  set
    status = case
      when target_decision = 'approve' then 'published'::public.entity_status
      else 'suspended'::public.entity_status
    end,
    moderation_note = case when target_decision='reject' then cleaned_note else null end,
    moderated_at = now(),
    moderated_by = moderator_id,
    updated_at = now()
  where id = submission.id;

  if submission.owner_id is distinct from moderator_id then
    insert into public.notifications (
      recipient_id, actor_id, type, content_type, content_id,
      content_slug, content_title, content_note
    ) values (
      submission.owner_id,
      moderator_id,
      case when target_decision='approve' then 'content_approved' else 'content_rejected' end,
      'business',
      submission.id,
      submission.slug,
      submission.name,
      case when target_decision='reject' then cleaned_note else null end
    );
  end if;

  return true;
end;
$$;

create or replace function public.moderate_organization(
  target_organization_id uuid,
  target_decision text,
  target_note text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  submission public.organizations%rowtype;
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
  from public.organizations
  where id = target_organization_id
    and status = 'draft'
  for update;

  if not found then
    return false;
  end if;

  update public.organizations
  set
    status = case
      when target_decision = 'approve' then 'published'::public.entity_status
      else 'suspended'::public.entity_status
    end,
    moderation_note = case when target_decision='reject' then cleaned_note else null end,
    moderated_at = now(),
    moderated_by = moderator_id,
    updated_at = now()
  where id = submission.id;

  if submission.owner_id is distinct from moderator_id then
    insert into public.notifications (
      recipient_id, actor_id, type, content_type, content_id,
      content_slug, content_title, content_note
    ) values (
      submission.owner_id,
      moderator_id,
      case when target_decision='approve' then 'content_approved' else 'content_rejected' end,
      'organization',
      submission.id,
      submission.slug,
      submission.name,
      case when target_decision='reject' then cleaned_note else null end
    );
  end if;

  return true;
end;
$$;

create or replace function public.enforce_business_moderation()
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

drop trigger if exists enforce_business_moderation on public.businesses;
create trigger enforce_business_moderation
before insert or update on public.businesses
for each row execute function public.enforce_business_moderation();

create or replace function public.enforce_organization_moderation()
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

drop trigger if exists enforce_organization_moderation on public.organizations;
create trigger enforce_organization_moderation
before insert or update on public.organizations
for each row execute function public.enforce_organization_moderation();

revoke execute on function public.moderate_business(uuid, text, text) from PUBLIC, anon;
revoke execute on function public.moderate_organization(uuid, text, text) from PUBLIC, anon;
revoke execute on function public.enforce_business_moderation() from PUBLIC, anon, authenticated;
revoke execute on function public.enforce_organization_moderation() from PUBLIC, anon, authenticated;

grant execute on function public.moderate_business(uuid, text, text) to authenticated;
grant execute on function public.moderate_organization(uuid, text, text) to authenticated;

notify pgrst, 'reload schema';
