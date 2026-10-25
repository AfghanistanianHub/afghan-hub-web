-- SEC-01: READ ONLY metadata assertions, safe to run against production.
-- No data rows, secrets, DDL or transactions are accessed or modified.
-- A FAIL row means the moderation-field boundary is still open.
WITH catalogs(table_name) AS (
  VALUES ('businesses'),('events'),('opportunities'),('organizations')
), role_names(role_name) AS (
  VALUES ('anon'),('authenticated')
), checks AS (
  SELECT
    c.table_name,
    r.role_name,
    has_table_privilege(r.role_name, format('public.%I', c.table_name), 'SELECT') AS table_select,
    has_column_privilege(r.role_name, format('public.%I', c.table_name), 'moderation_note', 'SELECT') AS note_select,
    has_column_privilege(r.role_name, format('public.%I', c.table_name), 'moderated_at', 'SELECT') AS time_select,
    has_column_privilege(r.role_name, format('public.%I', c.table_name), 'moderated_by', 'SELECT') AS actor_select
  FROM catalogs c CROSS JOIN role_names r
)
SELECT table_name, role_name, table_select, note_select, time_select, actor_select,
  CASE WHEN note_select OR time_select OR actor_select THEN 'FAIL: moderation fields queryable'
       ELSE 'PASS: moderation fields denied' END AS privacy_boundary
FROM checks ORDER BY table_name, role_name;

-- Inventory whether privilege-sensitive helpers are callable directly.
SELECT p.oid::regprocedure::text AS signature,
  p.prosecdef AS security_definer,
  coalesce(array_to_string(p.proconfig,','),'') AS configuration,
  has_function_privilege('anon',p.oid,'EXECUTE') AS anon_execute,
  has_function_privilege('authenticated',p.oid,'EXECUTE') AS authenticated_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname IN
 ('get_listing_moderation_feedback','can_moderate','is_admin','set_profile_role')
ORDER BY 1;
