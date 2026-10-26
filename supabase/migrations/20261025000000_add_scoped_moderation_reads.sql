-- SEC-01 Phase 1: constrained access to moderation metadata.
-- This migration intentionally DOES NOT alter public catalog SELECT grants.
-- Phase 2 must not be applied without synthetic persona tests and a verified
-- public field allowlist. Review migration drift before deploying to production.
-- PR is draft; production deployment is not authorized.

create function public.get_listing_moderation_feedback(
  target_entity_type text, target_entity_id uuid
)
returns table(entity_type text, entity_id uuid, moderation_note text,
              moderated_at timestamptz, moderated_by uuid)
language plpgsql stable security definer set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  is_reviewer boolean;
begin
  if caller is null or target_entity_id is null
     or target_entity_type is null
     or target_entity_type not in ('business','organization','opportunity','event') then
    return;
  end if;
  is_reviewer := coalesce(public.can_moderate(),false);
  if target_entity_type = 'business' then
    return query select 'business'::text, b.id, b.moderation_note, b.moderated_at,
      case when is_reviewer then b.moderated_by else null::uuid end
      from public.businesses b
      where b.id = target_entity_id and (b.owner_id=caller or is_reviewer);
  elsif target_entity_type = 'organization' then
    return query select 'organization'::text, o.id, o.moderation_note, o.moderated_at,
      case when is_reviewer then o.moderated_by else null::uuid end
      from public.organizations o
      where o.id=target_entity_id and (o.owner_id=caller or is_reviewer);
  elsif target_entity_type = 'opportunity' then
    return query select 'opportunity'::text, p.id, p.moderation_note, p.moderated_at,
      case when is_reviewer then p.moderated_by else null::uuid end
      from public.opportunities p
      where p.id=target_entity_id and (p.author_id=caller or is_reviewer);
  else
    return query select 'event'::text, e.id, e.moderation_note, e.moderated_at,
      case when is_reviewer then e.moderated_by else null::uuid end
      from public.events e
      where e.id=target_entity_id and (e.creator_id=caller or is_reviewer);
  end if;
end;
$$;
revoke all on function public.get_listing_moderation_feedback(text,uuid) from public, anon;
grant execute on function public.get_listing_moderation_feedback(text,uuid) to authenticated, service_role;

create function public.list_moderation_history()
returns table(entity_type text, entity_id uuid, title text, slug text,
  status text, moderation_note text, moderated_at timestamptz)
language plpgsql stable security definer set search_path=''
as $$
begin
  if auth.uid() is null or not coalesce(public.can_moderate(), false) then
    raise exception 'not authorized' using errcode='42501';
  end if;
  return query
  select h.entity_type, h.entity_id, h.title, h.slug, h.status, h.moderation_note, h.moderated_at
  from (
    select 'opportunity'::text entity_type, o.id entity_id, o.title, o.slug, o.status::text status, o.moderation_note, o.moderated_at from public.opportunities o where o.moderated_at is not null
    union all
    select 'event'::text, e.id, e.title, e.slug, e.status::text, e.moderation_note, e.moderated_at from public.events e where e.moderated_at is not null
    union all
    select 'business'::text, b.id, b.name, b.slug, b.status::text, b.moderation_note, b.moderated_at from public.businesses b where b.moderated_at is not null
    union all
    select 'organization'::text, g.id, g.name, g.slug, g.status::text, g.moderation_note, g.moderated_at from public.organizations g where g.moderated_at is not null
  ) h
  order by h.moderated_at desc, h.entity_type, h.entity_id
  limit 40;
end;
$$;
revoke all on function public.list_moderation_history() from public, anon;
grant execute on function public.list_moderation_history() to authenticated, service_role;
