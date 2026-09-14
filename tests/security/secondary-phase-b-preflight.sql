-- Secondary-only Phase B direct-DML preflight. Assertion-only; no writes.
do $$
declare
  t text;
  p text;
  profile_column_hash text;
begin
  -- Public catalogs currently have broad DML for both roles; Phase B will narrow anon only.
  foreach t in array array['businesses','events','opportunities','organizations'] loop
    foreach p in array array['SELECT','INSERT','UPDATE','DELETE'] loop
      if not has_table_privilege('anon', format('public.%I', t), p) then
        raise exception 'secondary Phase B baseline mismatch: anon missing % on %', p, t;
      end if;
      if not has_table_privilege('authenticated', format('public.%I', t), p) then
        raise exception 'secondary Phase B baseline mismatch: authenticated missing % on %', p, t;
      end if;
    end loop;
  end loop;

  -- These member-private tables are still broad on the refreshed secondary baseline.
  foreach t in array array['connections','conversation_members','conversations','messages','saved_opportunities'] loop
    foreach p in array array['SELECT','INSERT','UPDATE','DELETE'] loop
      if not has_table_privilege('anon', format('public.%I', t), p) then
        raise exception 'secondary Phase B baseline mismatch: anon missing % on %', p, t;
      end if;
      if not has_table_privilege('authenticated', format('public.%I', t), p) then
        raise exception 'secondary Phase B baseline mismatch: authenticated missing % on %', p, t;
      end if;
    end loop;
  end loop;

  -- RSVP and notifications were already created with narrow grants.
  foreach p in array array['SELECT','INSERT','UPDATE','DELETE'] loop
    if has_table_privilege('anon','public.event_rsvps',p)
       or has_table_privilege('anon','public.notifications',p) then
      raise exception 'secondary Phase B baseline mismatch: anon unexpectedly has % on RSVP/notifications', p;
    end if;
  end loop;

  if not has_table_privilege('authenticated','public.event_rsvps','SELECT')
     or not has_table_privilege('authenticated','public.event_rsvps','DELETE')
     or has_table_privilege('authenticated','public.event_rsvps','INSERT')
     or has_table_privilege('authenticated','public.event_rsvps','UPDATE') then
    raise exception 'secondary Phase B baseline mismatch: event_rsvps authenticated grants drifted';
  end if;

  if not has_table_privilege('authenticated','public.notifications','SELECT')
     or has_table_privilege('authenticated','public.notifications','INSERT')
     or has_table_privilege('authenticated','public.notifications','UPDATE')
     or has_table_privilege('authenticated','public.notifications','DELETE') then
    raise exception 'secondary Phase B baseline mismatch: notifications authenticated grants drifted';
  end if;

  if exists (
    select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='profiles' and grantee in ('anon','authenticated')
  ) then
    raise exception 'secondary Phase B baseline mismatch: profiles gained table-level grants';
  end if;

  select md5(coalesce(string_agg(grantee||':'||table_name||':'||column_name||':'||privilege_type,',' order by grantee,table_name,column_name,privilege_type),''))
    into profile_column_hash
  from information_schema.role_column_grants
  where table_schema='public' and table_name='profiles' and grantee in ('anon','authenticated');

  if profile_column_hash is distinct from 'e1c13bc50c5a10cbcdcfb66c5207fc53' then
    raise exception 'secondary Phase B baseline mismatch: profile column grants changed (%)', profile_column_hash;
  end if;
end $$;

select 'secondary_phase_b_preflight_passed' as result;
