# Approved Afghan Hub homepage — review handoff

## Baseline and safety

The isolated branch `feat/approved-community-homepage` starts at main commit `a22a4786f948029257228c56b390d7f1d1668d58`. Recovery PR #483 was merged and restored the public homepage files from the last READY revision. Its Vercel check passed, but its Node 24 build check failed and the Node 22 check was cancelled. A fresh local dependency installation, production build and existing test suite established a working baseline before homepage changes. No additional recovery patch was necessary.

This implementation does not merge to main, release to production, change database schema/policies, or write production records. Other local branches and their changes were preserved. Vercel deployment enumeration was denied by the connected team scope; hosted status is assessed from PR checks and preview comments instead.

## Implementation

The supplied approved image informs the ivory, editorial composition and restrained purple accents. The homepage includes the exact hero headline, five real circular network destinations, responsive navigation, a compact Navigator, Discover–Connect–Participate–Grow orientation, real public listing previews, goal-based journeys, qualitative community value, a final invitation and genuine footer destinations. Stories are omitted because no authorized story content was supplied. No community statistics, testimonials or identities were invented.

The existing root APNBC dots-and-lines background is preserved as the sole ambient particle system. The hero uses lightweight SVG and CSS with equivalent hover/focus emphasis, short entrance timing and reduced-motion rules. An obsolete global CSS rule that forced public sections into unrelated grids was removed; homepage styling remains scoped.

The existing member Navigator, authentication, dashboard, messaging and notification infrastructure remain in place. Public retrieval extends the existing anonymous reader using opt-in, escaped, bounded filters; ordinary catalogue queries preserve their existing behavior.

## Navigator capability and boundaries

The public beta works without model credentials. It reuses existing intent/context utilities for bounded keyword catalogue discovery, supports multiple public areas, guided choices/free text/back/skip/restart, session-only history, refinements, loading/retry/error/empty states, typed response validation and real internal result links. Its disclosure explicitly identifies structured search rather than a model-backed assistant.

The endpoint uses published/current public listings through anonymous Supabase RLS even for signed-in visitors. It never queries member profiles or uses a service-role key. Read-only policy inspection confirmed RLS on all five relevant tables, published-only anonymous listing access and no anonymous profile policy. People journeys clearly lead to the existing member sign-in boundary.

Requests have same-origin validation, bounded streaming bodies, strict input/output schemas, bounded retrieval and a per-instance request/concurrency limit. Logs record duration/counts without user query text. Retrieved content is rendered as plain text, never interpreted as instructions. A shared edge/WAF limit is still required for high-volume production use.

English, Dari, Persian and Pashto Navigator controls and RTL/LTR layout were browser checked. Dari currently shares Persian UI copy with a distinct language tag. Native-language editorial review and broad multilingual natural-language understanding are not verified. Public listing text stays in its original language. Province/geographic aliases, exhaustive catalogue ranking and general semantic interpretation require further work; only bounded matching against available city/country/content fields is implemented.

## Validation

- Clean dependency installation and baseline production build passed.
- Latest full test run: 326 tests, 325 passed, 1 Linux-only browser suite skipped locally, 0 failed.
- Final ESLint: 0 errors; 7 pre-existing dashboard/profile warnings.
- Migration Data API grant guard passed; agent orchestrator syntax check passed.
- Six actual browser widths checked: 320, 390, 768, 1024, 1280 and 1440 px. No horizontal overflow; all five hero links have comfortable hit areas.
- Automated axe WCAG A/AA checks returned 0 violations at those six widths; initial, guided and expanded-result states were also inspected. This is scoped evidence, not a complete accessibility certification.
- Actual published catalogue results were verified, including Fera Media in Vancouver. Guided back/skip/restart, repeatable Arts & Culture pathways, mobile menu Escape/focus return and four language direction controls were exercised.
- Screenshots are saved under `docs/evidence/approved-homepage/` in the local review workspace. The embedded preview recorder returned no compositor frames, so no successful video recording is claimed.
- No designated test accounts were provided. Authenticated onboarding, account changes, connection lifecycle, messaging, notifications and sign-out were not exercised against production.

## Release gates

This is ready for visual and functional review, not approval for an unrestricted production release. Hosted CI and preview checks must pass. A model-backed, permission-aware orchestration layer is not configured; the beta must retain its honest structured-search labeling. Shared rate limiting, native-language review, isolated authenticated journey verification and dependency remediation remain release gates.

The inherited production dependency audit reports 2 high-severity runtime transitive findings (`sharp` and `source-map-js`). Dependency upgrades are deliberately kept out of this homepage change and must be resolved in a separate verified patch. The total installation audit also includes development dependency findings.
