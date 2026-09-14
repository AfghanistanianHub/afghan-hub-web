# Afghan Hub — privacy request operations

## Status

This is an operational runbook for handling information, correction, export, and deletion requests through the current support workflow. It does **not** establish a retention period, legal response deadline, deletion SLA, or governing jurisdiction.

Public Privacy and Support copy intentionally disclose that fixed response/completion times have not been published. Do not make stronger promises in support replies than the product can operationally satisfy.

## Request types

Classify each request as one or more of:

- information/privacy question;
- profile/account correction;
- current account/profile JSON export support;
- broader export request;
- account deletion request;
- abuse/safety report with privacy implications;
- other privacy request requiring operator review.

Do not turn a vague support message into a destructive deletion instruction. Clarify scope first.

## Minimal case record

Keep a minimal operational record with:

- case reference;
- received timestamp;
- request type(s);
- requester account email or authenticated account UUID when available;
- verification state: `unverified`, `verified`, or `needs_review`;
- requested scope in short neutral terms;
- actions taken and timestamps;
- exception/escalation note if needed;
- closure state and closure timestamp.

Do **not** copy message bodies, private profile fields, passwords, session tokens, recovery/confirmation links, authentication cookies, database credentials, or unrelated identity documents into the case record.

## Verification

### Preferred path

Use the signed-in account and/or a message from the account email when practical. The target account must be resolved from trusted account context, not from a UUID supplied only in free-form support text.

### Do not request ordinary secrets

Never ask a member to email:

- their password;
- a password-reset or confirmation link;
- session cookies/tokens;
- API keys;
- recovery codes.

Do not request government identity documents by ordinary email merely as a default verification step. If a future policy requires stronger identity verification, it needs a defined secure collection/storage/deletion procedure first.

If account control cannot be verified safely, mark the case `needs_review` and do not perform destructive actions.

## Information and correction requests

For ordinary account/profile corrections, prefer existing authenticated Settings/Profile controls. Support should not directly edit private data merely because a message names an account.

If a correction cannot be performed through existing controls, verify the target account and record the exact field/scope requiring operator intervention. Any production mutation still needs the applicable authorization and evidence path.

## Export requests

### Current self-service scope

The existing Settings export returns only:

- account ID, email, creation timestamp;
- explicit safe profile fields.

It intentionally excludes conversations, messages, connections, listings, saved opportunities, RSVPs, and uploaded file contents.

### Broader export

Do not simply dump every row connected to the member. Shared conversations/messages and collaborative records contain information about other members. A broader export needs an explicit scope and redaction/third-party-data rule before implementation or manual delivery.

Never send database dumps, service-role output, session objects, password hashes, internal authorization metadata, or unrelated members' private fields as an export.

If an export file is manually generated in the future, use a private, short-lived delivery method rather than a public link or repository attachment, and record only minimal delivery evidence.

## Account deletion requests

Deletion requests must follow `docs/privacy/account-deletion-operations.md`.

Key ordering is mandatory:

1. verify the request and exact target;
2. inventory target-owned application and Storage objects;
3. delete exact Storage objects first while ownership context exists;
4. perform guarded application/profile cleanup;
5. delete the Auth identity last;
6. verify exact target cleanup and exceptions.

Until a disposable-persona rehearsal proves this lifecycle, account deletion remains a verified-support workflow and no self-service destructive endpoint should be exposed.

## Abuse/safety reports

Collect the minimum evidence needed to identify the reported listing/profile/event or relevant interaction. Ask reporters to redact unrelated personal information and private messages where possible.

Do not promise a specific evidence-retention period until #132 defines one. Do not delete potentially relevant evidence solely because a related account deletion request exists without first applying the future abuse/safety retention policy.

## Response language

It is acceptable to acknowledge receipt, clarify scope, explain current self-service options, or say that a request requires review.

Do not promise:

- immediate deletion;
- deletion within a fixed number of hours/days;
- a fixed support response time;
- a retention cutoff that is not yet operationally defined;
- a jurisdiction-specific legal entitlement unless it has been deliberately confirmed.

## Closure

Before closing a case, record:

- what scope was verified;
- what action was completed or why no action was taken;
- any remaining exception or policy dependency;
- closure timestamp.

Do not paste private payloads into closure notes. For destructive requests, retain only the minimal operation evidence defined by the deletion runbook.

## Escalation conditions

Stop and escalate for operator/legal/product review when:

- identity/account control cannot be safely verified;
- the request seeks another person's data;
- broader export would expose third-party information;
- deletion would remove shared conversations/content and the preservation rule is unresolved;
- abuse/safety evidence may conflict with deletion;
- a request asks for a legal deadline, jurisdictional right, or retention commitment not yet established in Afghan Hub policy.
