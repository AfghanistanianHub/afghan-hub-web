# Afghan Hub — account deletion operations

## Status

This document records the current **technical** deletion dependencies and safe operator sequence. It does not set retention periods, deletion SLAs, or jurisdiction-specific legal terms. Those remain deliberate policy decisions under #132.

No production account should be deleted merely because this document exists. A production deletion requires a verified request, exact target identity, disposable-target rehearsal, scoped authorization, and post-delete verification.

## Live production dependency map — 2026-09-14

Read-only PostgreSQL metadata shows the following relationships from `public.profiles(id)`.

### Cascading member data

Deleting a profile currently cascades to rows that reference the member as owner, creator, participant, sender, recipient, or saver, including:

- `businesses.owner_id`
- `organizations.owner_id`
- `events.creator_id`
- `opportunities.author_id`
- `connections.requester_id`
- `connections.recipient_id`
- `conversation_members.profile_id`
- `conversations.created_by`
- `messages.sender_id`
- `notifications.recipient_id`
- `event_rsvps.profile_id`
- `saved_opportunities.profile_id`

Cascades can continue through dependent rows. For example, deleting a conversation cascades its conversation members, messages, and conversation-linked notifications; deleting a message cascades message-linked notifications.

### References preserved with `SET NULL`

Moderation/audit attribution and some listing relationships use `SET NULL`, including `moderated_by` references. Those rows can survive while the deleted moderator reference is removed.

## Auth identity is not automatically coupled to profile deletion

`auth.users` has the `on_auth_user_created` **AFTER INSERT** trigger that calls `handle_new_user()`. There is no matching account-delete trigger that automatically cleans `public.profiles` or Storage objects.

Do not assume deleting an Auth user and deleting a profile are equivalent operations.

## Storage is a separate cleanup boundary

Afghan Hub currently uses these ownership conventions:

- `avatars`: first path segment is the profile/user UUID;
- `business-media`: first path segment is the business UUID;
- `organization-media`: first path segment is the organization UUID.

Storage policies use those path conventions plus application-table ownership checks. There are no foreign keys from Storage objects to `profiles`, `businesses`, or `organizations` that would automatically delete object bytes when an application row disappears.

Therefore **Storage cleanup must happen before the owning profile/listing row is deleted**. Deleting the application row first can remove the ownership context needed by ordinary RLS-based cleanup and can leave orphaned objects.

Production aggregate metadata on 2026-09-14 confirmed these buckets are not purely theoretical: there was at least one avatar object and at least one organization-media object.

## Safe deletion sequence

The operator sequence for a future verified account-deletion workflow is:

1. **Verify the request.** Confirm control of the authenticated account or complete an approved identity-verification process. Never accept a target UUID supplied only in free-form support text.
2. **Freeze the exact target.** Record the Auth user UUID/profile UUID and an immutable request reference. Do not search by display name at deletion time.
3. **Inventory owned application data.** Count owned businesses, organizations, events, opportunities, connections, conversations/messages, saves, RSVPs, notifications, and any other profile-linked records. Avoid copying unrelated private content into logs.
4. **Inventory Storage by exact prefixes.** Enumerate only the target avatar prefix and media prefixes for businesses/organizations proven to be owned by the target.
5. **Delete Storage objects first.** Remove exact inventoried objects while ownership context still exists. Verify those exact prefixes are empty.
6. **Delete application/profile data through one reviewed path.** Use an assertion-guarded transaction or reviewed server-side procedure. It must target one verified UUID and fail closed on unexpected cardinality/dependency drift.
7. **Delete the Auth identity last.** Only after application and Storage cleanup succeeds should the corresponding `auth.users` identity be removed through the supported admin Auth path.
8. **Post-delete verification.** Verify the Auth user/profile no longer exists, exact owned Storage prefixes are empty, and no unexpected orphan rows remain.
9. **Record minimal evidence.** Keep request reference, timestamps, target UUID hash/reference, operation result, and exceptions. Do not retain message bodies, private profile fields, tokens, or credentials as deletion evidence.

If any stage fails, stop. Do not continue to Auth-user deletion after incomplete Storage/application cleanup.

## Shared-content caution

The current schema uses aggressive cascades for conversations/messages and creator-owned listings. A profile deletion may therefore remove content visible to other members, not merely hide the deleting member's identity. That is a product/policy decision, not something to silently encode as a self-service feature.

Before self-service deletion is implemented, #132 must explicitly decide whether shared conversations, contributed content, moderation evidence, and public listings should be deleted, anonymized, transferred, or preserved under a defined rule.

## Current guardrail

Until a disposable-persona deletion rehearsal proves the complete lifecycle:

- keep account deletion as a verified support workflow;
- do not expose a self-service destructive endpoint;
- do not call Supabase Admin `deleteUser` directly from a member-facing route/action;
- do not delete production profiles manually as a shortcut;
- do not promise a deletion completion time or retention period that operations cannot yet support.

## Required rehearsal before production use

Use only explicitly disposable identities on an isolated/non-production target. A valid rehearsal must include an avatar and listing media, owned content, at least one relationship/message path, RSVP/save/notification state, and exact before/after counts. The rehearsal must prove Storage cleanup, application cascades, Auth deletion order, deny paths, and idempotent/fail-closed retry behavior.
