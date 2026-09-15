CREATE OR REPLACE FUNCTION public.search_afghan_hub(search_query text, result_limit integer DEFAULT 20)
RETURNS TABLE(entity_type text, entity_id uuid, title text, subtitle text, image_url text, city text, country text, entity_slug text, rank real)
LANGUAGE sql
STABLE
SET search_path = ''
AS $function$
  with query as (
    select websearch_to_tsquery('simple', trim(search_query)) as value
  ),
  profile_candidates as (
    select
      p.id,
      p.display_name,
      p.first_name,
      p.last_name,
      p.headline,
      p.profession,
      p.avatar_url,
      p.city,
      p.country,
      p.username,
      to_tsvector(
        'simple'::regconfig,
        coalesce(p.display_name, '') || ' ' ||
        coalesce(p.first_name, '') || ' ' ||
        coalesce(p.last_name, '') || ' ' ||
        coalesce(p.headline, '') || ' ' ||
        coalesce(p.profession, '') || ' ' ||
        coalesce(p.company, '') || ' ' ||
        coalesce(p.city, '') || ' ' ||
        coalesce(p.country, '') || ' ' ||
        coalesce(array_to_string(p.skills, ' '), '') || ' ' ||
        coalesce(array_to_string(p.languages, ' '), '')
      ) as safe_search_document
    from public.profiles p
    where p.is_public = true
      and p.onboarding_completed = true
  ),
  event_candidates as (
    select
      e.id, e.title, e.summary, e.venue_name, e.is_online, e.city, e.country,
      e.slug, e.status, e.starts_at, e.ends_at,
      to_tsvector(
        'simple'::regconfig,
        coalesce(e.title, '') || ' ' ||
        coalesce(e.summary, '') || ' ' ||
        coalesce(e.description, '') || ' ' ||
        coalesce(e.venue_name, '') || ' ' ||
        coalesce(e.city, '') || ' ' ||
        coalesce(e.country, '')
      ) as search_document
    from public.events e
  )
  select *
  from (
    select
      'profile'::text as entity_type,
      p.id as entity_id,
      coalesce(nullif(trim(p.display_name), ''), nullif(trim(concat_ws(' ', p.first_name, p.last_name)), '')) as title,
      coalesce(p.headline, p.profession) as subtitle,
      p.avatar_url as image_url,
      p.city,
      p.country,
      p.username as entity_slug,
      ts_rank(p.safe_search_document, query.value) as rank
    from profile_candidates p, query
    where trim(search_query) <> '' and p.safe_search_document @@ query.value

    union all
    select 'business'::text, b.id, b.name, b.category, b.logo_url, b.city, b.country, b.slug, ts_rank(b.search_vector, query.value)
    from public.businesses b, query
    where trim(search_query) <> '' and b.status = 'published' and b.search_vector @@ query.value

    union all
    select 'organization'::text, o.id, o.name, o.organization_type, o.logo_url, o.city, o.country, o.slug, ts_rank(o.search_vector, query.value)
    from public.organizations o, query
    where trim(search_query) <> '' and o.status = 'published' and o.search_vector @@ query.value

    union all
    select 'opportunity'::text, op.id, op.title, op.type::text, null::text, op.city, op.country, op.slug, ts_rank(op.search_vector, query.value)
    from public.opportunities op, query
    where trim(search_query) <> '' and op.status = 'published'
      and (op.deadline is null or op.deadline::date >= current_date)
      and op.search_vector @@ query.value

    union all
    select 'event'::text, e.id, e.title,
      coalesce(e.summary, e.venue_name, case when e.is_online then 'Online event' else 'Event' end),
      null::text, e.city, e.country, e.slug, ts_rank(e.search_document, query.value)
    from event_candidates e, query
    where trim(search_query) <> '' and e.status = 'published'
      and coalesce(e.ends_at, e.starts_at) >= now()
      and e.search_document @@ query.value
  ) results
  order by rank desc
  limit greatest(1, least(result_limit, 100));
$function$;
REVOKE EXECUTE ON FUNCTION public.search_afghan_hub(text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_afghan_hub(text, integer) TO authenticated, service_role;