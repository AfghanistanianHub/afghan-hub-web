-- Disposable PostgreSQL fixture. Does not reproduce the full Supabase schema.
do $$
begin
  if current_database() <> 'ah_security_fixture' or current_user <> 'postgres'
     or current_setting('server_version_num')::int / 10000 <> 17
     or exists (select 1 from pg_tables where schemaname = 'public')
     or exists (select 1 from pg_roles where rolname in ('anon','authenticated','service_role','supabase_admin'))
  then raise exception 'Requires a fresh isolated PostgreSQL 17 fixture'; end if;
end $$;

create role anon;
create role authenticated;
create role service_role;
create role supabase_admin;
grant usage on schema public to anon, authenticated;
create schema storage;
alter default privileges for role postgres in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges for role postgres in schema storage grant all on tables to anon, authenticated, service_role;
alter default privileges for role supabase_admin in schema public grant all on tables to anon, authenticated, service_role;

create temp table scope(name text primary key);
insert into scope values ('businesses'),('connections'),('conversation_members'),('conversations'),('event_rsvps'),('events'),('messages'),('notifications'),('opportunities'),('organizations'),('profiles'),('saved_opportunities');
do $$ declare t record; begin
  for t in select name from scope loop
    execute format('create table public.%I(id integer primary key, owner_name text, value text)', t.name);
    execute format('alter table public.%I enable row level security', t.name);
    execute format('create policy own_rows on public.%I to authenticated using (owner_name = current_user) with check (owner_name = current_user)', t.name);
  end loop;
end $$;
-- Snapshot exceptions and heterogeneous DML protect against blanket rollback.
revoke all on public.notifications from anon, authenticated;
grant select on public.notifications to authenticated;
revoke all on public.event_rsvps from anon;
revoke insert, update, delete on public.connections, public.conversations, public.conversation_members from authenticated;
create table public.excluded_table(id integer);
create table storage.excluded_table(id integer);
create function public.fixture_function() returns integer language sql as 'select 1';
grant execute on function public.fixture_function() to authenticated;

create temp view table_acl as
select c.oid, a.grantor, a.grantee, a.privilege_type, a.is_grantable
from pg_class c cross join lateral aclexplode(c.relacl) a
where c.relnamespace in ('public'::regnamespace, 'storage'::regnamespace) and c.relkind='r';
create temp table before_acl as table table_acl;
create temp view default_acl as
select d.defaclrole, d.defaclnamespace, d.defaclobjtype, a.*
from pg_default_acl d cross join lateral aclexplode(d.defaclacl) a;
create temp table before_defaults as table default_acl;
create temp table before_policies as select row_to_json(p)::jsonb as definition from pg_policy p;
create temp table before_rls as select oid, relrowsecurity, relforcerowsecurity from pg_class where oid in (select oid from before_acl);
create temp table before_functions as select oid, proacl, proconfig, prosrc from pg_proc where pronamespace='public'::regnamespace;

-- Exercise RLS and DML with synthetic data before and after forward.
insert into public.businesses values (1,'authenticated','owned'),(2,'another_member','hidden');
create function pg_temp.check_behavior() returns void language plpgsql as $$
begin
  if (select count(*) from public.businesses) <> 1 then raise exception 'RLS visibility changed'; end if;
  insert into public.businesses values (3,'authenticated','created');
  update public.businesses set value='edited' where id=3;
  if not found then raise exception 'Owner update failed'; end if;
  delete from public.businesses where id=3;
  begin
    insert into public.businesses values (4,'another_member','forbidden');
    raise exception 'RLS accepted another owner';
  exception when insufficient_privilege then null; end;
end $$;
do $$ begin
  execute format('grant usage on schema %I to authenticated', (select nspname from pg_namespace where oid=pg_my_temp_schema()));
end $$;
set role authenticated;
select pg_temp.check_behavior();
reset role;
