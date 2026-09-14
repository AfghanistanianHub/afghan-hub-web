-- Assertions after tests/security/secondary-role-rsvp-forward.sql
DO $$
DECLARE
  missing integer;
BEGIN
  IF to_regclass('public.notifications') IS NULL OR to_regclass('public.event_rsvps') IS NULL THEN
    RAISE EXCEPTION 'forward assertion failed: required table missing';
  END IF;

  SELECT count(*) INTO missing
  FROM (VALUES
    ('moderate_event','uuid, text, text'),
    ('moderate_opportunity','uuid, text, text'),
    ('moderate_business','uuid, text, text'),
    ('moderate_organization','uuid, text, text'),
    ('set_profile_role','uuid, public.user_role'),
    ('rsvp_to_event','uuid'),
    ('get_event_rsvp_count','uuid')
  ) AS required(name,args)
  WHERE to_regprocedure('public.' || required.name || '(' || required.args || ')') IS NULL;
  IF missing <> 0 THEN RAISE EXCEPTION 'forward assertion failed: required RPC missing'; END IF;

  SELECT count(*) INTO missing
  FROM (VALUES
    ('businesses','moderation_note'),('businesses','moderated_at'),('businesses','moderated_by'),
    ('events','moderation_note'),('events','moderated_at'),('events','moderated_by'),
    ('opportunities','moderation_note'),('opportunities','moderated_at'),('opportunities','moderated_by'),
    ('organizations','moderation_note'),('organizations','moderated_at'),('organizations','moderated_by')
  ) AS required(tab,col)
  WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.columns c
    WHERE c.table_schema='public' AND c.table_name=required.tab AND c.column_name=required.col
  );
  IF missing <> 0 THEN RAISE EXCEPTION 'forward assertion failed: moderation column missing'; END IF;

  SELECT count(*) INTO missing
  FROM (VALUES
    ('events','events_insert_creator'),('events','events_update_creator'),('events','events_delete_creator'),
    ('events','events_select_published_public'),('events','events_select_published_or_creator'),
    ('opportunities','opportunities_insert_author'),('opportunities','opportunities_update_author'),
    ('opportunities','opportunities_delete_author'),('opportunities','opportunities_select_published_public'),
    ('opportunities','opportunities_select_published_or_author'),
    ('businesses','businesses_insert_owner'),('businesses','businesses_update_owner'),('businesses','businesses_delete_owner'),
    ('organizations','organizations_insert_owner'),('organizations','organizations_update_owner'),('organizations','organizations_delete_owner'),
    ('notifications','notifications_select_recipient')
  ) AS required(tab,pol)
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=required.tab AND p.policyname=required.pol
  );
  IF missing <> 0 THEN RAISE EXCEPTION 'forward assertion failed: RLS policy missing'; END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.role_table_grants
    WHERE table_schema='public' AND table_name IN ('notifications','event_rsvps') AND grantee='anon'
  ) THEN RAISE EXCEPTION 'forward assertion failed: anon has launch-table privileges'; END IF;

  IF NOT has_table_privilege('authenticated','public.notifications','SELECT')
     OR has_table_privilege('authenticated','public.notifications','INSERT')
     OR has_table_privilege('authenticated','public.notifications','UPDATE')
     OR has_table_privilege('authenticated','public.notifications','DELETE') THEN
    RAISE EXCEPTION 'forward assertion failed: notifications grants mismatch';
  END IF;

  IF NOT has_table_privilege('authenticated','public.event_rsvps','SELECT')
     OR NOT has_table_privilege('authenticated','public.event_rsvps','DELETE')
     OR has_table_privilege('authenticated','public.event_rsvps','INSERT')
     OR has_table_privilege('authenticated','public.event_rsvps','UPDATE') THEN
    RAISE EXCEPTION 'forward assertion failed: event_rsvps grants mismatch';
  END IF;

  SELECT count(*) INTO missing
  FROM (VALUES
    ('events','enforce_event_moderation'),('events','preserve_event_identity'),
    ('opportunities','enforce_opportunity_moderation'),('opportunities','preserve_opportunity_identity'),
    ('businesses','enforce_business_moderation'),('businesses','enforce_business_verification'),('businesses','preserve_business_identity'),
    ('organizations','enforce_organization_moderation'),('organizations','enforce_organization_verification'),('organizations','preserve_organization_identity'),
    ('profiles','enforce_profile_role')
  ) AS required(tab,trg)
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relname=required.tab AND t.tgname=required.trg AND NOT t.tgisinternal
  );
  IF missing <> 0 THEN RAISE EXCEPTION 'forward assertion failed: trigger missing'; END IF;
END $$;

SELECT 'secondary_role_rsvp_forward_assertions_passed' AS result;
