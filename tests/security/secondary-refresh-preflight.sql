-- Afghan Hub secondary-target refresh preflight
-- Assertion-only. This script performs no DDL/DML.
-- It is intended for the known secondary project before any schema refresh.

DO $$
DECLARE
  missing_count integer;
  enum_values text[];
BEGIN
  -- Core tables and launch dependencies that must already exist.
  SELECT count(*) INTO missing_count
  FROM (VALUES
    ('profiles'), ('businesses'), ('events'), ('opportunities'), ('organizations'),
    ('connections'), ('conversations'), ('conversation_members'), ('messages')
  ) AS required(name)
  WHERE to_regclass('public.' || required.name) IS NULL;
  IF missing_count <> 0 THEN
    RAISE EXCEPTION 'Secondary baseline mismatch: one or more required dependency tables are missing';
  END IF;

  -- RLS must already be enabled on the shared application surface.
  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname IN (
        'profiles','businesses','events','opportunities','organizations',
        'connections','conversations','conversation_members','messages'
      )
      AND NOT c.relrowsecurity
  ) THEN
    RAISE EXCEPTION 'Secondary baseline mismatch: expected RLS is disabled on a dependency table';
  END IF;

  -- Enum contracts used by the refresh must match production semantics.
  SELECT array_agg(e.enumlabel ORDER BY e.enumsortorder) INTO enum_values
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  JOIN pg_enum e ON e.enumtypid = t.oid
  WHERE n.nspname = 'public' AND t.typname = 'user_role';
  IF enum_values IS DISTINCT FROM ARRAY['member','moderator','admin']::text[] THEN
    RAISE EXCEPTION 'Secondary baseline mismatch: user_role enum differs';
  END IF;

  SELECT array_agg(e.enumlabel ORDER BY e.enumsortorder) INTO enum_values
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  JOIN pg_enum e ON e.enumtypid = t.oid
  WHERE n.nspname = 'public' AND t.typname = 'entity_status';
  IF enum_values IS DISTINCT FROM ARRAY['draft','published','suspended']::text[] THEN
    RAISE EXCEPTION 'Secondary baseline mismatch: entity_status enum differs';
  END IF;

  SELECT array_agg(e.enumlabel ORDER BY e.enumsortorder) INTO enum_values
  FROM pg_type t
  JOIN pg_namespace n ON n.oid = t.typnamespace
  JOIN pg_enum e ON e.enumtypid = t.oid
  WHERE n.nspname = 'public' AND t.typname = 'opportunity_status';
  IF enum_values IS DISTINCT FROM ARRAY['draft','published','closed','expired']::text[] THEN
    RAISE EXCEPTION 'Secondary baseline mismatch: opportunity_status enum differs';
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

  -- Forward-only trigger/helper functions must also be absent so rollback cannot
  -- accidentally remove pre-existing secondary behavior.
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'preserve_listing_identity', 'enforce_profile_role',
        'enforce_business_verification', 'enforce_organization_verification',
        'enforce_event_moderation', 'enforce_opportunity_moderation',
        'enforce_business_moderation', 'enforce_organization_moderation'
      )
  ) THEN
    RAISE EXCEPTION 'Secondary baseline changed: forward-only helper already exists';
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

  -- Event/opportunity policies are expected to be absent on the known baseline.
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
