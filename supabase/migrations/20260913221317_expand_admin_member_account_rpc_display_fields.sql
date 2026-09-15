DROP FUNCTION IF EXISTS public.admin_list_member_accounts();
CREATE FUNCTION public.admin_list_member_accounts()
RETURNS TABLE(
  id uuid,
  display_name text,
  first_name text,
  last_name text,
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
  SELECT p.id, p.display_name, p.first_name, p.last_name, p.email, p.role, p.onboarding_completed, p.created_at
  FROM public.profiles p
  ORDER BY p.created_at ASC;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_list_member_accounts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_member_accounts() TO authenticated, service_role;