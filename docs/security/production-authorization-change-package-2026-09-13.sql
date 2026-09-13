-- REVIEW DRAFT ONLY — DO NOT APPLY BLINDLY.
-- Afghan Hub production authorization package, generated after isolated rehearsal on 2026-09-13.
-- Production project ref yussznmwjsvfvpabmwdc must not be changed without an explicit rollout decision.
-- This file is intentionally under docs/security rather than supabase/migrations.

-- ---------------------------------------------------------------------------
-- FORWARD PHASE A: profile privacy boundary (#67)
-- ---------------------------------------------------------------------------

-- Preserve service_role/postgres access. Close anonymous direct profile access.
REVOKE ALL ON TABLE public.profiles FROM anon;

-- Remove authenticated table-wide SELECT/UPDATE so private columns cannot be requested.
REVOKE SELECT, UPDATE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN ON TABLE public.profiles FROM authenticated;

-- Keep only the member-safe read contract required by current UI flows.
GRANT SELECT (
  id, first_name, last_name, display_name, username, avatar_url, headline, bio,
  profession, company, city, province_state, country, languages, skills,
  website_url, linkedin_url, is_public, onboarding_completed
) ON public.profiles TO authenticated;

-- Keep only self-editable fields. Account email, role and system/search fields are excluded.
GRANT UPDATE (
  first_name, last_name, display_name, username, avatar_url, headline, bio,
  profession, company, city, province_state, country, languages, skills,
  website_url, linkedin_url, opportunity_status, is_public, onboarding_completed
) ON public.profiles TO authenticated;

DROP POLICY IF EXISTS profiles_select_public_or_owner ON public.profiles;
CREATE POLICY profiles_select_safe_or_self
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = (SELECT auth.uid())
  OR (is_public = true AND onboarding_completed = true)
);

CREATE OR REPLACE FUNCTION public.get_my_access_context()
RETURNS TABLE(role public.user_role, onboarding_completed boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.role, p.onboarding_completed
  FROM public.profiles p
  WHERE p.id = auth.uid();
$$;
REVOKE ALL ON FUNCTION public.get_my_access_context() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_access_context() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.can_moderate()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('moderator'::public.user_role, 'admin'::public.user_role)
  );
$$;
REVOKE ALL ON FUNCTION public.can_moderate() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_moderate() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.admin_list_member_accounts()
RETURNS TABLE(
  id uuid,
  email text,
  role public.user_role,
  onboarding_completed boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT p.id, p.email, p.role, p.onboarding_completed, p.created_at
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_list_member_accounts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_member_accounts() TO authenticated, service_role;

-- Production search must be replaced with the reviewed safe implementation before rollout.
-- Required semantic changes to the existing function:
--   * profile title: NEVER fall back to p.email;
--   * require p.is_public = true AND p.onboarding_completed = true;
--   * revoke anon execute unless anonymous member discovery becomes an approved requirement.
-- Keep current production full-text/event/catalog ranking semantics when rewriting it.
REVOKE EXECUTE ON FUNCTION public.search_afghan_hub(text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_afghan_hub(text, integer) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- FORWARD PHASE B: structural privilege reduction (#80)
-- This phase does not yet remove application DML required by current flows.
-- ---------------------------------------------------------------------------

DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'REVOKE TRUNCATE, REFERENCES, TRIGGER, MAINTAIN ON TABLE %I.%I FROM anon, authenticated',
      r.schemaname, r.tablename
    );
  END LOOP;
END $$;

-- Fix broad postgres-owned public-table defaults.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;

-- Production metadata also shows broad supabase_admin-owned public-table defaults.
-- Confirm the migration execution role can alter this owner's defaults immediately before rollout.
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- REQUIRED SAME-WINDOW VERIFICATION BEFORE COMMITTING ROLLOUT
-- ---------------------------------------------------------------------------
-- 1. anon cannot SELECT public.profiles or execute member-profile/search/admin RPCs.
-- 2. unrelated authenticated member can read only safe fields of visible+onboarded members.
-- 3. direct email/role projection fails for unrelated members.
-- 4. hidden/incomplete profiles are absent from member discovery/search.
-- 5. self profile editing still works; direct role mutation does not.
-- 6. moderator capability works but admin account listing is denied.
-- 7. admin account listing and set_profile_role still work.
-- 8. connections/messages/notifications/content/RSVP regressions pass.
-- 9. anon/authenticated have no TRUNCATE/TRIGGER/REFERENCES/MAINTAIN on public tables.
-- 10. current profile triggers remain present and enabled.

-- ---------------------------------------------------------------------------
-- ROLLBACK REFERENCE
-- MUST be refreshed from production immediately before rollout.
-- The following restores the 2026-09-12 snapshot semantics only if unchanged.
-- ---------------------------------------------------------------------------

-- DROP FUNCTION IF EXISTS public.admin_list_member_accounts();
-- DROP FUNCTION IF EXISTS public.can_moderate();
-- DROP FUNCTION IF EXISTS public.get_my_access_context();
--
-- DROP POLICY IF EXISTS profiles_select_safe_or_self ON public.profiles;
-- CREATE POLICY profiles_select_public_or_owner
-- ON public.profiles FOR SELECT TO anon, authenticated
-- USING (is_public = true OR id = (SELECT auth.uid()) OR public.is_admin());
--
-- GRANT SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.profiles TO anon, authenticated;
--
-- Restore the pre-change definition and execute ACL of search_afghan_hub from a same-window pg_get_functiondef/ACL snapshot.
-- Restore table/default ACLs exactly from the same-window snapshot; DO NOT use guessed GRANT ALL as rollback.
