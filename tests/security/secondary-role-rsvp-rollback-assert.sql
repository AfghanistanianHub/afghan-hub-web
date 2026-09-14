-- Assertions after tests/security/secondary-role-rsvp-rollback.sql
DO $$
DECLARE
  unexpected integer;
BEGIN
  IF to_regclass('public.notifications') IS NOT NULL OR to_regclass('public.event_rsvps') IS NOT NULL THEN
    RAISE EXCEPTION 'rollback assertion failed: launch table remains';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname IN (
      'moderate_event','moderate_opportunity','moderate_business','moderate_organization',
      'set_profile_role','rsvp_to_event','get_event_rsvp_count',
      'enforce_event_moderation','enforce_opportunity_moderation','enforce_business_moderation',
      'enforce_organization_moderation','enforce_profile_role','enforce_business_verification',
      'enforce_organization_verification','preserve_listing_identity'
    )
  ) THEN RAISE EXCEPTION 'rollback assertion failed: refresh function remains'; END IF;

  SELECT count(*) INTO unexpected
  FROM information_schema.columns
  WHERE table_schema='public'
    AND table_name IN ('businesses','events','opportunities','organizations')
    AND column_name IN ('moderation_note','moderated_at','moderated_by');
  IF unexpected <> 0 THEN RAISE EXCEPTION 'rollback assertion failed: moderation column remains'; END IF;

  IF EXISTS (
    SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public'
      AND c.relname IN ('profiles','businesses','events','opportunities','organizations')
      AND NOT t.tgisinternal
      AND t.tgname NOT IN (
        'profiles_set_updated_at','businesses_set_updated_at','events_set_updated_at',
        'opportunities_set_updated_at','organizations_set_updated_at'
      )
  ) THEN RAISE EXCEPTION 'rollback assertion failed: refresh trigger remains'; END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename IN ('events','opportunities')) THEN
    RAISE EXCEPTION 'rollback assertion failed: event/opportunity policy remains';
  END IF;

  -- Known baseline helpers must survive rollback.
  IF to_regprocedure('public.get_my_access_context()') IS NULL
     OR to_regprocedure('public.can_moderate()') IS NULL
     OR to_regprocedure('public.is_admin()') IS NULL THEN
    RAISE EXCEPTION 'rollback assertion failed: baseline access helper missing';
  END IF;
END $$;

SELECT 'secondary_role_rsvp_rollback_assertions_passed' AS result;
