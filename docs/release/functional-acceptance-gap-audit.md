# Functional acceptance extension — 2026-10-14

This is a coverage and product-decision record, not a release approval. No Production roles, accounts, listings, SMTP templates or deletion semantics are changed.

## Evidence boundary

The verified prior baseline is 337b23b84c2d93495de7e7ecc3b1c65dda71bac2: run 38367466912 contains two successful independent jobs, each completing browser/API/RLS execution, fixture cleanup and stack destruction. It does not verify later changes.

The discovered head was 472a4dda64204b68f47957b4769f963fa97add1a, which adds the typography lab and shared language dependency. Run 38507713925 passed its API/RLS stages but both browser jobs stopped at the immediate empty-submissions assertion, before the rest of the suite. Cleanup succeeded. Node CI 38507713930 reported two outdated VM dependency-loader failures and a category-navigation timeout. The latter did not reproduce in both successful Node jobs of run 38519746420 on dad64a27c09aebb32651149b5e33f8bf2534703f; no landing assertions were weakened.

The loader now evaluates the actual shared language module. The empty-submissions scenario waits for streamed content and independently asserts five zero counts, no articles and no alert. It has its own scenario identity rather than inheriting the previous successful onboarding label.

## Added coverage

- Admin changes a newly created synthetic member through moderator, admin and member using the real team form. Each save verifies database role, rendered success and existing-token access context. Browser access is checked before token refresh. Screenshots capture each role.
- A demoted session cannot call the role RPC or submit a copied real server-rendered form. Refresh and sign-out boundaries are checked.
- Moderator and anonymous personas submit the same native Server Action and attempt the role RPC; the target role must remain unchanged.
- Businesses join organizations, opportunities and events in browser create/edit, owner identity, draft privacy and foreign-edit refusal. Business/organization deletion is not invented.
- Recovery is requested through the real form and Mailpit link. Mismatched passwords are refused; a valid change signs the browser out, rejects the old password and accepts the new one.
- Missing/invalid/replayed reset links must not establish a signed-out password-change session.
- Expiration changes only the captured synthetic auth.users timestamp in the validated local stack. The existing password and anonymous boundary must remain intact.
- Duplicate signup must preserve exactly one account; expired signup confirmation must not confirm that account or grant a browser session.
- Separate browser contexts have distinct cookie storage. Signup may confirm the identity at Auth, but the receiver cannot exchange the PKCE code without the requester verifier; explicit password sign-in is tested. Recovery in another context must fail closed and leave the password unchanged. These are safety/behavior checks, not a claim that automatic cross-device confirmation or recovery is implemented.

Complete-pass claims require every scenario in each independent job, plus fixture and stack cleanup, at one immutable revision. Partial jobs and earlier SHAs are not combined.

## Authentication capability follow-up

A new `/auth/confirm` route and reviewed token-hash email templates implement session establishment in the receiving browser. See [cross-browser implementation and activation boundary](cross-browser-email-verification.md). Final-revision complete acceptance is required for this new code. Hosted templates and SMTP remain unchanged; external delivery is still unverified.

The following records the original baseline limitation and proposal:
## Open authentication capability

The application currently supports only exchangeCodeForSession at /auth/callback. A successful reset requested on device A and opened on device B remains unavailable. The receiving device shows an invalid/expired-link message despite a verifier-context mismatch. The separate-context scenario documents that limitation rather than relaxing its authentication boundary.

Concrete follow-up: add a narrowly validated token-hash confirmation endpoint accepting only signup/recovery, fixed internal destinations, server-side verifyOtp and no-store responses; pair it with reviewed email templates. Verify actual links, one-time redemption, expiration, signed-out replay, fresh contexts and cleanup against the isolated stack. Hosted template changes require an identified authorized test service; none was used. Do not silently change Production templates.

External email delivery/deliverability remains unverified. Mailpit does not establish real SMTP delivery or actual-device compatibility.

## Business/organization deletion proposal

Existing API/RLS policies allow owner deletion. The application has no corresponding deletion action or UI for either type. Opportunities and events have confirmed owner deletion forms. This mismatch is not itself an approved requirement to introduce destructive controls.

Option A: explicitly retain create/edit-only business and organization UI for this release, describe it accurately and retain deletion UI as a product gap.

Option B: approve confirmed owner deletion for both. The proposal is a owner-only action plus accessible confirmation showing the affected entity name; cancellation must perform no write. The server must recheck Auth and ownership, and use existing RLS. Existing FK semantics keep linked opportunities/events and set their business/organization association to NULL. Do not cascade-delete those listings. Media cleanup, saved links, verification/history retention and already-open detail pages must have explicit agreed behavior before implementation. Existing Storage objects are not automatically removed by deleting a database row.

No archive/soft-delete model, new cascading semantics or retention timeline is introduced by this acceptance extension.
