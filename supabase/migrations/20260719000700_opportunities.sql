create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  title text not null,
  slug text not null unique,
  summary text,
  description text not null,
  type public.opportunity_type not null,
  city text,
  province_state text,
  country text,
  is_remote boolean not null default false,
  external_url text,
  contact_email text,
  deadline timestamptz,
  status public.opportunity_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint opportunities_title_length check (char_length(title) between 3 and 160),
  constraint opportunities_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint opportunities_summary_length
    check (summary is null or char_length(summary) <= 240),
  constraint opportunities_single_source
    check (not (business_id is not null and organization_id is not null))
);

create trigger opportunities_set_updated_at
before update on public.opportunities
for each row execute function public.set_updated_at();

create table public.saved_opportunities (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, opportunity_id)
);
