do $$ begin
  if exists ((select * from before_acl except select * from table_acl) union all (select * from table_acl except select * from before_acl))
  then raise exception 'Rollback table ACL differs from baseline'; end if;
  if exists ((select * from before_defaults except select * from default_acl) union all (select * from default_acl except select * from before_defaults))
  then raise exception 'Rollback defaults differ from baseline'; end if;
  if exists ((select definition from before_policies except select row_to_json(p)::jsonb from pg_policy p) union all (select row_to_json(p)::jsonb from pg_policy p except select definition from before_policies))
  then raise exception 'Policies changed'; end if;
  if exists (select 1 from before_rls b join pg_class c using(oid) where b.relrowsecurity<>c.relrowsecurity or b.relforcerowsecurity<>c.relforcerowsecurity)
  then raise exception 'RLS flags changed'; end if;
  if exists (select 1 from before_functions b join pg_proc p using(oid) where b.proacl is distinct from p.proacl or b.proconfig is distinct from p.proconfig or b.prosrc<>p.prosrc)
  then raise exception 'Function changed'; end if;
end $$;
set role authenticated;
select pg_temp.check_behavior();
reset role;
select 'PASS rollback: exact table/default ACL baseline restored; policies, RLS and functions unchanged' as result;
