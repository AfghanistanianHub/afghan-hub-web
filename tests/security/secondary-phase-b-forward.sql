-- Secondary-only Phase B least-privilege forward package.
-- Never apply this file to Afghan Hub Production.
begin;

-- Anonymous users retain SELECT only on published public catalogs.
revoke insert, update, delete on table
  public.businesses,
  public.events,
  public.opportunities,
  public.organizations
from anon;

-- Anonymous users need no direct access to member-private tables.
revoke select, insert, update, delete on table
  public.connections,
  public.conversation_members,
  public.conversations,
  public.event_rsvps,
  public.messages,
  public.notifications,
  public.saved_opportunities
from anon;

-- Authenticated direct table DML is reduced to the policy-backed/application paths.
-- connections: SELECT + DELETE; request/response state transitions are RPC-driven.
revoke insert, update on table public.connections from authenticated;

-- conversation_members: SELECT + DELETE; membership creation is RPC-driven.
revoke insert, update on table public.conversation_members from authenticated;

-- conversations: SELECT only; direct conversation creation is RPC-driven.
revoke insert, update, delete on table public.conversations from authenticated;

-- event_rsvps remains SELECT + DELETE; creation is RPC-driven. No change required.

-- messages: SELECT + INSERT; history mutation is not directly policy-backed.
revoke update, delete on table public.messages from authenticated;

-- notifications remains SELECT only; read state is RPC-driven. No change required.

-- saved_opportunities: SELECT + INSERT + DELETE; no UPDATE policy/path exists.
revoke update on table public.saved_opportunities from authenticated;

-- Profiles are deliberately excluded: privacy-sensitive column grants are owned by #67.
commit;
