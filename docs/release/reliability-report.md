# Afghan Hub reliability and security quality pass

## A. Implementation

The approved homepage and simplified network were preserved. Work proceeded on isolated local branch `feat/navigator-release-readiness`, with ordinary fast-forward pushes to PR #484's `feat/approved-community-homepage`. Main and production were not merged, promoted or modified.

- Reused PR #485's existing cross-page Navigator journey fix through a cherry-pick rather than implementing a competing fix.
- Corrected contextual public-search refinements: Vancouver location, Artists & Creatives, category replacement, current-month events and British Columbia expansion retain/update the intended dimensions. Independent goals and All locations clear obsolete filters. Structured matching remains bounded.
- Separated Dari and Persian in both homepage and member Navigator resources, corrected signed-in language labels, localized utility controls and input direction, and fixed previous-language result announcements during language switching.
- Added a server-only, atomic shared model budget adapter. Missing/unavailable/exhausted budgets fail closed to structured search before loading/calling provider SDKs. No provider credentials were created, requested, stored or used.
- Added disposable local Supabase CI with synthetic accounts, strict loopback targeting, migrations without production data, real Auth/API/RLS assertions, sanitized artifacts and captured-ID cleanup. Added real concurrent Redis budget integration.
- Fixed Realtime catch-up on backend `postgres_changes` readiness in messages, read receipts and notifications. A joined socket can precede change delivery; readiness and rejoin now refresh authoritative server state. The isolated test's initial missed events disappeared when it waited for backend readiness. See [Supabase's explanation](https://supabase.com/docs/guides/troubleshooting/realtime-postgres-changes-troubleshooting).
- Patched the two inherited runtime dependency advisories through minimal lockfile changes.

Principal code: [discovery-budget.ts](../../src/lib/assistant/discovery-budget.ts), [public-discovery.ts](../../src/lib/assistant/public-discovery.ts), [homepage-navigator.tsx](../../src/components/assistant/homepage-navigator.tsx), [Community Navigator](../../src/components/assistant/community-navigator.tsx), [notification-bell.tsx](../../src/components/dashboard/notification-bell.tsx), [Realtime messages](../../src/components/messages/realtime-message-refresh.tsx), [isolated journeys](../../scripts/qa/local-member-journeys.mjs), [CI workflow](../../.github/workflows/local-journey-acceptance.yml).

## B. Test Results

Tested runtime commit: `0d2144eb41646730b1a9ba4011e643efb25271f7`.

- Local macOS Node 24.13: **355 tests, 354 pass, zero fail, one Linux-browser test skipped**. Final TypeScript, production build, migration Data API grant guard and orchestrator syntax checks pass.
- Ubuntu [Node 22 and 24 CI](https://github.com/AfghanistanianHub/afghan-hub-web/actions/runs/37736285684): **355/355 pass on each**, clean `npm ci`, lint, TypeScript, browser regression, grant guard and production build pass.
- ESLint: zero errors; seven inherited warnings. Events/opportunities each have two unused catalog-checkbox imports; dashboard layout has two unused notification error variables; profile-access has one unused argument. These were not changed through unrelated style churn.
- [Fresh isolated Supabase CI](https://github.com/AfghanistanianHub/afghan-hub-web/actions/runs/37736285676/job/113176442533): **14/14 real API/RLS scenarios pass**, including cleanup. Initial failures exposed inaccurate fixture assumptions and stream-readiness timing; fixtures were corrected without weakening RLS, and the latest run passes.
- Same job: **2/2 real Redis integration scenarios pass**, including 30 concurrent reservations, exact minute capacity, daily exhaustion and expiry preservation. Live Upstash service behavior is not tested.
- CI Chrome: all six requested widths (320, 390, 768, 1024, 1280, 1440) pass usable-node and overflow checks with zero reported axe violations. Public index/detail motion, focus, keyboard links and reduced motion pass at mobile/desktop widths. Nine public/auth routes pass layout checks. The signed-in Navigator drawer browser uses a mocked read-only API; this is not authenticated data retrieval evidence.
- Manual Chrome on local dev and immutable Preview: homepage, mobile expandable menu, real public search, Dari switch/current-language announcement and linked Fera Media detail verified. One APNBC canvas is present. All six local widths have nonoverlapping usable nodes and no overflow.
- Local anonymous smoke: 16/16 pass. CI anonymous smoke targets existing production read-only and passes; it does not validate the new Preview. The anonymous smoke attempt against the immutable Preview fails 0/16 because Vercel protection returns HTTP 302 before application routes. Browser QA passes through the existing authorized Vercel session; this does not establish anonymous Preview access. The protected-page connector also returned scoped HTTP 403. No deployment protection was disabled or bypass secret copied. Two initial smoke invocations used the wrong base variable and reached an absent local port; those execution errors are not application results.

Automated axe checks are useful evidence, not a complete WCAG certification. No video walkthrough was captured; screenshots and machine-readable results are provided.

## C. AI Navigator

Direct structured search, adaptive guided discovery, Back/Skip/Restart, session context, contextual refinements, empty/error/cancellation states and grounded public catalog links are implemented. Anonymous people discovery navigates to the authenticated member directory; it does not expose profiles. Signed-in retrieval retains authenticated visibility/RLS rules.

Model provider configuration, strict output schema, allowlisted catalog tool, six-second provider deadline, 600 output-token ceiling, one attempt/no retries and shared 10-per-minute/200-per-day ceilings are covered by offline stubs and real Redis reservation tests. Retrieved records never become provider instructions or model-defined tables/URLs. Live model accuracy, language understanding, latency, reasoning-token use, pricing and Upstash transport remain **unavailable/untested**. The interface identifies structured search; no fabricated AI response is used.

See [activation steps](model-activation.md), [reproducible evaluation cases](navigator-evaluation-cases.json) and [budget evidence](model-budget-results.json). General public-search rate limiting remains per instance; shared model budgets protect paid calls, not all platform-wide search abuse.

## D. Security

[Scoped findings and dependency paths](security-findings.md) record Sharp/librsvg and source-map-js patches, advisories, reachability and compatibility. Runtime `npm audit --omit=dev`: **zero findings** after clean installation. Full audit retains nine high-severity development package nodes; uncontrolled major downgrades were not applied.

Read-only production metadata reviewed ten RLS tables and eight relevant guarded SECURITY DEFINER functions. Real isolated tests assert private-profile, role-escalation, unrelated-connection, conversation/message, notification and owner/moderator boundaries. This is meaningful scoped evidence, not an exhaustive security audit.

The latest [advanced-security job](https://github.com/AfghanistanianHub/afghan-hub-web/actions/runs/37736288116/job/113176455379) fails with **HTTP 402, monthly quota exceeded**. The mandatory check remains configured. The connector's targeted secret scanner separately reports Advanced Security unavailable. Neither failure establishes a clean application.

Supabase advisors report 20 authenticated SECURITY DEFINER exposure warnings requiring individual review, plus disabled leaked-password protection. Production auth settings were not changed. No production data was copied or written.

## E. Localization

Four distinct interface locales are exposed: English, Dari (`fa-AF`), Persian (`fa`) and Pashto (`ps`). Dari/Persian labels and resources are separate. Inclusive Artists & Creatives terminology is present. Resource-key completeness, representative matching and RTL UI checks pass. Dari, Persian and Pashto are **machine drafts awaiting native review**; none is represented as native approved. Listing content retains its original language.

[Review checklist and sign-off workflow](localization-review.md).

## F. Authenticated Journeys

The [scenario matrix](authenticated-journey-matrix.csv) contains expected/actual outcome, status, evidence and defect/coverage references. [Sanitized API results](authenticated-api-results.json) contain the actual 14 passing scenarios from the fresh isolated stack.

A registration/token confirmation, profile/onboarding/session/privacy; B complete connection transitions and unauthorized actions; C messaging and membership boundaries; D recipient notifications/repeated reads; E organization/opportunity/event CRUD and moderation all pass through real Auth/API/RLS. Message/notification delivery passes initial subscription and resubscription.

Eight browser/fault coverage rows remain blocked/unverified: email delivery/callback UI, onboarding/browser cookie persistence, two-account connection UI, authenticated messaging UI, unread badge/navigation/multi-tab UI, duplicate-event replay, network transport interruption and owner/moderator form E2E. Isolated API infrastructure now exists; a real browser fixture bridge and these scenarios still need implementation. Local Docker Desktop could not run the stack, and the hosted secondary project was unavailable, so safe real API coverage was executed in disposable Ubuntu CI instead. No private production fixtures were used.

## G. Deployment

Runtime commit: `0d2144eb41646730b1a9ba4011e643efb25271f7`. Draft [PR #484](https://github.com/AfghanistanianHub/afghan-hub-web/pull/484), branch `feat/approved-community-homepage`.

Immutable [working Preview](https://afghan-hub-d7dh97387-afghan-hub-s-projects.vercel.app/). [Vercel dashboard](https://vercel.com/afghan-hub-s-projects/afghan-hub-web/8v489Z9w1UbdKv4G8GS2qttegLdm) verified **READY**, Preview environment, matching runtime commit. Vercel connector access failed with scoped 403; browser dashboard/GitHub integration supplied actual evidence. Production was not deployed.

Visual evidence: [desktop 1440](../../evidence/release_preview_desktop_1440.jpg), [mobile 390](../../evidence/release_preview_mobile_390.jpg), [Dari result 390](../../evidence/release_preview_dari_results_390.jpg). These screenshots come from the immutable runtime Preview. [Responsive measurements](responsive-observations.json) preserve the six-width DOM observations. A later documentation-only commit does not change this tested runtime; the final delivery identifies that SHA separately.

## H. Readiness

**Ready for Preview review. Not ready for limited beta or production.** Builds and scoped regressions pass, real isolated authorization journeys pass, and the approved homepage remains stable. The mandatory security scanner is blocked externally, authenticated browser coverage is incomplete and translated resources await native review. Model-backed conversations remain deliberately disabled and untested. No assertion of full authenticated or production readiness is made.

## I. Next Actions

1. Restore security-scanner quota and rerun the required gate without bypassing it; qualify the development dependency remedies separately.
2. Extend the disposable CI environment into real browser fixture journeys for the eight coverage gaps, including email callback, badge/multi-tab state and transport interruption.
3. Obtain separate Dari, Persian and Pashto native reviews using the checklist, then record sign-offs on the tested commit.
4. Owner reviews leaked-password protection and remaining SECURITY DEFINER exposure warnings before production approval.
5. Once the owner independently provides a server-side credential: configure Preview provider/model/enable flag and shared budget store, set provider spending limits, redeploy Preview, execute live evaluations, then request separate production approval. Exact variables, bounds and rollback are in the activation document. No credential is requested by this phase.
