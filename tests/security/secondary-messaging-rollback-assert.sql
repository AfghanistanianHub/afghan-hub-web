DO $$
DECLARE remaining integer;
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='conversations' AND column_name='created_by'
  ) THEN RAISE EXCEPTION 'messaging rollback assertion failed: conversations.created_by remains'; END IF;

  IF EXISTS (
    SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace
    WHERE n.nspname='public' AND t.typname='connection_status'
  ) THEN RAISE EXCEPTION 'messaging rollback assertion failed: connection_status enum remains'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='connections' AND column_name='status' AND udt_name='text'
  ) THEN RAISE EXCEPTION 'messaging rollback assertion failed: connections.status not restored to text'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='public.connections'::regclass AND conname='connections_valid_status'
  ) THEN RAISE EXCEPTION 'messaging rollback assertion failed: connections_valid_status not restored'; END IF;

  SELECT count(*) INTO remaining
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname IN (
    'send_connection_request','respond_connection_request','start_direct_conversation',
    'get_message_inbox','get_unread_message_counts','mark_conversation_read',
    'mark_all_notifications_read','mark_notification_read','is_conversation_member',
    'create_connection_request_notification','create_connection_accepted_notification','create_new_message_notifications'
  );
  IF remaining<>0 THEN RAISE EXCEPTION 'messaging rollback assertion failed: introduced function remains'; END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename IN ('connections','conversation_members','conversations','messages','saved_opportunities')
  ) THEN RAISE EXCEPTION 'messaging rollback assertion failed: messaging policy remains'; END IF;

  IF EXISTS (
    SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND NOT t.tgisinternal AND t.tgname IN (
      'connections_create_request_notification','connections_create_accepted_notification','messages_create_notifications'
    )
  ) THEN RAISE EXCEPTION 'messaging rollback assertion failed: notification trigger remains'; END IF;

  IF to_regclass('public.notifications') IS NULL OR to_regclass('public.event_rsvps') IS NULL THEN
    RAISE EXCEPTION 'messaging rollback assertion failed: previous role/RSVP refresh was damaged';
  END IF;

  IF to_regprocedure('public.moderate_event(uuid,text,text)') IS NULL
     OR to_regprocedure('public.set_profile_role(uuid,public.user_role)') IS NULL
     OR to_regprocedure('public.rsvp_to_event(uuid)') IS NULL THEN
    RAISE EXCEPTION 'messaging rollback assertion failed: role/RSVP RPC missing';
  END IF;
END $$;

SELECT 'secondary_messaging_rollback_assertions_passed' AS result;
