# Afghan Hub current state

## Authoritative checkpoint — 2026-09-16

This is the concise continuation checkpoint for Afghan Hub. Detailed evidence lives in GitHub issues/PRs, workflow runs, and Supabase records. On every continuation, verify live `main`, open PRs, CI and Vercel before mutating anything.

## Current main / operational state

- Current `main`: `d5f5318e6bcffea4c66833a9e7e2a0c603f7157e` (`Run final secondary launch acceptance once (#236)`).
- `main` is still unprotected; #152 remains open.
- Vercel previews are working.
- GitHub Actions is currently the active operational blocker: several unrelated jobs terminate before checkout/setup with no workflow steps (`steps: []` / `steps: null`). This is tracked in #239.
- Do not interpret those pre-step runner failures as product/test failures and do not weaken CI to bypass them.

## Product / visual state

Afghan Hub uses a modern, minimal, light visual system. Avoid dark-first treatment and harsh/bright green. The product should feel like a contemporary community/product platform rather than a text directory.

Major shipped product/visual work includes:

- #180 public home;
- #182 dashboard command center;
- #184 login/join identity;
- #186 listing detail hierarchy;
- #188 profile/network;
- #190 recovery/settings;
- #194 loading/recovery/404 alignment;
- #195 dashboard navigation/mobile hierarchy;
- #220 profile strength/completeness guidance;
- #235 personalized dashboard opportunity/event ranking using existing profile signals.

Dashboard now uses the reusable `ProfileStrength` component and full completeness fields. Member, opportunity and event recommendations use existing profile/location/skill signals with deterministic fallbacks.

Open product PR:

- #237 clarifies business/organization trust semantics: `Verified listing`, reusable badge/note, and an explicit statement that verification is not an endorsement or guarantee. It intentionally does not claim member identity verification. Manual review found its regression test is included by the existing `node --test tests/*.test.mjs` CI step. Keep it unmerged until executable CI returns.

Messages, Member Directory, Saved Opportunities, Search, Moderation and My Submissions have already received substantial passes. Avoid redesign churn without a specific UX gap.

## Secondary acceptance environment

Secondary Supabase: `rurgmyiiytesknsfwjjl`.
Production source of truth: `yussznmwjsvfvpabmwdc`.

Secondary is aligned for launch-critical acceptance without production mutation:

- all 12 launch tables have RLS enabled and production-equivalent policy counts;
- workflow-critical connection/messaging/RSVP/moderation semantics are aligned;
- Realtime publishes `conversation_members`, `messages`, `notifications`;
- Storage bucket configuration/policies match production for `avatars`, `business-media`, `organization-media`;
- launch-critical constraints and enums are aligned;
- Search is production-equivalent for `search_vector`, updater functions/triggers, GIN indexes and `search_afghan_hub()`; #197 is closed;
- `pg_trgm` 1.6 relocation to `extensions` was rehearsed successfully and remains hardened on secondary;
- SECURITY DEFINER search-path hardening is rehearsed on secondary.

Never infer that an existing account is disposable merely because its role matches a required persona.

## Hosted acceptance — verified evidence

### Core hosted matrix — PASS

Run `35028458491` (attempt 2) passed:

- exact non-production target qualification;
- role/persona authorization;
- Member A/B connection request and recipient acceptance;
- unauthorized responder denial;
- one direct conversation from either direction;
- message visibility and recipient-only notification isolation;
- unread/read synchronization;
- moderated RSVP lifecycle, creator restriction, duplicate handling and cancellation;
- avatar Storage/profile behavior.

The exact journey fixture was verified by ID/cardinality, removed with assertion-guarded cleanup SQL, and post-cleanup verification returned zero matching connection/conversation/message/membership/notification rows.

### Connection/discovery lifecycle — PASS

Run `35061765698` passed:

- public/onboarded eligibility;
- unrelated direct-conversation denial;
- temporarily hidden disposable Member B became unreadable and request-ineligible, then was restored;
- decline;
- requester cancel;
- disconnect;
- notification cleanup;
- clean final A/B relationship state.

### Avatar / Storage

#198 is CLOSED. Behavioral avatar acceptance passed, including own-folder upload/update/delete, public read, cross-user denial, profile `avatar_url` update/restoration and cleanup.

## Acceptance tooling now available

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

All write-capable acceptance harnesses are scoped to designated disposable personas, use explicit acknowledgements and/or target hard-blocks, and must restore/clean exact fixtures.

## Main launch gate — #120

#120 remains OPEN, but most behavioral surface is already proven.

Completed:

- discovery/request eligibility;
- send/accept connection;
- unauthorized responder denial;
- decline/cancel/disconnect;
- hidden/unrelated direct-conversation denial;
- messaging, unread/read and notification isolation;
- roles/persona authorization;
- RSVP behavior;
- avatar Storage/profile behavior.

Remaining execution evidence:

1. owner create/edit/delete/submission behavior for organization/business/opportunity/event;
2. consolidated incomplete-onboarding/unrelated-responder evidence on the current acceptance base;
3. admin business/organization listing-verification behavior;
4. disposable auth sign-in/refresh/sign-out with session-null verification;
5. hosted anonymous protected-route smoke (`/dashboard`, `/messages`, `/update-password` → `/login`);
6. exact cleanup/restore evidence for any remaining write fixtures.

