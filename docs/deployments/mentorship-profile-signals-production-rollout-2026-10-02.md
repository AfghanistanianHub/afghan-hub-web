# Mentorship profile signals — production rollout plan (2026-10-02)

## Scope and current risk

Production Supabase project: `yussznmwjsvfvpabmwdc`.

The application on `main` already selects and writes the optional profile fields
`open_to_mentoring`, `looking_for_mentor`, and `mentorship_topics`, while the
production `public.profiles` table does not yet contain those columns.

This is an additive schema repair for code already present in production. It does
not change existing RLS policies, existing profile ownership rules, or existing
identity/role columns.

Production snapshot before rollout:
- `public.profiles`: 3 rows, approximately 176 kB total relation size.
- RLS policies: authenticated self INSERT, safe-or-self SELECT, self UPDATE.
- Existing authenticated profile access is column-restricted.
- The three mentorship columns are absent.
- The helper function and mentorship constraint are absent.

The equivalent change has already been rehearsed on the secondary Supabase project.
There the columns, constraint, SECURITY INVOKER helper and narrow SELECT/UPDATE grants
are present.

## Forward SQL

Apply the following as one reviewed production change, generated from the current
production state. Do not use blind `supabase db push` and do not repair historical
migration versions.

```sql
CREATE OR REPLACE FUNCTION public.mentorship_topics_are_valid(topics text[])
RETURNS boolean
LANGUAGE sql
SECURITY INVOKER
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $$
  SELECT
    topics IS NOT NULL
    AND cardinality(topics) <= 12
    AND NOT EXISTS (
      SELECT 1
      FROM unnest(topics) AS topic
      WHERE topic IS NULL
        OR topic = ''
        OR topic <> normalize(topic, NFC)
        OR topic ~ '^[[:space:]]|[[:space:]]$'
        OR char_length(topic) > 60
    )
    AND (
      SELECT count(*) = count(DISTINCT lower(topic))
      FROM unnest(topics) AS topic
    );
$$;

REVOKE ALL ON FUNCTION public.mentorship_topics_are_valid(text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mentorship_topics_are_valid(text[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.mentorship_topics_are_valid(text[]) TO authenticated;

ALTER TABLE public.profiles
  ADD COLUMN open_to_mentoring boolean NOT NULL DEFAULT false,
  ADD COLUMN looking_for_mentor boolean NOT NULL DEFAULT false,
  ADD COLUMN mentorship_topics text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_mentorship_topics_valid_check
    CHECK (public.mentorship_topics_are_valid(mentorship_topics));

GRANT SELECT (
  open_to_mentoring,
  looking_for_mentor,
  mentorship_topics
) ON public.profiles TO authenticated;

GRANT UPDATE (
  open_to_mentoring,
  looking_for_mentor,
  mentorship_topics
) ON public.profiles TO authenticated;
```

## Immediate verification

After the forward change, verify all of the following in the same maintenance window:

1. All three columns exist and are NOT NULL with expected defaults.
2. Existing profile rows contain `false`, `false`, and an empty topic array.
3. `profiles_mentorship_topics_valid_check` exists.
4. `mentorship_topics_are_valid(text[])` is SECURITY INVOKER, IMMUTABLE,
   PARALLEL SAFE and has an empty search path.
5. `anon` has no EXECUTE privilege on the helper.
6. `authenticated` has only the intended SELECT/UPDATE column privileges for the
   new fields; no mentorship INSERT grant is required by the current application flow.
7. Existing profile RLS policy definitions are unchanged.
8. Constraint probes accept valid NFC topics and reject null/empty/trim-invalid,
   over-60-character, over-12-item, duplicate-case and non-NFC inputs.
9. Run Supabase security and performance advisors and compare with the pre-change
   baseline. This change should not introduce a new security advisor finding.
10. Confirm current Vercel production routes no longer encounter missing-column
    errors when authenticated profile/member reads occur.

## Rollback

If the database change is applied before a code rollback is needed, roll back the
application first so production no longer references the mentorship columns.

If no real user mentorship values have been written, the database rollback is:

```sql
REVOKE SELECT (
  open_to_mentoring,
  looking_for_mentor,
  mentorship_topics
) ON public.profiles FROM authenticated;

REVOKE UPDATE (
  open_to_mentoring,
  looking_for_mentor,
  mentorship_topics
) ON public.profiles FROM authenticated;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_mentorship_topics_valid_check;

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS open_to_mentoring,
  DROP COLUMN IF EXISTS looking_for_mentor,
  DROP COLUMN IF EXISTS mentorship_topics;

DROP FUNCTION IF EXISTS public.mentorship_topics_are_valid(text[]);
```

If any member has already saved mentorship preferences, do not drop the columns
without first preserving those values. Prefer fixing forward or reverting the
application while retaining the additive columns.

## Stop conditions

Do not proceed with production DDL if:
- the production profile RLS/grant snapshot differs materially from the snapshot above;
- any of the three columns already exists in a conflicting type/state;
- the helper name exists with an incompatible signature/ownership;
- current production has unreviewed profile-schema changes;
- explicit production risk approval has not been given.

## Known pre-existing advisor findings

The pre-change security advisor currently reports unrelated existing warnings,
including `pg_trgm` in `public`, authenticated-callable SECURITY DEFINER
functions, and leaked-password protection disabled. Performance advisors report
unused-index informational findings. These are baseline items and are not part of
this mentorship rollout.
