# Profile privacy rollback rehearsal SQL — 2026-09-12

Status: **isolated-environment rollback rehearsal only — DO NOT APPLY TO PRODUCTION**

Related: #67, `profile-privacy-forward-rehearsal-2026-09-12.md`, `production-authorization-rollback-snapshot-2026-09-12.md`.

This rollback candidate restores the profile/search state captured from Afghan Hub Production on 2026-09-12. It is intentionally Markdown and must be regenerated from a same-window production snapshot before any real production rollout. If production metadata changes after this snapshot, the newer snapshot wins.

## Candidate rollback SQL

```sql
-- ISOLATED REHEARSAL ONLY. NOT AUTHORIZED FOR PRODUCTION.
begin;

-- 1) Remove staged private-read RPCs; they did not exist in the captured
-- production state.
drop function if exists public.admin_list_member_accounts();
drop function if exists public.get_my_access_context();

-- 2) Restore the captured production search definition exactly in behavior.
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

-- Restore captured function exposure. Production snapshot had EXECUTE for
-- PUBLIC plus explicit anon/authenticated/service_role ACL entries.
revoke all on function public.search_afghan_hub(text, integer)
  from public, anon, authenticated, service_role;
grant execute on function public.search_afghan_hub(text, integer)
  to public, anon, authenticated, service_role;

-- 3) Remove staged column-only SELECT ACL before restoring relation SELECT.
revoke select (
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
) on table public.profiles from authenticated;

-- Captured production state grants relation-level SELECT to both app roles.
grant select on table public.profiles to anon, authenticated;

-- 4) Restore captured SELECT policy including anon/authenticated role list.
drop policy if exists profiles_select_public_or_owner on public.profiles;
create policy profiles_select_public_or_owner
on public.profiles
for select
to anon, authenticated
using (
  is_public = true
  or id = (select auth.uid())
  or public.is_admin()
);

commit;
```

## What this rollback intentionally does not touch

The forward #67 rehearsal does not change these, so rollback must not churn them either:

- profile INSERT/UPDATE/DELETE/structural privileges;
- `profiles_insert_self` / `profiles_update_self` policies;
- `enforce_profile_role`, search-vector, or updated-at triggers;
- `set_profile_role()`;
- any row values;
- Auth or storage;
- #80 default ACL/table/function remediation.

## Important caveat

The captured production SELECT policy includes `anon` while its expression calls `public.is_admin()`, which anon cannot execute. That is part of the **current captured state**, not the desired design. The rollback restores it because rollback should restore known pre-change behavior, not silently invent a third state.

A real production rollback package must be regenerated immediately before rollout and compared against the then-current metadata.

## Rollback rehearsal acceptance

In the isolated environment:

1. apply the forward rehearsal;
2. prove the #67 persona matrix and app paths;
3. apply this rollback;
4. compare grants, policies, search definition, function presence and execution ACLs to the pre-forward snapshot;
5. confirm the application version used for the rollback remains compatible with the restored DB state.

Do not use this document as a substitute for a same-window production snapshot.
