# Production authorization rollback snapshot — 2026-09-12

Status: **read-only metadata evidence / review reference — not a migration**

Related: issues #67 and #80, `profile-privacy-production-snapshot-2026-09-12.md`, `profile-privacy-remediation-draft.md`, `profile-privacy-persona-tests.md`, and `public-schema-privilege-remediation.md`.

This snapshot was collected from Afghan Hub Production (`yussznmwjsvfvpabmwdc`) using metadata-only SQL. No member rows, email values, message contents, IDs, or other personal values were read. No DDL, DML, grant, RLS, function, Auth, storage, or production-data change was performed.

## `public.profiles` relation state

- owner: `postgres`
- RLS: enabled
- FORCE RLS: disabled
- relation ACL:

```text
postgres=arwdDxtm/postgres
anon=arwdDxtm/postgres
authenticated=arwdDxtm/postgres
service_role=arwdDxtm/postgres
```

For both `anon` and `authenticated`, `information_schema.role_table_grants` reports:

- `SELECT`
- `INSERT`
- `UPDATE`
- `DELETE`
- `TRUNCATE`
- `REFERENCES`
- `TRIGGER`

This confirms that profile privacy (#67) and public-schema least privilege (#80) overlap at the base relation boundary.

## Current profile columns

Production currently has 25 profile columns, in order:

1. `id uuid`
2. `email text`
3. `first_name text`
4. `last_name text`
5. `display_name text`
6. `username text`
7. `avatar_url text`
8. `headline text`
9. `bio text`
10. `profession text`
11. `company text`
12. `city text`
13. `province_state text`
14. `country text`
15. `languages text[]`
16. `skills text[]`
17. `website_url text`
18. `linkedin_url text`
19. `opportunity_status profile_status`
20. `role user_role`
21. `is_public boolean`
22. `onboarding_completed boolean`
23. `created_at timestamptz`
24. `updated_at timestamptz`
25. `search_vector tsvector`

The current remediation safe-field draft intentionally omits `email`, `opportunity_status`, `role`, timestamps, and `search_vector` from ordinary cross-member direct reads unless a later product requirement explicitly justifies one of them.

## Current profile RLS policies

### `profiles_insert_self`

- command: `INSERT`
- role: `authenticated`
- check: `id = auth.uid()`

### `profiles_select_public_or_owner`

- command: `SELECT`
- roles: `anon`, `authenticated`
- condition:

```sql
is_public = true
or id = auth.uid()
or public.is_admin()
```

### `profiles_update_self`

- command: `UPDATE`
- role: `authenticated`
- condition/check: `id = auth.uid()`

Because this row policy returns another member's public row to an authenticated caller, the current broad base-table `SELECT` grant also makes private/internal columns requestable. UI projections are not a database field boundary.

## Current profile triggers

The following non-internal triggers must survive any remediation:

- `enforce_profile_role` — BEFORE INSERT OR UPDATE; calls `public.enforce_profile_role()`.
- `profiles_search_vector_trigger` — BEFORE INSERT OR UPDATE of public searchable fields; calls `public.update_profile_search_vector()`.
- `profiles_set_updated_at` — BEFORE UPDATE; calls `public.set_updated_at()`.

`enforce_profile_role()` is `SECURITY DEFINER`, currently `search_path=public`, and preserves existing role on ordinary updates while forcing new ordinary inserts to `member`. Service role/admin are exempt through its internal authorization check.

## Current profile/security functions

### `public.is_admin()`

- `SECURITY DEFINER`
- `STABLE`
- empty `search_path`
- executable by `authenticated` and `service_role`, not `anon`
- checks current `auth.uid()` profile for `role='admin'`

### `public.search_afghan_hub(text, integer)`

- security invoker
- empty `search_path`
- executable by PUBLIC/anon/authenticated/service role under the current ACL
- profile branch currently uses `coalesce(p.display_name, p.email)`
- profile branch requires `is_public=true` but does **not** require `onboarding_completed=true`

The reviewed remediation must remove the email fallback, require completed onboarding for member search, and revoke anonymous execution under the current launch policy.

### `public.set_profile_role(uuid, user_role)`

- `SECURITY DEFINER`
- executable by `authenticated` and `service_role`, not `anon`
- calls `public.is_admin()` internally
- rejects self-role changes
- currently uses `search_path=public`

Production does **not** yet contain the proposed `get_my_access_context()` or `admin_list_member_accounts()` functions. Those belong to the staged remediation and must be created/tested only in an isolated environment first.

## Exact public default ACL finding

The public schema has broad default privileges for **both** observed object-owner paths.

### Owner `postgres`

```text
sequences (S): postgres=rwU, anon=rwU, authenticated=rwU, service_role=rwU
functions (f): postgres=X, anon=X, authenticated=X, service_role=X
tables    (r): postgres=arwdDxtm, anon=arwdDxtm, authenticated=arwdDxtm, service_role=arwdDxtm
```

### Owner `supabase_admin`

```text
sequences (S): postgres=rwU, anon=rwU, authenticated=rwU, service_role=rwU
functions (f): postgres=X, anon=X, authenticated=X, service_role=X
tables    (r): postgres=arwdDxtm, anon=arwdDxtm, authenticated=arwdDxtm, service_role=arwdDxtm
```

Therefore #80 cannot be solved only by changing existing table ACLs. Default privileges must also be corrected separately for each owner context, otherwise future tables/functions/sequences can silently reintroduce the broad grants.

## Current application-table grant pattern

Metadata confirms broad structural privileges (`TRUNCATE`, `TRIGGER`, `REFERENCES`) remain on many current tables for one or both application roles, including profiles, businesses, organizations, opportunities, events, connections, conversations, conversation membership, messages, and saved opportunities.

Important exceptions already narrower in the current state include:

- `notifications`: `authenticated` currently has `SELECT` only at table-grant level.
- some messaging/connection tables already lack selected direct mutation grants for `authenticated`, reflecting RPC-first flows.

The final least-privilege migration must therefore be object-specific, not a blanket grant template.

## Rollback target principles

A future production rollout package must capture same-window metadata again immediately before applying changes. If the schema is unchanged, this document is the semantic rollback reference; if it has changed, the new same-window snapshot supersedes it.

Rollback must explicitly restore:

1. relation/table privileges that existed immediately before rollout;
2. column grants if the remediation introduced column-level boundaries;
3. exact RLS policy definitions and role lists;
4. exact function definitions and execute ACLs;
5. exact owner-specific default ACLs for `postgres` and `supabase_admin`;
6. any changed search-path configuration;
7. all pre-existing profile triggers and trigger functions.

Do not use `GRANT ALL` as a guessed rollback and do not replay repository migration history. Production has a non-one-to-one migration baseline.

## Staging/test constraint

The existing second Supabase project is not accepted as staging because connector access currently fails password authentication. Do not create a potentially billable Supabase branch without explicit cost approval.

The read-only `scripts/security-profile-personas.mjs` harness on main is intended to validate the future isolated remediation. It rejects the Afghan Hub production project ref and contains no insert/update/delete/upsert or role-mutation RPC call.

## Production change gate

No production authorization change is authorized until all of the following are true:

1. a production-compatible isolated target exists;
2. forward SQL is generated from current production metadata, not stale repo history;
3. exact rollback SQL is generated from the same-window snapshot;
4. profile privacy and least-privilege changes are tested together;
5. the direct-API persona harness passes for anon/member/hidden/incomplete/moderator/admin cases;
6. required member, messaging, notification, contribution, RSVP and admin regressions pass;
7. an explicit production security-change decision is made.
