# Profile privacy forward rehearsal SQL — 2026-09-12

Status: **isolated-environment rehearsal only — DO NOT APPLY TO PRODUCTION**

Related: #67, `profile-privacy-remediation-draft.md`, `profile-privacy-persona-tests.md`, `production-authorization-rollback-snapshot-2026-09-12.md`.

This is a current-production-derived forward SQL candidate for a future isolated, production-compatible environment. It is intentionally Markdown rather than a file under `supabase/migrations/` so migration tooling cannot pick it up accidentally.

## Preconditions

Before running even in staging:

1. deploy an application build whose `src/lib/profile-access.ts` reads self access through `get_my_access_context()` and the admin account list through `admin_list_member_accounts()`;
2. use disposable test personas only;
3. confirm the target is **not** production project `yussznmwjsvfvpabmwdc`;
4. capture a same-window metadata snapshot;
5. keep the paired rollback document ready.

The current production application still reads those two private surfaces directly through the centralized profile-access adapter, so applying this SQL before the application adapter changes would break dashboard/admin behavior.

## Candidate forward SQL

```sql
-- ISOLATED REHEARSAL ONLY. NOT AUTHORIZED FOR PRODUCTION.
begin;

-- 1) Narrow self access context. This replaces direct client SELECT of role.
create or replace function public.get_my_access_context()
returns table (
  role public.user_role,
  onboarding_completed boolean
)
language sql
stable
security definer
set search_path = ''
as $function$
  select p.role, p.onboarding_completed
  from public.profiles p
  where p.id = (select auth.uid());
$function$;

revoke all on function public.get_my_access_context() from public, anon, authenticated, service_role;
grant execute on function public.get_my_access_context() to authenticated, service_role;

-- 2) Narrow admin-only account directory. Authorization remains inside DB.
create or replace function public.admin_list_member_accounts()
returns table (
  id uuid,
  display_name text,
  first_name text,
  last_name text,
  email text,
  role public.user_role,
  onboarding_completed boolean,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $function$
begin
  if not public.is_admin() then
    raise exception 'Only admins can view member account administration data';
  end if;

  return query
  select
    p.id,
    p.display_name,
    p.first_name,
    p.last_name,
    p.email,
    p.role,
    p.onboarding_completed,
    p.created_at
  from public.profiles p
  order by p.created_at asc;
end;
$function$;

revoke all on function public.admin_list_member_accounts() from public, anon, authenticated, service_role;
grant execute on function public.admin_list_member_accounts() to authenticated, service_role;

-- 3) Preserve the current production search branches, but make the member
-- branch privacy-safe and require completed onboarding.
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
      coalesce(
        nullif(trim(p.display_name), ''),
        nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''),
        'Afghan Hub member'
      ) as title,
      coalesce(p.headline, p.profession) as subtitle,
      p.avatar_url as image_url,
      p.city,
      p.country,
      p.username as entity_slug,
      ts_rank(p.search_vector, query.value) as rank
    from public.profiles p, query
    where trim(search_query) <> ''
      and p.is_public = true
      and p.onboarding_completed = true
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

-- Current launch policy: search is a signed-in member surface.
revoke all on function public.search_afghan_hub(text, integer)
  from public, anon, authenticated, service_role;
grant execute on function public.search_afghan_hub(text, integer)
  to authenticated, service_role;

-- 4) Remove anonymous direct profile row access at policy level.
drop policy if exists profiles_select_public_or_owner on public.profiles;
create policy profiles_select_public_or_owner
on public.profiles
for select
to authenticated
using (
  is_public = true
  or id = (select auth.uid())
  or public.is_admin()
);

-- 5) Replace broad table SELECT with deliberate member-visible columns.
-- Other current table privileges are intentionally left untouched here so
-- #67 remains a field-read boundary change; #80 handles broader least privilege.
revoke select on table public.profiles from anon, authenticated;

grant select (
  id,
  display_name,
  first_name,
  last_name,
  username,
  avatar_url,
  headline,
  bio,
  profession,
  company,
  city,
  province_state,
  country,
  languages,
  skills,
  website_url,
  linkedin_url,
  is_public,
  onboarding_completed
) on table public.profiles to authenticated;

commit;
```

## Deliberate exclusions

This package does **not** change:

- `INSERT`/`UPDATE`/`DELETE`/structural table privileges — tracked separately by #80;
- `set_profile_role()` semantics;
- `enforce_profile_role` trigger;
- profile data values;
- Auth account email;
- storage policies;
- anonymous public catalog for businesses/organizations/opportunities/events.

Separating #67 field privacy from the larger #80 privilege reduction makes failures easier to isolate and rollback.

## Required isolated acceptance

After applying in staging, the `scripts/security-profile-personas.mjs` harness must pass, plus application checks for:

- dashboard layout / onboarding gate;
- Settings account email from Auth;
- member directory/detail;
- connection request/accepted connection identity joins;
- notification actor display;
- message participant display;
- search with visible/hidden/incomplete profiles;
- moderator access;
- admin team list and role management.

An unrelated authenticated token must fail when requesting `email`, `role`, timestamps or a mixed safe+private projection from another public profile.

## Production gate

Do not convert this document into a migration or apply it to production until an isolated environment exists, the application adapter transition is deployed/tested there, the full persona matrix passes, the paired rollback passes, and explicit production authorization is given.
