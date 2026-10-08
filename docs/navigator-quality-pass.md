# Homepage Navigator — implementation and activation handoff

## Delivered behavior

The approved homepage and its five destinations are preserved. The existing APNBC canvas remains the only particle background. Reduced-motion mode now disables network transitions as well as entrance animations; hover and keyboard focus retain immediate visual feedback.

The public Navigator now has a server-side orchestration layer with configurable `structured`, `openai`, and `gateway` providers. Structured search is the default and is explicitly labeled in the conversation. In that default mode the provider SDK and model credentials are not consulted, and no model request occurs. No credential was created, requested, exposed, or stored during this work. Model-backed behavior has not been exercised with a live provider.

One optional, bounded model call can produce only a validated discovery plan, a brief understanding of the goal, and an essential clarification question. The application executes an allowlisted public search tool after validation; the model cannot select arbitrary tables, SQL, URLs, private records, or executable tools. Retrieved listings never enter the model prompt. Recommendations and internal links are constructed from real authorized public records. User input and prior context are treated as untrusted data. Provider errors and invalid model output fall back to clearly identified structured search.

The public Supabase tool reuses the anonymous publishable-key reader and its existing RLS/publication/current-listing boundaries, even for signed-in visitors. It searches businesses, organizations, opportunities, and events, with bounded parallel retrieval, province-aware location filters, and balanced ranking. People discovery leads to the existing sign-in boundary; anonymous profiles, private contacts, service-role access, and database writes are excluded. All four public listing tables were verified to have RLS and a text province field. No schema or policy changes were made.

The guided flow adapts to information already supplied, supports free-text answers, Back with answer retention, Skip, Restart, progress, and session-only history. Direct refinements and clarification replies retain validated prior context; independent goals replace it. Explicit guided filters and exclusive category requests take precedence over inference. Internal questionnaire state is excluded from the strict API payload.

English, Dari (`fa-AF`), Persian (`fa`), and Pashto (`ps`) controls and RTL/LTR layout are implemented. Search inputs use automatic text direction. Native-language aliases support common topics, locations, and refinements in structured search; this is bounded matching, not general multilingual semantic understanding. Dari currently shares Persian UI strings with a distinct language tag. Native editorial review remains required. Public listing content remains in its original language.

## Reliability controls

- Strict request, model-decision, plan, and response schemas; allowlisted public kinds and safe internal listing links.
- Same-origin POST enforcement; 4 KiB streaming body cap; bounded fields and session context.
- At most one model call, 600 output tokens, no automatic retries, six-second model deadline; eight-second public retrieval deadlines and client cancellation.
- Per-instance request/concurrency limits and a fixed ten-model-calls-per-minute ceiling; safe 429/503 responses, partial-feed warnings, loading, empty states, retry, and explicit fallback labels.
- Content rendered as React text; aggregate duration/count/token logs omit queries, catalog content, secrets, and provider error payloads.

The application limits are local to a running server instance. They do not establish a deployment-wide budget or abuse limit. Add a shared edge/WAF or centralized limiter and provider spending controls before enabling paid public traffic.

## Enable model-backed conversations after the credential is available

1. Choose `openai` or `gateway` and a model that supports the installed SDK's structured output. Confirm the permitted processing region and privacy disclosure for search text and prior filters. Provider/model selection is server-side; no model ID is hardcoded.
2. The owner configures the secret separately in Vercel's **Preview** environment: `OPENAI_API_KEY` for `openai`, or `AI_GATEWAY_API_KEY` for `gateway`. Never paste it into chat, commit it, log it, or use a `NEXT_PUBLIC_` variable. The Gateway adapter uses the explicit key rather than automatic OIDC billing.
3. Configure non-secret Preview settings: `NAVIGATOR_MODEL_PROVIDER=openai` (or `gateway`), `NAVIGATOR_MODEL_ID=<supported model ID>`, and `NAVIGATOR_MODEL_ENABLED=true`. The adapter requires all three settings and the corresponding credential before a provider call. Disabled/missing configuration retains structured search.
4. Establish a deployment-wide request/model limiter, provider budget and alerts, and a reviewed data-processing policy before opening model-backed access to public traffic. Current per-instance ceilings are an additional safeguard only.
5. Redeploy to Preview and run live model evaluations: English/Dari/Persian/Pashto, multi-area goals, geography/date filters, new goals versus refinements, clarification replies, explicit guided filters, no results, partial outages, invalid output, timeout, capacity/429, prompt injection, privacy, real-link grounding, latency and token cost. Verify the displayed `model-assisted` engine only follows valid model decisions; provider failures must visibly switch to structured search. Tests with injected planners validate orchestration but do not replace these live evaluations.
6. Resolve the release gates below and obtain explicit production approval. To disable model calls, set `NAVIGATOR_MODEL_ENABLED=false` or `NAVIGATOR_MODEL_PROVIDER=structured` and redeploy. Structured search continues independently.

## Verification and limitations

This handoff supplements the original [homepage review](approved-homepage-review.md). Final run results and hosted CI are recorded in PR #484; that description is the current status source.

- Final local full suite: 340 tests, 339 passed, one Linux-only browser suite skipped, zero failures. The orchestration tests use injected planners; no real model calls occur.
- TypeScript and production build passed. ESLint has zero errors and seven inherited dashboard/profile warnings. The Data API grant guard and agent runtime syntax check passed.
- Clean Node 22/npm 10 dependency installation was checked in a disposable directory. Optional WASM lock entries were restored without upgrading application dependency versions after Linux CI exposed missing entries.
- Public release smoke: 16/16 checks passed against a local production server.
- Actual browser inspection at 1440, 1280, 1024, 768, 390 and 320 px found no horizontal overflow or overlapping network destinations. Only one APNBC canvas was present. Guided known-city journeys, Back/Skip, contextual searches, mobile navigation and four language direction controls were exercised.
- Hosted Preview returned the real Fera Media public listing; following its result link opened the organization's public detail page. No listing or community statistics were fabricated.
- The embedded recording tool returned no compositor frames; no successful video is claimed. Screenshots below are actual browser captures.
- Authenticated onboarding/account changes, two-account connections, messaging, notifications and complete sign-in/sign-out flows were not exercised. These require designated isolated test accounts/environment; existing unit regression coverage is not an end-to-end substitute.
- No Lighthouse/Web Vitals score or comprehensive accessibility certification is claimed. The repository's Linux browser suite includes six-width axe checks and interaction verification; confirm its latest CI status in the PR.
- The inherited runtime dependency audit has two high-severity transitive findings (`sharp`, `source-map-js`), requiring a separate validated dependency patch. The full install audit also includes development findings.
- GitHub's advanced-security check has encountered an account monthly quota (402), independently of application test execution. Resolve the quota and rerun the check before release.

## Visual evidence

Screenshots reflect the implementation at commit `47a70d9`; subsequent changes restore optional dependency lock entries and document the handoff.

- [Hosted desktop homepage — 1440 px](../evidence/hosted_desktop_1440.jpg)
- [Hosted mobile homepage — 390 px](../evidence/hosted_mobile_390.jpg)
- [Local production Navigator results — 1440 px](../evidence/final_navigator_results_1440.jpg)
- [Local production Pashto/RTL Navigator — 390 px](../evidence/final_navigator_pashto_390.jpg)

The structured-search preview is ready for review after application CI passes. Model-backed capability remains unverified until the owner supplies configuration and live evaluations pass. Production readiness also requires shared limits, native-language review, dependency remediation, isolated authenticated journeys, security-check completion, and explicit approval. Nothing has been merged to main or deployed to production.