PR #238 extends the temporary one-shot workflow to run the remaining auth/protected-route evidence alongside owner/discovery/admin suites. Vercel for #238 is successful. Its Node CI is blocked by #239 pre-step GitHub Actions failures; keep #238 open until CI can actually execute.

Do not treat #134 or #136 as cleared for production until #120 evidence is complete and separate production authorization is given.

## GitHub Actions blocker — #239

Observed on PR #238, the one-shot acceptance workflow and unrelated PRs:

- jobs fail/cancel before checkout/setup;
- job step lists are empty;
- reruns reproduce the same pattern;
- Vercel succeeds;
- public GitHub status reports Actions operational.

This suggests a repository/account/runner-specific operational problem rather than an application regression, but do not guess the exact cause without evidence. Once jobs can start normally, rerun a representative Node 22/24 matrix first, then run the #120 one-shot acceptance.

## Migration reproducibility — #199 CLOSED

Repository migration history has been repaired and protected. Fresh isolated replay run `35005042328` passed on main `bff0b27528e70785d2bbf879d916823784d7014b`:

- local Supabase startup;
- `supabase db reset --local --no-seed`;
- launch-critical verifier;
- cleanup;
- exact-main Node 22/24 CI and Vercel.

Recovered baseline and repair PRs include #200-#205 and #214-#217. CI includes migration/storage replay guards. Do not rewrite production migration history by guesswork.

## Production security gates

### #134 — SECURITY DEFINER hardening

20 authenticated-callable SECURITY DEFINER functions remain the production advisor surface. Their caller/role boundaries were reviewed. Secondary has all 20 with `search_path=''`; production still has 10 already empty and 10 holdouts using `search_path=public`. Exact forward/rollback change material is documented. Do not apply production function changes before #120 completes and explicit production authorization is given.

### #136 / #80 — Phase B DML least privilege

Production direct DML reduction remains unexecuted. Secondary has the intended narrower ACL matrix and a reversible production package is documented.

Important invariant: `profiles` is excluded from Phase B. Capture the production profile table+column ACL fingerprint immediately before and after any approved change and require it unchanged.

No production GRANT/REVOKE before #120 and explicit authorization.

### #135 — platform/Auth hardening

- Production `pg_trgm` 1.6 remains in `public`.
- Secondary relocation to `extensions` passed and removed that advisor warning.
- No Afghan Hub trigram index/function dependency was found; Search uses PostgreSQL full-text search.
- Production relocation is a separate production DDL decision with rollback.
- Supabase leaked-password/HIBP protection is unavailable on the current Free plan; the stronger application password baseline is mitigation, not an equivalent replacement.

### #152 — repository hardening

`main` remains unprotected and the current connector does not have repository administration capability to configure branch protection. Continue procedural PR + Node 22/24 + Vercel gating in zero-cost mode. Do not bypass CI merely because native protection is unavailable.

## Privacy operations — #132

Technical mechanics are substantially complete. Remaining items are deliberate policy/legal/product decisions and must not be invented merely to close the issue:

- retention periods by data class;
- privacy-request SLA/target;
- governing jurisdiction;
- shared-content treatment on deletion;
- abuse/safety evidence retention;
- broader export scope;
- self-service deletion vs verified-support flow.

Current self-export intentionally contains account/profile data only. Production deletion remains a verified-support flow with Storage-first cleanup and Auth identity last.

## Release / recovery

- manual anonymous production smoke exists (`npm run smoke:public`);
- `npm run backup:free-plan` exists;
- encrypted/off-site logical backup guidance exists;
- Supabase Free has no automatic backups/PITR;
- database dumps do not contain Storage object bytes;
- never restore over production merely to prove recovery.

## Operating constraints

- Zero-cost mode unless the user explicitly approves paid infrastructure/features.
- No production mutation without exact scope, evidence, rollback/cleanup and explicit authorization.
- Never commit passwords, tokens, service-role keys, cookies, reset/confirmation links or DB credentials.
- Do not create fake Auth users by SQL or repurpose unrelated real identities.
- Do not weaken RLS/Auth/CI for convenience.
- Keep evidence current in #80, #120, #132, #134, #135, #136, #152, #198/#199 history, and #239.
- Visual changes should target real hierarchy/state/trust gaps and preserve the modern/minimal/light Afghan Hub identity.

## Immediate continuation order

1. Check #239 / GitHub Actions runner health.
2. When Actions can execute steps, get green Node 22/24 CI for #238 and merge it.
3. Run the final one-shot #120 acceptance and capture exact cleanup/restore evidence.
4. Remove the temporary one-shot workflow after evidence is captured.
5. Close #120 only when all remaining boxes are proven.
6. Then review #134/#136 production change-control separately; do not auto-apply them.
7. Merge product PR #237 only after executable CI + Vercel are green.
8. Continue product roadmap with existing-profile-signal personalization/related-content improvements before adding new preference schema.

## Verified checkpoint

- `main`: `d5f5318e6bcffea4c66833a9e7e2a0c603f7157e`;
- #120 open with majority of behavioral acceptance already passed;
- #198 closed;
- #199 closed;
- PR #237 open (verification trust semantics);
- PR #238 open (final acceptance evidence consolidation), Vercel green, CI blocked by #239;
- #239 open for pre-checkout Actions failures;
- production unchanged by the remaining acceptance work.
