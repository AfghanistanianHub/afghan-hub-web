-- Assertions for the secondary Phase B least-privilege target state.
do $$
declare
  t text;
  p text;
  profile_column_hash text;
begin
  foreach t in array array['businesses','events','opportunities','organizations'] loop
    if not has_table_privilege('anon', format('public.%I', t), 'SELECT') then
      raise exception 'Phase B assertion failed: anon SELECT missing on %', t;
    end if;
    foreach p in array array['INSERT','UPDATE','DELETE'] loop
      if has_table_privilege('anon', format('public.%I', t), p) then
        raise exception 'Phase B assertion failed: anon still has % on %', p, t;
      end if;
    end loop;
    foreach p in array array['SELECT','INSERT','UPDATE','DELETE'] loop
      if not has_table_privilege('authenticated', format('public.%I', t), p) then
        raise exception 'Phase B assertion failed: authenticated lost % on %', p, t;
      end if;
    end loop;
  end loop;

  foreach t in array array['connections','conversation_members','conversations','event_rsvps','messages','notifications','saved_opportunities'] loop
    foreach p in array array['SELECT','INSERT','UPDATE','DELETE'] loop
      if has_table_privilege('anon', format('public.%I', t), p) then
        raise exception 'Phase B assertion failed: anon still has % on %', p, t;
      end if;
    end loop;
  end loop;

  -- authenticated: connections = SELECT, DELETE
  if not has_table_privilege('authenticated','public.connections','SELECT')
     or not has_table_privilege('authenticated','public.connections','DELETE')
     or has_table_privilege('authenticated','public.connections','INSERT')
     or has_table_privilege('authenticated','public.connections','UPDATE') then
    raise exception 'Phase B assertion failed: connections grants mismatch';
  end if;

  -- authenticated: conversation_members = SELECT, DELETE
  if not has_table_privilege('authenticated','public.conversation_members','SELECT')
     or not has_table_privilege('authenticated','public.conversation_members','DELETE')
     or has_table_privilege('authenticated','public.conversation_members','INSERT')
     or has_table_privilege('authenticated','public.conversation_members','UPDATE') then
    raise exception 'Phase B assertion failed: conversation_members grants mismatch';
  end if;

  -- authenticated: conversations = SELECT only
  if not has_table_privilege('authenticated','public.conversations','SELECT')
     or has_table_privilege('authenticated','public.conversations','INSERT')
     or has_table_privilege('authenticated','public.conversations','UPDATE')
     or has_table_privilege('authenticated','public.conversations','DELETE') then
    raise exception 'Phase B assertion failed: conversations grants mismatch';
  end if;

  -- authenticated: event_rsvps = SELECT, DELETE
  if not has_table_privilege('authenticated','public.event_rsvps','SELECT')
     or not has_table_privilege('authenticated','public.event_rsvps','DELETE')
     or has_table_privilege('authenticated','public.event_rsvps','INSERT')
     or has_table_privilege('authenticated','public.event_rsvps','UPDATE') then
    raise exception 'Phase B assertion failed: event_rsvps grants mismatch';
  end if;

  -- authenticated: messages = SELECT, INSERT
  if not has_table_privilege('authenticated','public.messages','SELECT')
     or not has_table_privilege('authenticated','public.messages','INSERT')
     or has_table_privilege('authenticated','public.messages','UPDATE')
     or has_table_privilege('authenticated','public.messages','DELETE') then
    raise exception 'Phase B assertion failed: messages grants mismatch';
  end if;

  -- authenticated: notifications = SELECT only
  if not has_table_privilege('authenticated','public.notifications','SELECT')
     or has_table_privilege('authenticated','public.notifications','INSERT')
     or has_table_privilege('authenticated','public.notifications','UPDATE')
     or has_table_privilege('authenticated','public.notifications','DELETE') then
    raise exception 'Phase B assertion failed: notifications grants mismatch';
  end if;

  -- authenticated: saved_opportunities = SELECT, INSERT, DELETE
  if not has_table_privilege('authenticated','public.saved_opportunities','SELECT')
     or not has_table_privilege('authenticated','public.saved_opportunities','INSERT')
     or not has_table_privilege('authenticated','public.saved_opportunities','DELETE')
     or has_table_privilege('authenticated','public.saved_opportunities','UPDATE') then
    raise exception 'Phase B assertion failed: saved_opportunities grants mismatch';
  end if;

  if exists (
    select 1 from information_schema.role_table_grants
    where table_schema='public' and table_name='profiles' and grantee in ('anon','authenticated')
  ) then
    raise exception 'Phase B assertion failed: profiles gained table-level grants';
  end if;

  select md5(coalesce(string_agg(grantee||':'||table_name||':'||column_name||':'||privilege_type,',' order by grantee,table_name,column_name,privilege_type),''))
    into profile_column_hash
  from information_schema.role_column_grants
  where table_schema='public' and table_name='profiles' and grantee in ('anon','authenticated');

  if profile_column_hash is distinct from 'e1c13bc50c5a10cbcdcfb66c5207fc53' then
    raise exception 'Phase B assertion failed: profile column grants changed (%)', profile_column_hash;
  end if;
end $$;

select 'secondary_phase_b_forward_assertions_passed' as result;
