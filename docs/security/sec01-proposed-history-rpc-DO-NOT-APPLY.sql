-- REVIEW ONLY. DO NOT APPLY TO PRODUCTION.
-- Requires isolated forward/rollback rehearsal and explicit approval.
begin;
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
commit;
