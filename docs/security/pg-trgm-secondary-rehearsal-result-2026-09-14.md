# pg_trgm secondary relocation result — 2026-09-14

Related: #135 and the reviewed package in `pg-trgm-relocation-rehearsal-2026-09-14.md`.

## Scope

This is evidence from the **non-production secondary Supabase project only** (`rurgmyiiytesknsfwjjl`). It is not authorization or evidence that production was changed.

## Preflight

Immediately before the forward rehearsal:

- `pg_trgm` version: `1.6`;
- schema: `public`;
- `extrelocatable`: `true`;
- owner: `supabase_admin`;
- `extensions` schema: present;
- repository search: no application matches for `gin_trgm_ops`, `similarity`, `word_similarity`, `strict_word_similarity`, or `show_trgm` usage;
- database scan excluding extension-owned procedures: zero public application-function references to those trigram functions.

## Forward execution

The reviewed assertion-guarded forward change was applied to secondary:

```sql
ALTER EXTENSION pg_trgm SET SCHEMA extensions;
```

The migration completed successfully.

## Post-forward verification

After relocation:

- schema: `extensions`;
- version: still `1.6`;
- owner: still `supabase_admin`;
- `extrelocatable`: still `true`;
- hosted `search_path`: `"$user", public, extensions`;
- qualified `extensions.similarity('afghan', 'afghan')` returned `1`;
- the `%` trigram operator resolved successfully;
- all launch-critical application tables remained present;
- all launch-critical application RPC names remained present;
- all 12 launch-critical application tables remained RLS-enabled;
- a fresh Supabase Security Advisor run no longer reported `extension_in_public` for `pg_trgm`.

The remaining Security Advisor findings were the already tracked authenticated-callable `SECURITY DEFINER` application RPCs and Free-plan leaked-password protection limitation. No new RLS or extension warning appeared.

## Secondary target disposition

Because the platform/database qualification passed and `extensions` is the desired hardened location, secondary is intentionally left with `pg_trgm` in `extensions`. The reviewed rollback remains available if later behavioral acceptance reveals an application regression:

```sql
ALTER EXTENSION pg_trgm SET SCHEMA public;
```

## Remaining production gate

This rehearsal materially reduces migration uncertainty but does **not** authorize production DDL.

Before production relocation:

1. complete the relevant controlled hosted/member acceptance from #120;
2. capture same-window production `pg_extension`/dependency metadata;
3. keep the reviewed rollback ready;
4. apply only with explicit production change authorization;
5. re-run production Security Advisor and release/member smoke after the change.

Production remains unchanged: `pg_trgm` is still in `public` there.
