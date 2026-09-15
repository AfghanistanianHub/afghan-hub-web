create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  logo_url text,
  cover_url text,
  organization_type text,
  short_description text,
  description text,
  mission text,
  programs text[] not null default '{}',
  website_url text,
  email text,
  phone text,
  address_line text,
  city text,
  province_state text,
  country text,
  is_accepting_volunteers boolean not null default false,
  is_verified boolean not null default false,
  status public.entity_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint organizations_name_length check (char_length(name) between 2 and 150),
  constraint organizations_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint organizations_short_description_length
    check (short_description is null or char_length(short_description) <= 200)
)

create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at()