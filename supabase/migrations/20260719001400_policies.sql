-- PROFILES
create policy profiles_select_public_or_owner
on public.profiles for select
to anon, authenticated
using (is_public = true or id = (select auth.uid()) or public.is_admin());

create policy profiles_insert_self
on public.profiles for insert
to authenticated
with check (id = (select auth.uid()));

create policy profiles_update_self
on public.profiles for update
to authenticated
using (id = (select auth.uid()) or public.is_admin())
with check (id = (select auth.uid()) or public.is_admin());

-- BUSINESSES
create policy businesses_select_published_or_owner
on public.businesses for select
to anon, authenticated
using (status = 'published' or owner_id = (select auth.uid()) or public.is_admin());

create policy businesses_insert_owner
on public.businesses for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy businesses_update_owner
on public.businesses for update
to authenticated
using (owner_id = (select auth.uid()) or public.is_admin())
with check (owner_id = (select auth.uid()) or public.is_admin());

create policy businesses_delete_owner
on public.businesses for delete
to authenticated
using (owner_id = (select auth.uid()) or public.is_admin());

-- ORGANIZATIONS
create policy organizations_select_published_or_owner
on public.organizations for select
to anon, authenticated
using (status = 'published' or owner_id = (select auth.uid()) or public.is_admin());

create policy organizations_insert_owner
on public.organizations for insert
to authenticated
with check (owner_id = (select auth.uid()));

create policy organizations_update_owner
on public.organizations for update
to authenticated
using (owner_id = (select auth.uid()) or public.is_admin())
with check (owner_id = (select auth.uid()) or public.is_admin());

create policy organizations_delete_owner
on public.organizations for delete
to authenticated
using (owner_id = (select auth.uid()) or public.is_admin());

-- OPPORTUNITIES
create policy opportunities_select_published_or_author
on public.opportunities for select
to anon, authenticated
using (status = 'published' or author_id = (select auth.uid()) or public.is_admin());

create policy opportunities_insert_author
on public.opportunities for insert
to authenticated
with check (author_id = (select auth.uid()));

create policy opportunities_update_author
on public.opportunities for update
to authenticated
using (author_id = (select auth.uid()) or public.is_admin())
with check (author_id = (select auth.uid()) or public.is_admin());

create policy opportunities_delete_author
on public.opportunities for delete
to authenticated
using (author_id = (select auth.uid()) or public.is_admin());

-- SAVED OPPORTUNITIES
create policy saved_opportunities_select_self
on public.saved_opportunities for select
to authenticated
using (profile_id = (select auth.uid()));

create policy saved_opportunities_insert_self
on public.saved_opportunities for insert
to authenticated
with check (profile_id = (select auth.uid()));

create policy saved_opportunities_delete_self
on public.saved_opportunities for delete
to authenticated
using (profile_id = (select auth.uid()));

-- EVENTS
create policy events_select_published_or_creator
on public.events for select
to anon, authenticated
using (status = 'published' or creator_id = (select auth.uid()) or public.is_admin());

create policy events_insert_creator
on public.events for insert
to authenticated
with check (creator_id = (select auth.uid()));

create policy events_update_creator
on public.events for update
to authenticated
using (creator_id = (select auth.uid()) or public.is_admin())
with check (creator_id = (select auth.uid()) or public.is_admin());

create policy events_delete_creator
on public.events for delete
to authenticated
using (creator_id = (select auth.uid()) or public.is_admin());

-- CONVERSATIONS
create policy conversations_select_member
on public.conversations for select
to authenticated
using (public.is_conversation_member(id));

create policy conversations_insert_creator
on public.conversations for insert
to authenticated
with check (created_by = (select auth.uid()));

create policy conversations_update_member
on public.conversations for update
to authenticated
using (public.is_conversation_member(id))
with check (public.is_conversation_member(id));

-- CONVERSATION MEMBERS
create policy conversation_members_select_member
on public.conversation_members for select
to authenticated
using (public.is_conversation_member(conversation_id));

create policy conversation_members_insert_creator_or_self
on public.conversation_members for insert
to authenticated
with check (
  profile_id = (select auth.uid())
  or exists (
    select 1
    from public.conversations c
    where c.id = conversation_id
      and c.created_by = (select auth.uid())
  )
);

create policy conversation_members_update_self
on public.conversation_members for update
to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy conversation_members_delete_self
on public.conversation_members for delete
to authenticated
using (profile_id = (select auth.uid()));

-- MESSAGES
create policy messages_select_member
on public.messages for select
to authenticated
using (public.is_conversation_member(conversation_id));

create policy messages_insert_member
on public.messages for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and public.is_conversation_member(conversation_id)
);

create policy messages_update_sender
on public.messages for update
to authenticated
using (sender_id = (select auth.uid()))
with check (sender_id = (select auth.uid()));

create policy messages_delete_sender
on public.messages for delete
to authenticated
using (sender_id = (select auth.uid()));

-- CONNECTIONS
create policy connections_select_participant
on public.connections for select
to authenticated
using (
  requester_id = (select auth.uid())
  or recipient_id = (select auth.uid())
  or public.is_admin()
);

create policy connections_insert_requester
on public.connections for insert
to authenticated
with check (
  requester_id = (select auth.uid())
  and requester_id <> recipient_id
);

create policy connections_update_participant
on public.connections for update
to authenticated
using (
  requester_id = (select auth.uid())
  or recipient_id = (select auth.uid())
  or public.is_admin()
)
with check (
  requester_id = (select auth.uid())
  or recipient_id = (select auth.uid())
  or public.is_admin()
);

create policy connections_delete_participant
on public.connections for delete
to authenticated
using (
  requester_id = (select auth.uid())
  or recipient_id = (select auth.uid())
  or public.is_admin()
);
