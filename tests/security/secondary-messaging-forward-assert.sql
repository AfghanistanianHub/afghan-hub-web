DO $$
DECLARE missing integer;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='conversations' AND column_name='created_by' AND is_nullable='NO') THEN
    RAISE EXCEPTION 'messaging forward assertion failed: conversations.created_by missing/not-null mismatch';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typname='connection_status') THEN
    RAISE EXCEPTION 'messaging forward assertion failed: connection_status enum missing';
  END IF;

  SELECT count(*) INTO missing FROM (VALUES
    ('send_connection_request','uuid'),('respond_connection_request','uuid, text'),('start_direct_conversation','uuid'),
    ('get_message_inbox',''),('get_unread_message_counts',''),('mark_conversation_read','uuid, uuid'),
    ('mark_all_notifications_read',''),('mark_notification_read','uuid'),('is_conversation_member','uuid')
  ) r(name,args)
  WHERE to_regprocedure('public.'||r.name||'('||r.args||')') IS NULL;
  IF missing<>0 THEN RAISE EXCEPTION 'messaging forward assertion failed: RPC missing'; END IF;

  SELECT count(*) INTO missing FROM (VALUES
    ('connections','connections_select_participant'),('connections','connections_delete_participant'),
    ('conversation_members','conversation_members_select_member'),('conversation_members','conversation_members_delete_self'),
    ('conversations','conversations_select_member'),('messages','messages_select_member'),('messages','messages_insert_member'),
    ('saved_opportunities','saved_opportunities_select_self'),('saved_opportunities','saved_opportunities_insert_self'),('saved_opportunities','saved_opportunities_delete_self')
  ) r(tab,pol)
  WHERE NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=r.tab AND p.policyname=r.pol);
  IF missing<>0 THEN RAISE EXCEPTION 'messaging forward assertion failed: policy missing'; END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='connections' AND t.tgname='connections_create_request_notification' AND NOT t.tgisinternal)
     OR NOT EXISTS (SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='connections' AND t.tgname='connections_create_accepted_notification' AND NOT t.tgisinternal)
     OR NOT EXISTS (SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='messages' AND t.tgname='messages_create_notifications' AND NOT t.tgisinternal) THEN
    RAISE EXCEPTION 'messaging forward assertion failed: notification trigger missing';
  END IF;

  IF has_function_privilege('anon','public.send_connection_request(uuid)','EXECUTE')
     OR has_function_privilege('anon','public.start_direct_conversation(uuid)','EXECUTE')
     OR has_function_privilege('anon','public.is_conversation_member(uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'messaging forward assertion failed: anon can execute messaging RPC/helper';
  END IF;
END $$;

SELECT 'secondary_messaging_forward_assertions_passed' AS result;
