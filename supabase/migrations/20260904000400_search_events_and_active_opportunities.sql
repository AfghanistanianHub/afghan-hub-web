create index if not exists events_search_document_idx
on public.events
using gin (
  to_tsvector(
    'simple'::regconfig,
    coalesce(title, '') || ' ' ||
    coalesce(summary, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(venue_name, '') || ' ' ||
    coalesce(city, '') || ' ' ||
    coalesce(country, '')
  )
);

create or replace function public.search_afghan_hub(
  search_query text,
  result_limit integer default 20
)
returns table(
  entity_type text,
  entity_id uuid,
  title text,
  subtitle text,
  image_url text,
  city text,
  country text,
  entity_slug text,
  rank real
)
language sql
stable
set search_path = ''
as $function$
  with query as (
    select websearch_to_tsquery('simple', trim(search_query)) as value
  ),
  event_candidates as (
    select
      e.*,
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
      coalesce(p.display_name, p.email) as title,
      coalesce(p.headline, p.profession) as subtitle,
      p.avatar_url as image_url,
      p.city,
      p.country,
      p.username as entity_slug,
      ts_rank(p.search_vector, query.value) as rank
    from public.profiles p, query
    where trim(search_query) <> ''
      and p.is_public = true
      and p.search_vector @@ query.value

    union all

    select
      'business'::text,
      b.id,
      b.name,
      b.category,
      b.logo_url,
      b.city,
      b.country,
      b.slug,
      ts_rank(b.search_vector, query.value)
    from public.businesses b, query
    where trim(search_query) <> ''
      and b.status = 'published'
      and b.search_vector @@ query.value

    union all

    select
      'organization'::text,
      o.id,
      o.name,
      o.organization_type,
      o.logo_url,
      o.city,
      o.country,
      o.slug,
      ts_rank(o.search_vector, query.value)
    from public.organizations o, query
    where trim(search_query) <> ''
      and o.status = 'published'
      and o.search_vector @@ query.value

    union all

    select
      'opportunity'::text,
      op.id,
      op.title,
      op.type::text,
      null::text,
      op.city,
      op.country,
      op.slug,
      ts_rank(op.search_vector, query.value)
    from public.opportunities op, query
    where trim(search_query) <> ''
      and op.status = 'published'
      and (op.deadline is null or op.deadline::date >= current_date)
      and op.search_vector @@ query.value

    union all

    select
      'event'::text,
      e.id,
      e.title,
      coalesce(
        e.summary,
        e.venue_name,
        case when e.is_online then 'Online event' else 'Event' end
      ),
      null::text,
      e.city,
      e.country,
      e.slug,
      ts_rank(e.search_document, query.value)
    from event_candidates e, query
    where trim(search_query) <> ''
      and e.status = 'published'
      and coalesce(e.ends_at, e.starts_at) >= now()
      and e.search_document @@ query.value
  ) results
  order by rank desc
  limit greatest(1, least(result_limit, 100));
$function$;
