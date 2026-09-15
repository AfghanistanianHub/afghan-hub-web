create table public.events (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  title text not null,
  slug text not null unique,
  summary text,
  description text,
  venue_name text,
  address_line text,
  city text,
  province_state text,
  country text,
  is_online boolean not null default false,
  online_url text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity integer,
  status public.entity_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint events_title_length check (char_length(title) between 3 and 160),
  constraint events_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint events_capacity_positive check (capacity is null or capacity > 0),
  constraint events_valid_time check (ends_at is null or ends_at >= starts_at),
  constraint events_single_source
    check (not (business_id is not null and organization_id is not null))
);

create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();
