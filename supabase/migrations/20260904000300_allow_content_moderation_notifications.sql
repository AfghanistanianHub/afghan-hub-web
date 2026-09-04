alter table public.notifications
  drop constraint if exists notifications_type_check;

alter table public.notifications
  add constraint notifications_type_check
  check (
    type in (
      'connection_request',
      'connection_accepted',
      'new_message',
      'content_approved',
      'content_rejected'
    )
  );

alter table public.notifications
  drop constraint if exists notifications_target_check;

alter table public.notifications
  add constraint notifications_target_check
  check (
    (
      type in ('connection_request', 'connection_accepted')
      and connection_id is not null
      and conversation_id is null
      and message_id is null
      and content_id is null
      and content_type is null
    )
    or
    (
      type = 'new_message'
      and connection_id is null
      and conversation_id is not null
      and message_id is not null
      and content_id is null
      and content_type is null
    )
    or
    (
      type in ('content_approved', 'content_rejected')
      and connection_id is null
      and conversation_id is null
      and message_id is null
      and content_id is not null
      and content_type in ('opportunity', 'event')
      and content_slug is not null
      and content_title is not null
    )
  );
