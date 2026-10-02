# Afghan Hub current state

## Authoritative checkpoint — 2026-10-02

This is the continuation checkpoint for Afghan Hub. Always verify live `main`, open PRs, CI and Vercel before mutating anything. Hard-coded SHAs in this file are evidence snapshots only because updating this document advances `main`.

## Verified operational state

- Repository: `AfghanistanianHub/afghan-hub-web`.
- Latest verified application commit before this documentation refresh: `f77f28b42eb963df58a391cff17f29f5e411f679`.
- Open pull requests at this checkpoint: **none**.
- Vercel previews/deployments are working.
- GitHub Actions runner allocation has recovered. Issue #239 is **closed** after representative Node 22/24 execution returned to normal.
- Main launch acceptance gate #120 is **closed** with final hosted acceptance, cleanup/restore evidence and anonymous protected-route smoke recorded.
- `main` remains unprotected; #152 is still open and procedural PR + CI + Vercel gating remains the zero-cost control.

## Recent shipped work

Recent merged work includes:

- #251 final launch acceptance workflow/evidence;
- #253 related opportunities/events on detail pages;
- #356 unified listing forms, media controls, calendar/date UX and pending-submit feedback;
- #357 improved Assistant retrieval and zero-result recovery;
- #359 Unicode-safe multilingual Assistant intent matching;
- #360 pending/deleting feedback for Event/Opportunity destructive actions;
- #361 follow-up multilingual Assistant query cleanup.

Assistant discovery now includes:
- English/Dari/Pashto intent routing;
- Unicode-safe boundaries;
- natural-language query cleanup;
- removal of common grammatical connectives that would otherwise over-constrain PostgreSQL full-text search;
- handling of Persian ZWNJ plural forms including `ها`, `های`, `هایی`;
- zero-result recovery links and broader prompt retries;
- privacy-minimal recovery analytics without raw query text or record IDs.

## Product / visual state

Afghan Hub uses a modern, minimal, light visual system with warm off-white surfaces, restrained violet accents, readable dark text, fine borders and the approved geometric artwork. Avoid dark-first treatment and harsh/bright green.

Major public/member surfaces have already received substantial passes:
- landing/public home;
- dashboard;
- login/join;
- listing create/edit/detail flows;
- Explore/search;
- People/network/profile/connections;
- Messages;
- Settings;
- Saved Opportunities;
- My Submissions;
- loading/recovery/404;
- profile completeness;
- related opportunity/event discovery.

Do not redesign stable surfaces without a concrete UX or accessibility gap.

## Launch acceptance — COMPLETE

Issue #120 is closed.

Verified hosted evidence includes:
- discovery eligibility and hidden-profile behavior;
- connection send/accept/decline/cancel/disconnect;
- unauthorized responder denial;
- accepted direct conversation creation;
- unrelated/hidden conversation denial;
- messaging, unread/read synchronization and notification isolation;
- RSVP lifecycle, capacity, duplicate and creator restrictions;
- avatar Storage/profile behavior;
- owner create/edit/delete/submission behavior for organization/business/opportunity/event;
- incomplete-onboarding and unrelated-responder isolation;
- admin business/organization listing verification;
- disposable auth sign-in/refresh/sign-out/session-null verification;
- anonymous protected-route smoke;
- exact cleanup/restore assertions for remaining write fixtures.

The secondary acceptance environment remains the place for controlled write-capable acceptance. Do not use unrelated real identities as disposable personas.

## Acceptance tooling

Available commands include:

- `npm run acceptance:auth`
- `npm run acceptance:member-pair`
- `npm run acceptance:journey`
- `npm run acceptance:connection-lifecycle`
- `npm run acceptance:owner-submissions`
- `npm run acceptance:unrelated-responder`
- `npm run acceptance:listing-verification`
- `npm run acceptance:rsvp`
- `npm run acceptance:roles`
- `npm run acceptance:avatar-storage`
- `npm run smoke:public`
- `npm run security:qualify-target`

Write-capable acceptance harnesses must remain target-qualified, disposable-persona scoped and cleanup/restoration guarded.

## GitHub Actions — recovered

Issue #239 is closed.

Historical failures before checkout were runner/account-side allocation failures, not application-test failures. Hosted runners are currently allocating normally again and recent Node CI runs have completed successfully.

