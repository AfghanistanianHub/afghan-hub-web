-- SEC-01 Phase B: fixed-column ACL REHEARSAL ONLY; not a production migration.
-- Frozen from read-only Production schema inspection on 2026-10-25.
-- Public contact fields remain accessible as before; privacy review required.
BEGIN;
REVOKE SELECT ON public.businesses FROM anon,authenticated;
GRANT SELECT (id,owner_id,name,slug,logo_url,cover_url,category,short_description,description,services,website_url,email,phone,address_line,city,province_state,country,is_hiring,is_verified,status,created_at,updated_at) ON public.businesses TO anon,authenticated;
REVOKE SELECT ON public.events FROM anon,authenticated;
GRANT SELECT (id,creator_id,business_id,organization_id,title,slug,summary,description,venue_name,address_line,city,province_state,country,is_online,online_url,starts_at,ends_at,capacity,status,created_at,updated_at) ON public.events TO anon,authenticated;
REVOKE SELECT ON public.opportunities FROM anon,authenticated;
GRANT SELECT (id,author_id,business_id,organization_id,title,slug,summary,description,type,city,province_state,country,is_remote,external_url,contact_email,deadline,status,created_at,updated_at) ON public.opportunities TO anon,authenticated;
REVOKE SELECT ON public.organizations FROM anon,authenticated;
GRANT SELECT (id,owner_id,name,slug,logo_url,cover_url,organization_type,short_description,description,mission,programs,website_url,email,phone,address_line,city,province_state,country,is_accepting_volunteers,is_verified,status,created_at,updated_at) ON public.organizations TO anon,authenticated;
DO $assert$ DECLARE t text; c text; role_name text; BEGIN
FOREACH t IN ARRAY ARRAY['businesses','events','opportunities','organizations'] LOOP
 FOREACH c IN ARRAY ARRAY['moderation_note','moderated_by','moderated_at','search_vector'] LOOP
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=t AND column_name=c) THEN CONTINUE; END IF;
  FOREACH role_name IN ARRAY ARRAY['anon','authenticated'] LOOP
   IF has_column_privilege(role_name,format('public.%I',t),c,'SELECT') THEN
    RAISE EXCEPTION 'unexpected exposed %.% to %', t,c,role_name;
   END IF;
  END LOOP;
 END LOOP;
END LOOP;
END $assert$;
SELECT 'frozen_four_catalog_acl_assertions_passed' AS result;
ROLLBACK;
