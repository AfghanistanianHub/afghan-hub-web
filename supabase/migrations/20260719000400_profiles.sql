create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  display_name text,
  username text unique,
  avatar_url text,
  headline text,
  bio text,
  profession text,
  company text,
  city text,
  province_state text,
  country text,
  languages text[] not null default '{}',
  skills text[] not null default '{}',
  website_url text,
  linkedin_url text,
  opportunity_status public.profile_status not null default 'available',
  role public.user_role not null default 'member',
  is_public boolean not null default true,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_username_length
    check (username is null or char_length(username) between 3 and 30),

  constraint profiles_username_format
    check (username is null or username ~ '^[a-z0-9_]+$'),

  constraint profiles_bio_length
    check (bio is null or char_length(bio) <= 500),

  constraint profiles_headline_length
    check (headline is null or char_length(headline) <= 120)
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    display_name
  )
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      split_part(coalesce(new.email, ''), '@', 1)
    )
  );

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
