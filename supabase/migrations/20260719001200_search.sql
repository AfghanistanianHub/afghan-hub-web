alter table public.profiles
add column if not exists search_vector tsvector

alter table public.businesses
add column if not exists search_vector tsvector

alter table public.organizations
add column if not exists search_vector tsvector

alter table public.opportunities
add column if not exists search_vector tsvector

create or replace function public.update_profile_search_vector()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.search_vector :=
    to_tsvector(
      'simple',
      coalesce(new.display_name, '') || ' ' ||
      coalesce(new.headline, '') || ' ' ||
      coalesce(new.profession, '') || ' ' ||
      coalesce(new.company, '') || ' ' ||
      coalesce(new.city, '') || ' ' ||
      coalesce(new.country, '') || ' ' ||
      coalesce(array_to_string(new.skills, ' '), '') || ' ' ||
      coalesce(array_to_string(new.languages, ' '), '')
    );

  return new;
end;
$$

create or replace function public.update_business_search_vector()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.search_vector :=
    to_tsvector(
      'simple',
      coalesce(new.name, '') || ' ' ||
      coalesce(new.category, '') || ' ' ||
      coalesce(new.short_description, '') || ' ' ||
      coalesce(new.description, '') || ' ' ||
      coalesce(new.city, '') || ' ' ||
      coalesce(new.country, '') || ' ' ||
      coalesce(array_to_string(new.services, ' '), '')
    );

  return new;
end;
$$

create or replace function public.update_organization_search_vector()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.search_vector :=
    to_tsvector(
      'simple',
      coalesce(new.name, '') || ' ' ||
      coalesce(new.organization_type, '') || ' ' ||
      coalesce(new.short_description, '') || ' ' ||
      coalesce(new.description, '') || ' ' ||
      coalesce(new.mission, '') || ' ' ||
      coalesce(new.city, '') || ' ' ||
      coalesce(new.country, '')
    );

  return new;
end;
$$

create or replace function public.update_opportunity_search_vector()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.search_vector :=
    to_tsvector(
      'simple',
      coalesce(new.title, '') || ' ' ||
      coalesce(new.summary, '') || ' ' ||
      coalesce(new.description, '') || ' ' ||
      coalesce(new.city, '') || ' ' ||
      coalesce(new.country, '')
    );

  return new;
end;
$$

drop trigger if exists profiles_search_vector_trigger
on public.profiles

create trigger profiles_search_vector_trigger
before insert or update of
  display_name,
  headline,
  profession,
  company,
  city,
  country,
  skills,
  languages
on public.profiles
for each row
execute function public.update_profile_search_vector()

drop trigger if exists businesses_search_vector_trigger
on public.businesses

create trigger businesses_search_vector_trigger
before insert or update of
  name,
  category,
  short_description,
  description,
  city,
  country,
  services
on public.businesses
for each row
execute function public.update_business_search_vector()

drop trigger if exists organizations_search_vector_trigger
on public.organizations

create trigger organizations_search_vector_trigger
before insert or update of
  name,
  organization_type,
  short_description,
  description,
  mission,
  city,
  country
on public.organizations
for each row
execute function public.update_organization_search_vector()

drop trigger if exists opportunities_search_vector_trigger
on public.opportunities

create trigger opportunities_search_vector_trigger
before insert or update of
  title,
  summary,
  description,
  city,
  country
on public.opportunities
for each row
execute function public.update_opportunity_search_vector()

update public.profiles
set search_vector =
  to_tsvector(
    'simple',
    coalesce(display_name, '') || ' ' ||
    coalesce(headline, '') || ' ' ||
    coalesce(profession, '') || ' ' ||
    coalesce(company, '') || ' ' ||
    coalesce(city, '') || ' ' ||
    coalesce(country, '') || ' ' ||
    coalesce(array_to_string(skills, ' '), '') || ' ' ||
    coalesce(array_to_string(languages, ' '), '')
  )

update public.businesses
set search_vector =
  to_tsvector(
    'simple',
    coalesce(name, '') || ' ' ||
    coalesce(category, '') || ' ' ||
    coalesce(short_description, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(city, '') || ' ' ||
    coalesce(country, '') || ' ' ||
    coalesce(array_to_string(services, ' '), '')
  )

update public.organizations
set search_vector =
  to_tsvector(
    'simple',
    coalesce(name, '') || ' ' ||
    coalesce(organization_type, '') || ' ' ||
    coalesce(short_description, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(mission, '') || ' ' ||
    coalesce(city, '') || ' ' ||
    coalesce(country, '')
  )

update public.opportunities
set search_vector =
  to_tsvector(
    'simple',
    coalesce(title, '') || ' ' ||
    coalesce(summary, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(city, '') || ' ' ||
    coalesce(country, '')
  )

create index if not exists profiles_search_vector_idx
on public.profiles using gin(search_vector)

create index if not exists businesses_search_vector_idx
on public.businesses using gin(search_vector)

create index if not exists organizations_search_vector_idx
on public.organizations using gin(search_vector)

create index if not exists opportunities_search_vector_idx
on public.opportunities using gin(search_vector)

create or replace function public.search_afghan_hub(
  search_query text,
  result_limit integer default 20
)
returns table (
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
security invoker
set search_path = ''
as $$
  with query as (
    select websearch_to_tsquery('simple', trim(search_query)) as value
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
      and op.search_vector @@ query.value
  ) results
  order by rank desc
  limit greatest(1, least(result_limit, 100));
$$

grant execute
on function public.search_afghan_hub(text, integer)
to anon, authenticated