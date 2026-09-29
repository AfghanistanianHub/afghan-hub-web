# Afghan Hub — launch privacy policy baseline (internal decision draft)

## Status

This is an **internal decision draft** for issue #132. It is not public policy, legal advice, a published SLA, or authorization to change production data.

Its purpose is to convert the remaining privacy questions into a concrete launch baseline that can be reviewed deliberately before any public wording or destructive automation changes.

## Legal baseline to design around

Afghan Hub is operated from British Columbia. For a provincially regulated private-sector organization, British Columbia's Personal Information Protection Act (PIPA) is the primary baseline for personal information handled within BC.

PIPEDA can also apply to personal information involved in interprovincial or international commercial transactions.

Operational implications for launch:

- collect, use, disclose, and retain only what is reasonably needed for stated purposes;
- protect personal information using reasonable safeguards;
- keep documented retention/destruction rules rather than indefinite default retention;
- preserve information for at least one year when it has been used to make a decision that directly affects an individual, where BC PIPA section 35 applies;
- written requests have a response framework under BC PIPA sections 25–31;
- correction implementation has a separate duty under section 24; do not treat a response deadline as permission to delay a correction.

Primary references:

- BC PIPA: https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/00_03063_01
- BC OIPC: https://www.oipc.bc.ca/
- OPC guidance on PIPEDA / provincial laws: https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/

## Recommended launch position

### 1. Account and profile data

Recommended rule:

- retain while the account is active and the data remains necessary to operate the member account;
- on a verified deletion request, remove account/profile data through the approved deletion runbook, subject to shared-content, safety, legal-hold, and backup exceptions;
- do not publish a fixed "deleted within X hours/days" promise until the workflow has been rehearsed and operational capacity is proven;
- do not retain inactive profile fields indefinitely merely because storage is inexpensive.

This should be reviewed periodically rather than relying on "account exists = retain forever."

### 2. Messages and shared conversations

Recommended product principle:

- do not treat one member's deletion request as authority to silently destroy another member's conversation history;
- long-term target: preserve shared conversation continuity while removing or anonymizing the deleting member's identity where technically feasible and legally appropriate;
- until a tested anonymization/preservation design exists, keep account deletion as a verified-support workflow requiring explicit review of shared-content impact.

Current schema cascades can remove shared messages/conversations. That technical behavior should not silently become the policy.

### 3. User-created listings and contributions

Recommended distinction:

**Personal/individual contributions**
- remove or anonymize when the member is deleted unless preservation is required for safety, legal, or integrity reasons.

**Organization/business content**
- where content represents an organization or business rather than the individual personally, prefer transfer/reassignment to another verified administrator over deletion when a safe ownership-transfer workflow exists;
- until transfer is supported and verified, deletion of an owner account must remain operator-reviewed because current cascades can remove organization/business records.

### 4. Media and uploaded files

Recommended rule:

- delete user-owned media when the associated account/content is deleted unless a defined exception applies;
- Storage cleanup remains Storage-first as documented in the deletion runbook;
- orphaned media should be detected and removed through periodic maintenance;
- public URLs must not be treated as proof that content is non-personal or safe to retain.

### 5. Security, abuse, moderation, and fraud evidence

Recommended baseline:

- retain only the minimum evidence necessary to investigate and defend against abuse, fraud, account compromise, harassment, or legal claims;
- restrict access to operators with a legitimate need;
- separate safety evidence from ordinary account/profile data so deletion workflows can apply different handling;
- use a documented review date rather than permanent retention;
- a reasonable **internal starting target for review** is 12 months after case closure, with earlier deletion where no longer necessary and longer retention only for an active investigation, legal obligation, or documented legal hold.

The 12-month period is a proposed operational baseline, not a statutory requirement and should not be published as a legal entitlement without review.

### 6. Operational logs

Recommended baseline:

- retain application/security logs only as long as required for troubleshooting, security, fraud detection, and operational accountability;
- avoid logging message contents, auth secrets, tokens, full private profiles, or unrelated payloads;
- define short rolling retention for ordinary application logs;
- if provider-managed log retention differs by service/plan, document the actual provider setting before making a public claim.

Proposed internal target:
- routine application/debug logs: 30–90 days where configurable;
- security incident logs/evidence: handled under the safety-evidence rule above.

### 7. Backups and recovery copies

Current recovery relies on operator-managed logical exports in encrypted off-site storage, not automatic Supabase backup retention or PITR; see [the Free-plan recovery runbook](../operations/free-plan-backup-recovery.md). Database exports do not include Storage object bytes.

Recommended operator-managed rule (to implement after policy approval):

- inventory each backup generation and every local/off-site copy, with its creation date, custodian, location, approved expiry date, and any documented hold/review date;
- before each backup cycle, the assigned custodian checks expiry and active holds; do not delete a generation or copy covered by an active documented legal/investigation hold or applicable minimum retention requirement, even if its ordinary expiry date has passed;
- assign each hold a responsible reviewer, scope, reason, and next review date; record the authorized release before resuming ordinary expiry, then remove expired copies no longer subject to a hold or minimum retention requirement from every inventoried location;
- record removal completion without copying personal data into the log; overdue hold reviews must be escalated, not treated as automatic release;
- retain the runbook's recoverability baseline of at least two recent generations where practical; escalate any conflict with approved expiry rather than silently retaining indefinitely;
- delete temporary unencrypted copies after verification of encrypted off-site copies, as the runbook already requires;
- do not promise immediate deletion from every historical backup;
- production deletion should remove data from active systems first;
- manual exports do not expire automatically; final expiry periods require owner approval and a named operator before this control can be considered implemented;
- restrict recovery copies to legitimate disaster recovery;
- maintain a restricted, minimal deletion record for recovery reconciliation; after restoration, re-apply approved deletions and verify the result before reopening access; if reconciliation fails, keep the restored system isolated and escalate;
- verify any future provider-managed backup lifecycle separately before making claims about it; provider expiry does not cover operator-held exports.

