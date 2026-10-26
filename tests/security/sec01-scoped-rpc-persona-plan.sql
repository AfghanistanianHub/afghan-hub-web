-- Persona assertions: run ONLY in a fully isolated seeded environment.
-- Use REST authenticated JWT identities for member A, member B, moderator, admin.
-- Assert 0 rows for unrelated member / anon EXECUTE denied.
-- Assert exactly 1 matching row for owner and for moderator/admin.
-- Assert moderated_by NULL for owner and visible to reviewer when set.
-- Assert NULL/invalid entity_type and random UUID return 0 rows.
-- Assert neither public.can_moderate() nor function resolves private data for anonymous.
-- Test direct SELECT against base tables BEFORE and AFTER a separately authorized column ACL change.
-- Test submissions and moderation histories and business/org detail pages.
-- No production data mutation is authorized by this test specification.
select p.oid::regprocedure::text as signature,
 p.prosecdef,
 coalesce(array_to_string(p.proconfig,','),'') as function_config,
 has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
 has_function_privilege('authenticated',p.oid,'EXECUTE') as auth_execute
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname='get_listing_moderation_feedback';
