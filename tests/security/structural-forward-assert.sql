do $$ declare t record; r text; p text; begin
  for t in select name from scope loop
    foreach r in array array['anon','authenticated'] loop
      foreach p in array array['TRUNCATE','REFERENCES','TRIGGER','MAINTAIN'] loop
        if has_table_privilege(r, 'public.' || t.name, p) then
          raise exception 'Structural privilege remains: % % %', r,t.name,p;
        end if;
      end loop;
    end loop;
  end loop;
  if exists (
    (select * from before_acl where privilege_type in ('SELECT','INSERT','UPDATE','DELETE') except select * from table_acl)
    union all
    (select * from table_acl where privilege_type in ('SELECT','INSERT','UPDATE','DELETE') except select * from before_acl)
  ) then raise exception 'DML ACL changed'; end if;
  if exists (
    (select * from before_acl where oid not in (select to_regclass('public.'||name) from scope) or grantee not in ('anon'::regrole,'authenticated'::regrole) except select * from table_acl)
    union all
    (select * from table_acl where oid not in (select to_regclass('public.'||name) from scope) or grantee not in ('anon'::regrole,'authenticated'::regrole) except select * from before_acl)
  ) then raise exception 'Excluded table or role ACL changed'; end if;
  if exists (
    (select * from before_defaults except select * from default_acl)
    except
    select * from before_defaults where defaclrole='postgres'::regrole and defaclnamespace='public'::regnamespace and defaclobjtype='r' and grantee in ('anon'::regrole,'authenticated'::regrole) and privilege_type in ('TRUNCATE','REFERENCES','TRIGGER','MAINTAIN')
  ) or exists (select * from default_acl except select * from before_defaults)
  then raise exception 'Unexpected default ACL change'; end if;
end $$;
create table public.future_probe(id integer);
do $$ declare r text; p text; begin
  foreach r in array array['anon','authenticated'] loop
    foreach p in array array['TRUNCATE','REFERENCES','TRIGGER','MAINTAIN'] loop
      if has_table_privilege(r,'public.future_probe',p) then raise exception 'Future table structural grant remains'; end if;
    end loop;
    foreach p in array array['SELECT','INSERT','UPDATE','DELETE'] loop
      if not has_table_privilege(r,'public.future_probe',p) then raise exception 'Future table DML lost'; end if;
    end loop;
  end loop;
end $$;
drop table public.future_probe;
set role authenticated;
select pg_temp.check_behavior();
do $$ begin
  begin
    truncate public.businesses;
    raise exception 'TRUNCATE unexpectedly allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'PASS forward: structural grants removed, DML/RLS preserved, future defaults constrained' as result;
