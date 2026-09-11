# Afghan Hub current state

## Stage
Public entry point and privacy-safe community discovery implemented on `feature/public-community-entry`; PR #51 is open; public entry checks passed, with sitemap follow-up validation in progress. Repository and exact-SHA checks remain authoritative.

## Baseline
`main` at `d2dc4c5e3f7fd11edcf6470ce5cf959db0887f4c` includes design PR #49 and mobile navigation PR #50. Node CI and Vercel were verified successful for that SHA before this work.

## Current changes
- `/` is public; authenticated home moved intact to `/dashboard`. Login, onboarding, callback defaults, and member home links follow the move.
- Public layout, mission page, `/explore` category browsing/search/pagination, and `/explore/[kind]/[slug]` details for opportunities, events, businesses, and organizations.
- Cookie-independent anonymous client, explicit public field selections, published-only filtering, no-store reads, bounded queries, and honest empty/error states. No member-profile exposure or database changes.
- Join mode reuses existing signup action; member routes retain their authenticated layout and are marked noindex.
- Added a canonical public-page sitemap and robots route; these routes do not refresh member sessions or query member data.
- Fixed the self-referencing font token to use the existing Geist font.

## Verification
Production read-only policy inspection confirmed RLS on all four listing tables. Rollback-only anon queries saw published rows and zero unpublished rows. Regression coverage includes public data boundaries, expiration filters, pagination, route matching, and sign-in destinations. Desktop/mobile/tablet rendering and public search/detail flows have been inspected locally.

## Next
Finish PR validation and exact-head CI/preview checks, then perform post-merge checks if merged. Continue launch hardening: public content editorial review (some existing published descriptions contain test or N/A text), legal/policy pages based on owner-approved details, expanded published-detail sitemap coverage, authenticated end-to-end QA, and privacy-safe member discovery if desired.