### 8. Privacy request timing

Recommended launch position:

- log receipt and acknowledge promptly; identity verification must protect disclosure without silently restarting the request clock;
- distinguish the written-request response clock from correction implementation;
- sections 25–29 cover written applicants under section 27, which includes access and correction; track the general 30-day response limit from receipt and assess any section 31 extension separately;
- calculate statutory days using section 1 (Saturdays and holidays excluded);
- under section 24, implement warranted corrections as soon as reasonably possible, notify applicable prior recipients, or annotate the requested correction if it is not made; a response extension must not be treated as permission to postpone this duty;
- route broader access requests through verified support; the narrow self-service export does not define the scope of statutory access.

Suggested internal operating targets (not public promises):
- acknowledgement: within 5 business days;
- response due date and correction progress: tracked separately;
- deletion completion: no public fixed deadline until rehearsal and staffing prove a sustainable target.

References: [BC PIPA sections 24–31](https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/00_03063_01#section24). Review applicability and extensions case by case.

### 9. Governing jurisdiction

Recommended launch position for legal review:

- operating jurisdiction: British Columbia, Canada;
- privacy compliance baseline: BC PIPA for in-province private-sector handling, with PIPEDA considered where applicable to interprovincial/international commercial personal-information flows;
- Terms governing-law clause should not be added solely from this draft. A final clause should be reviewed before publication and should account for mandatory consumer/privacy rights that cannot be contracted away.

### 10. Export scope

Recommended launch baseline:

Keep the existing self-service export deliberately narrow for now:
- account identifiers and safe profile data only.

Do not automatically include:
- full conversation/message history;
- other members' information;
- connection metadata involving third parties;
- internal moderation/security data;
- service-role/admin metadata;
- raw database rows.

Future broader export should use entity-specific redaction rules.

### 11. Self-service deletion

Recommended launch decision:

**Do not enable self-service destructive account deletion yet.**

Keep verified support deletion until all of the following are proven:
1. disposable end-to-end rehearsal passes;
2. Storage-first cleanup is reliable;
3. shared-content treatment is implemented;
4. business/organization ownership impact is handled;
5. post-delete verification is automated or reliably repeatable;
6. rollback/failure handling is documented.

This is a launch-safety decision, not an argument against future self-service deletion.

## Proposed retention matrix

| Data class | Launch baseline | Notes |
| --- | --- | --- |
| Active account/profile | While account is active and needed | Periodic minimization review |
| Deleted account/profile | Remove from active systems through verified workflow | Subject to exceptions below |
| Shared messages | Preserve continuity / anonymize where future design supports it | Current cascade behavior requires review |
| Personal listings | Remove/anonymize on account deletion | Unless legitimate exception |
| Organization/business content | Prefer transfer to verified admin | Current ownership cascade is unsafe as automatic policy |
| User-owned media | Delete with content/account | Storage-first |
| Routine app/debug logs | Proposed 30–90 day rolling window | Verify provider capabilities |
| Security/abuse evidence | Proposed review at 12 months after closure | Longer only with documented reason/legal hold |
| Backups | Operator-managed inventory and approved expiry for manual exports | Assign custodian; exempt active holds/minimum retention; record release before expiry cleanup; reconcile deletions before restored access |
| Decision records directly affecting an individual | Respect applicable minimum legal retention | BC PIPA s.35 can require at least one year |

## Decisions that can be adopted now without public-risk

The following are suitable as internal launch controls immediately:

1. no indefinite-retention-by-default principle;
2. data minimization and purpose-based retention;
3. Storage-first deletion;
4. no self-service destructive deletion before rehearsal;
5. shared-content impact requires review;
6. business/organization ownership impact requires review;
7. no public fixed deletion SLA yet;
8. track written-request responses and prompt correction implementation separately;
9. no broad raw-data export;
10. document exceptions/legal holds explicitly.

## Decisions still requiring explicit owner/legal approval before public wording

- final numerical retention periods;
- final shared-message anonymization/preservation rule;
- final organization/business ownership-transfer policy;
- final abuse-evidence retention period;
- public deletion completion target;
- final governing-law/forum clause;
- any expansion of self-service export;
- self-service account deletion.

## Implementation follow-up after approval

Once the policy decisions are approved:

1. update public Privacy/Terms only where the approved policy changes user-facing commitments;
2. update privacy runbooks with the approved retention matrix;
3. add CI guards against accidental contradictory promises;
4. add a privacy-request deadline field/state if operations need statutory tracking;
5. design shared-content anonymization/ownership-transfer before self-service deletion;
6. perform a disposable-persona deletion rehearsal before production deletion automation.

## Guardrail

Do not use this document alone as authority to:
- delete production data;
- publish a fixed SLA;
- change Terms governing law;
- retain safety evidence indefinitely;
- broaden exports;
- enable self-service deletion.
