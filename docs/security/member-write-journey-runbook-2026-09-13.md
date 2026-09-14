# Controlled member write journey — 2026-09-13

Related: #120, #139, #140, #141.

This harness covers the relationship/messaging/notification subset of final launch acceptance using **designated disposable Member A/B accounts only**. It uses the publishable Supabase key and never uses service-role credentials.

## Modes

`node scripts/member-journey-acceptance.mjs` defaults to `plan` mode. Plan mode signs in the two designated members, verifies both are confirmed/onboarding-complete ordinary members, and refuses to continue if they already share connection state. It performs no application-data writes.

Write mode requires:

```text
JOURNEY_ACCEPTANCE_MODE=write
JOURNEY_ACCEPTANCE_ALLOW_WRITES=I_UNDERSTAND_THIS_CREATES_DISPOSABLE_PRODUCTION_FIXTURES
```

Production additionally requires both:

```text
AUTH_ACCEPTANCE_ALLOW_PRODUCTION=I_UNDERSTAND_THESE_ARE_DISPOSABLE_TEST_ACCOUNTS
JOURNEY_ACCEPTANCE_CLEANUP_ACK=I_WILL_CLEAN_UP_EXACT_CAPTURED_FIXTURE_IDS
```

If any acknowledgement is absent or differs, the script stops before writes.

## Write acceptance sequence

The guarded write run verifies:

1. Member A sends a connection request to Member B.
2. The request notification is visible to B and not A.
3. A cannot accept its own outgoing request through `respond_connection_request`.
4. B can accept the pending request.
5. The accepted notification is visible to A.
6. `start_direct_conversation` resolves the accepted pair to one conversation from either direction.
7. A inserts one uniquely marked disposable message.
8. B can read that message as a conversation member.
9. The new-message notification is visible only to B.
10. B's unread count rises, then returns to zero after `mark_conversation_read`.
11. The corresponding notification receives `read_at`.

Production trigger metadata was verified read-only before this harness was authored: connection insert creates `connection_request`, pending→accepted creates `connection_accepted`, and message insert creates `new_message` notifications for other conversation members.

## Cleanup is part of the acceptance run

Ordinary member grants intentionally do not permit complete conversation/message deletion. Therefore the script does **not** pretend to self-clean using widened member privileges.

After a successful write run, it writes two mode-0600 files to the operating system temp directory:

- a JSON manifest containing only the exact disposable fixture IDs;
- assertion-guarded SQL that removes only those identified notifications, message, conversation memberships, conversation, and connection.

Before deleting anything, the generated SQL verifies all of these exact fixture properties:

- one A→B connection with the captured connection ID;
- one conversation created by Member A with the captured conversation ID;
- exactly one message in that conversation, matching the captured message ID and Member A sender;
- exactly two conversation memberships, belonging to Member A and Member B;
- exactly the three captured notification IDs (request, accepted, new message).

Cleanup deletes only those exact three notification IDs; it does not delete arbitrary notifications merely because they share a conversation ID. If any identity or cardinality differs, cleanup aborts before destructive statements run.

The operator must review the generated IDs and SQL before running cleanup with an authorized database operator context. Never paste credentials, tokens, or unrelated member data into the manifest or issue tracker.

## Completion rule

A production write journey is not complete merely because the script prints PASS. It is complete only after:

- the generated cleanup SQL has been reviewed and applied to the exact disposable fixture IDs;
- a read-only query verifies the captured connection/conversation/message/notifications no longer exist;
- no unrelated rows were touched.

Content-owner/moderation and RSVP acceptance remain outside this harness and must be handled separately under #120.
