# Messaging deployment and verification — 2026-08-30

## Production repair (already applied)

Project: Afghan Hub Production (`yussznmwjsvfvpabmwdc`).
The user confirmed that the local app points to this project.

Production lacked the four RPCs called by the current UI:
`get_message_inbox()`, `get_unread_message_counts()`,
`mark_conversation_read(uuid, uuid)`, and `start_direct_conversation(uuid)`.
The `conversation_members` table was also absent from Realtime publication.
Successful frontend builds did not detect these deployment omissions.

With explicit user approval, the existing repository SQL was applied in order:

1. `20260823000500_optimize_message_inbox.sql`
2. `20260825000100_precise_message_read_receipts.sql`
3. `20260825000200_sync_message_notifications.sql`
4. `20260823000600_enable_read_receipts_realtime.sql`
5. Explicitly revoke anonymous execution of the four RPCs.

Supabase recorded the combined operation as
`20260830024037_restore_missing_messaging_functions_and_read_receipts`.
The exact executed SQL is archived in [20260830024037_messaging_restore.sql](20260830024037_messaging_restore.sql).
This is an audit record, not a new migration to run. Do not replay it: its
intermediate CREATE FUNCTION assumes the previously missing RPC.
Production and repository migration histories still have different historical
entries. Reconcile a complete baseline separately before using an unreviewed
`supabase db push`; do not mark unrelated migrations as applied.

## Database checks completed

- All four expected signatures exist.
- Anonymous execution is denied; authenticated execution is allowed.
- Messages, conversation members, and notifications are in Realtime publication.
- RLS is enabled on the four messaging/notification tables.
- Transactional SQL assertions passed for the existing two memberships:
  unread counts against independent SQL, inbox membership isolation, read clearing,
  linked notification clearing, repeat-read idempotency, and direct conversation reuse.
- Unauthenticated calls returned no inbox/count data and could not mark reads.
- Test writes were rolled back; no test messages or read-state changes persisted.

Security advisors were also checked. They still report intentional authenticated
SECURITY DEFINER exposure and separate existing warnings for other functions,
extension placement, and password protection. This is not a whole-project
security certification.

## Client correction in this PR

The dashboard now subscribes directly to the current member's read-state updates.
Previously it depended on a notification UPDATE to refresh other tabs; a previously
read notification could therefore leave the message badge stale. Successful
subscription/reconnection also refreshes the current route.

Regression tests cover read updates without notification events, other-member
filtering, incoming messages, reconnect refreshes, and channel cleanup.
These use a mocked event transport, not a live browser/WebSocket.

The user previously verified notification-bell synchronization across two local
tabs. A browser check of the new message-badge correction remains after deployment:
mark notifications read first, then read an unread conversation in another tab.
The inbox and navigation message count should clear without manual refresh.
