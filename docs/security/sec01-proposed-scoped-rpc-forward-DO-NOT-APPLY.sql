-- REVIEW ONLY: NOT FOR PRODUCTION EXECUTION.
-- Must first be rehearsed on a production-compatible isolated DB with synthetic identities.
-- Provides fixed owner/moderator scoped moderation fields. Does NOT revoke public SELECT.
begin;
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
commit;