Do not weaken Node 22/24 coverage. Continue conserving unnecessary workflow runs and avoid diagnostic pushes with no product value.

## Migration / data safety

#199 migration reproducibility is closed. Fresh isolated replay and launch-critical migration/storage guards exist.

Do not:
- rewrite production migration history by guesswork;
- create fake Auth users directly in SQL;
- repurpose unrelated real users for tests;
- weaken RLS/Auth/CI for convenience.

## Production security gates

Launch acceptance no longer blocks production hardening, but **explicit production authorization is still required before any production mutation**.

### #134 — SECURITY DEFINER hardening — OPEN

Production SECURITY DEFINER search-path hardening remains a separate controlled change. Secondary rehearsal evidence exists. Before any production change:
- recapture exact current production function fingerprints;
- verify signatures/owners/ACLs/body are unchanged except intended `search_path`;
- keep rollback SQL paired with the forward change;
- obtain explicit production authorization.

No blanket EXECUTE revoke or SECURITY INVOKER conversion.

### #136 / #80 — direct DML least privilege — OPEN

Secondary contains the intended narrower ACL matrix. Production direct-DML reduction remains a separate authorization step.

Important invariant:
- `profiles` is excluded from this phase;
- capture the profile table + column ACL fingerprint immediately before and after;
- require that fingerprint to remain unchanged.

Do not execute issue-body SQL without a same-window production metadata check and explicit authorization.

### #135 — Auth/platform hardening — OPEN

Platform/Auth hardening remains open. Treat extension placement and leaked-password protection as separate platform decisions. Re-read current issue evidence before acting; do not assume older production fingerprints remain current.

### #152 — repository hardening — OPEN

`main` is still procedurally PR-only rather than natively protected under the current zero-cost/private-repository constraints.

Until native protection becomes available:
- use focused PRs for runtime/application changes;
- require Node 22/24 CI + Vercel before merge;
- do not force-push/delete `main`;
- do not make the repository public merely to obtain free branch-protection features.

## Privacy operations — #132 OPEN

Technical mechanics are substantially implemented, but policy/legal decisions remain intentionally unresolved, including:
- retention periods by data class;
- privacy-request SLA;
- governing jurisdiction;
- shared-content treatment on deletion;
- abuse/safety evidence retention;
- broader export scope;
- self-service deletion vs verified-support flow.

Do not invent policy values merely to close the issue.

## Release / recovery

- anonymous production smoke exists;
- `npm run backup:free-plan` exists;
- encrypted/off-site logical backup guidance exists;
- Supabase Free does not provide automatic backups/PITR;
- database dumps do not include Storage object bytes;
- never restore over production merely to demonstrate recovery.

## Operating constraints

- Zero-cost mode unless the user explicitly approves paid infrastructure/features.
- No production mutation without exact scope, current evidence, rollback/cleanup and explicit authorization.
- Never commit passwords, tokens, service-role keys, cookies, reset/confirmation links or DB credentials.
- Keep security/privacy evidence current in #80, #132, #134, #135, #136 and #152.
- Visual changes should address real hierarchy/state/accessibility gaps and preserve the approved light Afghan Hub identity.

## Immediate continuation order

1. Keep `main` healthy: focused PRs, Node 22/24 CI and Vercel gating.
2. Continue product work from concrete UX gaps rather than broad redesign churn.
3. Prioritize Assistant/discovery quality using existing profile/content signals before introducing new preference schema.
4. Perform authorized private rendered review of signed-in listing/detail flows when browser access is available.
5. Treat #134, #135 and #136 as separate production change-control projects; do not auto-apply them.
6. Resolve #132 privacy-policy decisions with explicit product/legal choices.
7. Keep #152 as the repository-hardening track until native branch protection becomes viable or the procedural limitation is explicitly accepted as final.

## Verified checkpoint

- #120 closed — launch acceptance complete.
- #198 closed — avatar/Storage behavioral acceptance complete.
- #199 closed — migration reproducibility complete.
- #239 closed — GitHub Actions runner health recovered.
- #251 merged.
- #253 merged.
- #356 merged.
- #357 merged.
- #359 merged.
- #360 merged.
- #361 merged with successful Node CI.
- #132 open.
- #134 open.
- #135 open.
- #136 open.
- #152 open.
- open PRs: none at the time of this checkpoint.
