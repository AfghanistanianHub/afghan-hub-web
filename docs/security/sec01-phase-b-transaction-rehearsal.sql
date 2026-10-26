-- SEC-01 PHASE B — DISPOSABLE TRANSACTION REHEARSAL ONLY
-- Never deploy this script directly. Its allowlist omits internal columns but
-- must be reviewed against every app API dependency before an actual migration.
BEGIN;
DO $block$
DECLARE
  tbl text;
  cols text;
  private_cols text[] := ARRAY['moderation_note','moderated_by','moderated_at'];
  field text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['businesses','organizations','events','opportunities'] LOOP
    EXECUTE format('REVOKE SELECT ON TABLE public.%I FROM anon,authenticated',tbl);
    SELECT string_agg(format('%I',column_name),',' ORDER BY ordinal_position)
      INTO cols FROM information_schema.columns
      WHERE table_schema='public' AND table_name=tbl
        AND column_name NOT IN ('moderation_note','moderated_by','moderated_at');
    IF cols IS NULL THEN RAISE EXCEPTION 'missing catalog %',tbl; END IF;
    EXECUTE format('GRANT SELECT (%s) ON public.%I TO anon,authenticated',cols,tbl);
    FOREACH field IN ARRAY private_cols LOOP
      IF has_column_privilege('anon',format('public.%I',tbl),field,'SELECT')
        OR has_column_privilege('authenticated',format('public.%I',tbl),field,'SELECT')
      THEN RAISE EXCEPTION 'private column exposed: %.%',tbl,field; END IF;
    END LOOP;
  END LOOP;
END
$block$;
SELECT 'four catalog column-boundary assertions passed' AS assertion;
ROLLBACK;

-- DO NOT USE THIS DYNAMIC ALLOWLIST AS A PRODUCTION MIGRATION.
-- Explicit frozen column lists, full JWT personas, and an exact ACL snapshot
-- are required to construct the real Phase B forward and rollback package.
