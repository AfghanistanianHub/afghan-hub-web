-- Afghan Hub secondary-target refresh preflight
-- Assertion-only. This script performs no DDL/DML.
-- It is intended for the known secondary project before any schema refresh.

DO $$
DECLARE
  missing_count integer;
BEGIN
  -- Core tables that must already exist on the secondary baseline.
  SELECT count(*) INTO missing_count
  FROM (VALUES
    ('profiles'), ('businesses'), ('events'), ('opportunities'), ('organizations')
  ) AS required(name)
  WHERE to_regclass('public.' || required.name) IS NULL;
  IF missing_count <> 0 THEN
    RAISE EXCEPTION 'Secondary baseline mismatch: one or more required core tables are missing';
  END IF;

  -- These launch surfaces are expected to be absent before this refresh.
  IF to_regclass('public.notifications') IS NOT NULL THEN
    RAISE EXCEPTION 'Secondary baseline changed: public.notifications already exists';
  END IF;
  IF to_regclass('public.event_rsvps') IS NOT NULL THEN
    RAISE EXCEPTION 'Secondary baseline changed: public.event_rsvps already exists';
  END IF;

  -- Existing helper RPCs are part of the known baseline.
  IF to_regprocedure('public.get_my_access_context()') IS NULL
     OR to_regprocedure('public.can_moderate()') IS NULL
     OR to_regprocedure('public.is_admin()') IS NULL THEN
    RAISE EXCEPTION 'Secondary baseline mismatch: expected access helper RPC is missing';
  END IF;

  -- Role/content mutation RPCs are expected to be absent before refresh.
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'moderate_business', 'moderate_event', 'moderate_opportunity',
        'moderate_organization', 'set_profile_role', 'rsvp_to_event',
        'get_event_rsvp_count'
      )
  ) THEN
    RAISE EXCEPTION 'Secondary baseline changed: launch mutation/RSVP RPC already exists';
  END IF;

  -- Known missing moderation/search columns. If any appear, stop and re-diff.
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND (
        (table_name IN ('businesses','events','opportunities','organizations')
          AND column_name IN ('moderation_note','moderated_at','moderated_by'))
        OR
        (table_name IN ('profiles','businesses','opportunities','organizations')
          AND column_name = 'search_vector')
      )
  ) THEN
    RAISE EXCEPTION 'Secondary baseline changed: expected-missing moderation/search column already exists';
  END IF;

  -- Only the set_updated_at triggers should exist on the five core tables.
  IF EXISTS (
    SELECT 1
    FROM pg_trigger tg
    JOIN pg_class c ON c.oid = tg.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname IN ('profiles','businesses','events','opportunities','organizations')
      AND NOT tg.tgisinternal
      AND tg.tgname NOT IN (
        'profiles_set_updated_at', 'businesses_set_updated_at', 'events_set_updated_at',
        'opportunities_set_updated_at', 'organizations_set_updated_at'
      )
  ) THEN
    RAISE EXCEPTION 'Secondary baseline changed: unexpected application trigger exists on a core table';
  END IF;

  -- The baseline currently exposes only the known read policies on businesses/orgs
  -- plus profile self/safe access; event/opportunity moderation/owner policies are absent.
  IF EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('events','opportunities')
  ) THEN
    RAISE EXCEPTION 'Secondary baseline changed: events/opportunities already have RLS policies';
  END IF;
END
$$;

SELECT 'secondary_refresh_preflight_passed' AS result;
