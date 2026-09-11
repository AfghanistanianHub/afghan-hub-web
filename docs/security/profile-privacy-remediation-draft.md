# Profile privacy remediation — SQL/application draft

Status: **review draft only — do not apply to production**

Related: #67 and `docs/security/profile-privacy-remediation.md`.

This document turns the approved architecture into a concrete implementation draft. It is intentionally stored as Markdown rather than a migration so it cannot be picked up by Supabase migration tooling accidentally.

## Goals

1. An unrelated authenticated member must not be able to select another member's `email`, `role`, timestamps, or other private/internal columns from `public.profiles`.
2. Existing member-facing joins may continue to read the display identity fields they actually need.
3. Self/account flows must continue to work without relying on `profiles.email`.
4. Admin role management must keep using database-enforced authorization.
5. Search must never use email as a display fallback and must exclude incomplete profiles.
6. Anonymous member-profile/search access remains closed unless explicitly approved later.

## Proposed staged database shape

### A. Keep only deliberate member-visible column access on `profiles`

The least disruptive first boundary is column-level SELECT, not a blanket table revoke without replacement.

Candidate member-visible columns:

- `id`
- `display_name`
- `first_name`
- `last_name`
- `username`
- `avatar_url`
- `headline`
- `bio`
- `profession`
- `company`
- `city`
- `province_state`
- `country`
- `languages`
- `skills`
- `website_url`
- `linkedin_url`
- `is_public`
- `onboarding_completed`

`onboarding_completed` is retained in this first-stage safe grant only because current directory/profile/search eligibility logic filters on it. It is lower sensitivity than account email/role, and preserving it avoids forcing several relationship queries into privileged functions in the same migration. A later cleanup may hide it behind a dedicated discovery surface.

Private columns that ordinary authenticated clients should not be able to select directly include at least:

- `email`
- `role`
- `created_at`
- `updated_at`
- `search_vector`
- future account/moderation/private-contact fields by default

### B. Draft grant change

**Do not run this block on production yet.** It depends on application changes in sections C–E landing first and passing persona tests.

```sql
-- DRAFT ONLY — NOT A PRODUCTION MIGRATION

revoke select on table public.profiles from anon;
revoke select on table public.profiles from authenticated;

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
```

This is deliberately a column privilege boundary. Existing RLS still controls which rows are visible; column privileges then constrain which fields can be requested from those rows.

### C. Replace direct role reads with a current-user capability RPC

Current dashboard code reads `profiles.role` directly. That dependency must be removed before revoking role SELECT.

Draft function:

```sql
-- DRAFT ONLY — NOT A PRODUCTION MIGRATION
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

revoke all on function public.get_my_access_context() from public, anon;
grant execute on function public.get_my_access_context() to authenticated;
```

Application change required before the grant change:

- `src/app/(dashboard)/layout.tsx` should call `get_my_access_context()` for role/onboarding state rather than selecting `role` from `profiles`.
- Existing display-name reads may remain on the safe column grant.

### D. Replace admin account-directory reads with an admin-only RPC

The moderation team intentionally needs member email, role, onboarding state and creation time. Those fields must not remain broadly selectable just to support one admin page.

Draft function:

```sql
-- DRAFT ONLY — NOT A PRODUCTION MIGRATION
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

revoke all on function public.admin_list_member_accounts() from public, anon;
grant execute on function public.admin_list_member_accounts() to authenticated;
```

Application change required:

- `src/app/(dashboard)/moderation/team/page.tsx` should fetch the list through this RPC.
- Role mutation should continue through the existing `set_profile_role(...)`, which already performs `is_admin()` and self-role checks inside the database.

### E. Harden `search_afghan_hub`

Current production/repo function has two profile-specific defects:

1. `coalesce(p.display_name, p.email)` can expose email as a result title.
2. It filters `is_public=true` but not `onboarding_completed=true`.

The minimum safe rewrite is:

```sql
-- profile branch only; full function must preserve the current published
-- business/organization/opportunity/event filters.
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
```

Additionally:

```sql
revoke execute on function public.search_afghan_hub(text, integer) from anon;
grant execute on function public.search_afghan_hub(text, integer) to authenticated;
```

Do **not** solve the current anonymous policy failure by granting `anon` execute on `is_admin()`.

## RLS follow-up

After the application has moved private reads to the narrow RPCs and column grants are verified, simplify the profile SELECT policy so it no longer needs to serve an anonymous role that cannot execute `is_admin()`.

Candidate direction:

- authenticated users: visible public rows, own row, or admin access as currently intended;
- anon: no direct `profiles` SELECT policy;
- admin-only private columns continue through privileged RPCs rather than broad column grants.

The exact policy DDL must be generated from the **current production policy definition at implementation time**, not copied blindly from an older repository migration.

## Migration-order requirement

A safe rollout order is:

1. Application: Settings email from Auth — **already completed in #69**.
2. Application: dashboard role/onboarding → `get_my_access_context`.
3. Application: admin member list → `admin_list_member_accounts`.
4. Database in isolated environment: create the two narrow RPCs and harden search.
5. Application in isolated environment: verify directory/member/connection/notification/search/admin flows.
6. Database in isolated environment: replace broad `profiles` SELECT with the safe column grant and updated RLS.
7. Run the persona matrix in `profile-privacy-persona-tests.md`.
8. Only after explicit approval and a production rollback plan, generate a production-specific migration from current schema metadata.

## Rollback design

Before production application, capture exact current definitions for:

- `profiles` grants;
- `profiles` RLS policies;
- `search_afghan_hub`;
- any new RPC definitions being replaced.

Rollback must restore those exact definitions, not approximate repository versions, because production migration history is not a one-to-one match with the repository migration directory.

## Explicit non-goals

This draft does not:

- apply any production DDL;
- repair migration history;
- create a Supabase branch that could incur cost;
- make member profiles public to anonymous users;
- change role-management semantics;
- delete or rewrite member data.
