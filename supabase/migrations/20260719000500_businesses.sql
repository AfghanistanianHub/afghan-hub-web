create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  logo_url text,
  cover_url text,
  category text not null,
  short_description text,
  description text,
  services text[] not null default '{}',
  website_url text,
  email text,
  phone text,
  address_line text,
  city text,
  province_state text,
  country text,
  is_hiring boolean not null default false,
  is_verified boolean not null default false,
  status public.entity_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint businesses_name_length check (char_length(name) between 2 and 120),
  constraint businesses_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint businesses_short_description_length
    check (short_description is null or char_length(short_description) <= 200)
);

create trigger businesses_set_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();
