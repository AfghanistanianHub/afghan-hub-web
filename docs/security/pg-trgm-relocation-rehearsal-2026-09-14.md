# pg_trgm relocation rehearsal — 2026-09-14

Related: #135.

## Production facts captured read-only

- `pg_trgm` is installed at version `1.6` in schema `public`.
- `pg_extension.extrelocatable = true` for `pg_trgm`.
- Current Supabase Security Advisor reports `extension_in_public` for this extension.
- No `pg_class` dependency rows were found for `pg_trgm`-owned objects in the production dependency check.
- Repository search found no explicit `gin_trgm_ops` or `similarity(...)` usage.
- The existing `extensions` schema is already used by other managed extensions.

This evidence makes a schema-only relocation plausible, but it is still production DDL and is **not authorized by this document**.

## Forward candidate

Run only in a production-compatible isolated target first, then in production only with a same-window metadata snapshot and rollback ready.

```sql
begin;

do $$
declare
  current_schema text;
  relocatable boolean;
  current_version text;
begin
  select n.nspname, e.extrelocatable, e.extversion
  into current_schema, relocatable, current_version
  from pg_extension e
  join pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'pg_trgm';

  if current_schema is distinct from 'public'
     or relocatable is distinct from true
     or current_version is distinct from '1.6' then
    raise exception 'pg_trgm baseline changed; refusing relocation';
  end if;

  if not exists (select 1 from pg_namespace where nspname = 'extensions') then
    raise exception 'extensions schema missing; refusing relocation';
  end if;
end $$;

alter extension pg_trgm set schema extensions;

do $$
declare
  moved_schema text;
begin
  select n.nspname
  into moved_schema
  from pg_extension e
  join pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'pg_trgm';

  if moved_schema is distinct from 'extensions' then
    raise exception 'pg_trgm relocation verification failed';
  end if;
end $$;

commit;
```

## Rollback candidate

```sql
begin;

do $$
declare
  current_schema text;
begin
  select n.nspname
  into current_schema
  from pg_extension e
  join pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'pg_trgm';

  if current_schema is distinct from 'extensions' then
    raise exception 'pg_trgm is not in extensions; refusing rollback';
  end if;
end $$;

alter extension pg_trgm set schema public;

do $$
declare
  restored_schema text;
begin
  select n.nspname
  into restored_schema
  from pg_extension e
  join pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'pg_trgm';

  if restored_schema is distinct from 'public' then
    raise exception 'pg_trgm rollback verification failed';
  end if;
end $$;

commit;
```

## Required rehearsal checks

Before forward:

1. Capture `pg_extension` metadata and `pg_depend` rows for `pg_trgm`.
2. Run public smoke and authenticated acceptance relevant to search/member discovery.
3. Confirm no SQL/RPC/function uses unqualified `pg_trgm` functions/operators that depend on `public` being in `search_path`.

After forward:

1. Re-run Security Advisor; `extension_in_public` should clear for `pg_trgm`.
2. Re-run public search/list/detail smoke.
3. Re-run Member A/B discovery preflight.
4. Verify no new database errors caused by extension function/operator resolution.
5. Confirm extension version and owner are unchanged; only schema should differ.

Rollback immediately if application/database behavior regresses.

## Scope boundary

This package does not enable leaked-password protection and does not address the separate `authenticated_security_definer_function_executable` warnings. It changes no application tables, RLS policies, grants, Auth configuration, data, or extension version.