-- Assertions that the paired rollback restores the captured secondary baseline.
do $$
declare
  t text;
  p text;
  profile_column_hash text;
begin
  foreach t in array array['businesses','events','opportunities','organizations','connections','conversation_members','conversations','messages','saved_opportunities'] loop
    foreach p in array array['SELECT','INSERT','UPDATE','DELETE'] loop
      if not has_table_privilege('anon', format('public.%I', t), p) then
        raise exception 'Phase B rollback assertion failed: anon missing % on %', p, t;
      end if;
      if not has_table_privilege('authenticated', format('public.%I', t), p) then
        raise exception 'Phase B rollback assertion failed: authenticated missing % on %', p, t;
      end if;
    end loop;
  end loop;

  foreach p in array array['SELECT','INSERT','UPDATE','DELETE'] loop
    if has_table_privilege('anon','public.event_rsvps',p)
       or has_table_privilege('anon','public.notifications',p) then
      raise exception 'Phase B rollback assertion failed: anon RSVP/notification grants changed';
    end if;
  end loop;

  if not has_table_privilege('authenticated','public.event_rsvps','SELECT')
     or not has_table_privilege('authenticated','public.event_rsvps','DELETE')
     or has_table_privilege('authenticated','public.event_rsvps','INSERT')
     or has_table_privilege('authenticated','public.event_rsvps','UPDATE') then
    raise exception 'Phase B rollback assertion failed: event_rsvps grants mismatch';
  end if;

  if not has_table_privilege('authenticated','public.notifications','SELECT')
     or has_table_privilege('authenticated','public.notifications','INSERT')
     or has_table_privilege('authenticated','public.notifications','UPDATE')
     or has_table_privilege('authenticated','public.notifications','DELETE') then
    raise exception 'Phase B rollback assertion failed: notifications grants mismatch';
  end if;

  if exists (
    select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='profiles' and grantee in ('anon','authenticated')
  ) then
    raise exception 'Phase B rollback assertion failed: profiles gained table-level grants';
  end if;

  select md5(coalesce(string_agg(grantee||':'||table_name||':'||column_name||':'||privilege_type,',' order by grantee,table_name,column_name,privilege_type),''))
    into profile_column_hash
  from information_schema.role_column_grants
  where table_schema='public' and table_name='profiles' and grantee in ('anon','authenticated');

  if profile_column_hash is distinct from 'e1c13bc50c5a10cbcdcfb66c5207fc53' then
    raise exception 'Phase B rollback assertion failed: profile column grants changed (%)', profile_column_hash;
  end if;
end $$;

select 'secondary_phase_b_rollback_assertions_passed' as result;
