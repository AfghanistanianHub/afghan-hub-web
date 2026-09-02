-- Add covering indexes for foreign keys used by joins and cascading updates.

create index if not exists conversations_created_by_idx
  on public.conversations (created_by);

create index if not exists events_business_id_idx
  on public.events (business_id);

create index if not exists events_organization_id_idx
  on public.events (organization_id);

create index if not exists notifications_actor_id_idx
  on public.notifications (actor_id);

create index if not exists notifications_connection_id_idx
  on public.notifications (connection_id);

create index if not exists notifications_conversation_id_idx
  on public.notifications (conversation_id);

create index if not exists notifications_message_id_idx
  on public.notifications (message_id);
