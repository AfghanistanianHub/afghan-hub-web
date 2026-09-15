\set ON_ERROR_STOP on

DO $$
DECLARE
  missing_tables text[];
BEGIN
  SELECT array_agg(name ORDER BY name)
  INTO missing_tables
  FROM (
    VALUES
      ('profiles'),
      ('businesses'),
      ('organizations'),
      ('opportunities'),
      ('events'),
      ('connections'),
      ('conversations'),
      ('conversation_members'),
      ('messages'),
      ('notifications'),
      ('saved_opportunities'),
      ('event_rsvps')
  ) AS required(name)
  WHERE to_regclass('public.' || name) IS NULL;

  IF missing_tables IS NOT NULL THEN
    RAISE EXCEPTION 'Fresh replay is missing launch-critical tables: %', missing_tables;
  END IF;
END
$$;

DO $$
DECLARE
  rls_count integer;
BEGIN
  SELECT count(*)
  INTO rls_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = ANY (ARRAY[
      'profiles','businesses','organizations','opportunities','events','connections',
      'conversations','conversation_members','messages','notifications',
      'saved_opportunities','event_rsvps'
    ])
    AND c.relrowsecurity;

  IF rls_count <> 12 THEN
    RAISE EXCEPTION 'Expected RLS enabled on 12 launch tables, found %', rls_count;
  END IF;
END
$$;

DO $$
DECLARE
  missing_constraints text[];
BEGIN
  SELECT array_agg(name ORDER BY name)
  INTO missing_constraints
  FROM (
    VALUES
      ('profiles_username_format'),
      ('organizations_short_description_length'),
      ('businesses_website_url_http'),
      ('organizations_website_url_http'),
      ('opportunities_external_url_http'),
      ('events_online_url_http'),
      ('businesses_email_format'),
      ('organizations_email_format'),
      ('opportunities_contact_email_format')
  ) AS required(name)
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_constraint c WHERE c.conname = required.name
  );

  IF missing_constraints IS NOT NULL THEN
    RAISE EXCEPTION 'Fresh replay is missing integrity constraints: %', missing_constraints;
  END IF;
END
$$;

DO $$
DECLARE
  vector_count integer;
BEGIN
  SELECT count(*)
  INTO vector_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND column_name = 'search_vector'
    AND table_name = ANY (ARRAY['profiles','businesses','organizations','opportunities']);

  IF vector_count <> 4 THEN
    RAISE EXCEPTION 'Expected four search_vector columns, found %', vector_count;
  END IF;

  IF to_regprocedure('public.search_afghan_hub(text,integer)') IS NULL THEN
    RAISE EXCEPTION 'search_afghan_hub(text, integer) is missing after fresh replay';
  END IF;
END
$$;

DO $$
DECLARE
  expected_buckets integer;
  avatar_ok boolean;
  business_ok boolean;
  organization_ok boolean;
BEGIN
  SELECT count(*)
  INTO expected_buckets
  FROM storage.buckets
  WHERE id = ANY (ARRAY['avatars','business-media','organization-media']);

  IF expected_buckets <> 3 THEN
    RAISE EXCEPTION 'Expected all three media buckets after fresh replay, found %', expected_buckets;
  END IF;

  SELECT public = true
      AND file_size_limit = 5242880
      AND allowed_mime_types @> ARRAY['image/jpeg','image/png','image/webp']::text[]
  INTO avatar_ok
  FROM storage.buckets
  WHERE id = 'avatars';

  SELECT public = false
      AND file_size_limit = 10485760
      AND allowed_mime_types @> ARRAY['image/jpeg','image/png','image/webp']::text[]
  INTO business_ok
  FROM storage.buckets
  WHERE id = 'business-media';

  SELECT public = false
      AND file_size_limit = 10485760
      AND allowed_mime_types @> ARRAY['image/jpeg','image/png','image/webp']::text[]
  INTO organization_ok
  FROM storage.buckets
  WHERE id = 'organization-media';

  IF coalesce(avatar_ok, false) IS NOT TRUE
     OR coalesce(business_ok, false) IS NOT TRUE
     OR coalesce(organization_ok, false) IS NOT TRUE THEN
    RAISE EXCEPTION 'Media bucket configuration does not match the expected replay target';
  END IF;
END
$$;

DO $$
DECLARE
  missing_policies text[];
BEGIN
  SELECT array_agg(name ORDER BY name)
  INTO missing_policies
  FROM (
    VALUES
      ('storage_public_read'),
      ('storage_avatar_insert_own_folder'),
      ('storage_avatar_update_own_folder'),
      ('storage_avatar_delete_own_folder'),
      ('storage_business_media_insert_owner'),
      ('storage_business_media_update_owner'),
      ('storage_business_media_delete_owner'),
      ('storage_business_media_select_status_aware'),
      ('storage_organization_media_insert_owner'),
      ('storage_organization_media_update_owner'),
      ('storage_organization_media_delete_owner'),
      ('storage_organization_media_select_status_aware')
  ) AS required(name)
  WHERE NOT EXISTS (
    SELECT 1
    FROM pg_policies p
    WHERE p.schemaname = 'storage'
      AND p.tablename = 'objects'
      AND p.policyname = required.name
  );

  IF missing_policies IS NOT NULL THEN
    RAISE EXCEPTION 'Fresh replay is missing Storage policies: %', missing_policies;
  END IF;
END
$$;

DO $$
DECLARE
  realtime_count integer;
BEGIN
  SELECT count(*)
  INTO realtime_count
  FROM pg_publication_tables
  WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = ANY (ARRAY['conversation_members','messages','notifications']);

  IF realtime_count <> 3 THEN
    RAISE EXCEPTION 'Expected three launch-critical Realtime tables, found %', realtime_count;
  END IF;
END
$$;

DO $$
DECLARE
  missing_versions text[];
BEGIN
  SELECT array_agg(version ORDER BY version)
  INTO missing_versions
  FROM (
    VALUES
      ('20260719000100'),
      ('20260719001500'),
      ('20260809000200'),
      ('20260830024037'),
      ('20260904054521'),
      ('20260904184543'),
      ('20260913221159'),
      ('20260913222546'),
      ('20260913222712')
  ) AS required(version)
  WHERE NOT EXISTS (
    SELECT 1
    FROM supabase_migrations.schema_migrations m
    WHERE m.version = required.version
  );

  IF missing_versions IS NOT NULL THEN
    RAISE EXCEPTION 'Fresh replay migration history is missing required versions: %', missing_versions;
  END IF;
END
$$;

SELECT 'fresh migration replay invariants passed' AS result;
