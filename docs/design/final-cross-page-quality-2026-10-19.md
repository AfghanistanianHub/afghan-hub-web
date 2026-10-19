# Final cross-page quality — audit in progress

Baseline: b7310c3978d431e76de550a23f9b171fdab8c4fa (current main inspected 2026-10-19 UTC). PR #508 is merged. This document is a checkpoint, not release approval.

## Targeted corrections

- Dashboard, Search, Saved, Settings, Messages, Moderation and My Events now reuse PR #508's 88rem container and responsive gutters. Detail/conversation/form columns retain task-specific widths.
- Dashboard introduction and metadata separators use logical inline spacing for RTL.
- Shared catalogue actions have explicit 44px minimum height, control radii and inline icon alignment. Heading actions can shrink and wrap.
- Homepage Hero, language entrance, canvas, scroll motion, business logic and schema are untouched.

## Audit ledger

“Source reviewed” does not mean browser accepted. No private route has been manually browser-approved in this session.

| Routes / surfaces | Findings / status |
| --- | --- |
| /, /en, /fa, /ps | Approved composition preserved. Expanded CI capture matrix includes localized entry routes; candidate screenshots pending. |
| /about | Production at 390px: no horizontal overflow; English body remains when navigation is Farsi. Localization gap remains. Header language selector successfully changes navigation language. |
| /explore, public listing details | Existing fixture harness captures these; current candidate review pending. |
| /support, /privacy, /terms | Added to automated capture inventory; review pending. |
| /login, join mode, /forgot-password, /update-password | Existing harness interactions/captures retained; current candidate review pending. |
| /profile (onboarding and editing) | Existing synthetic onboarding scenario retained; current candidate review pending. |
| /dashboard | Source reviewed; inconsistent 1500px inner container and physical left spacing corrected. Authenticated browser review pending. |
| /search, /saved | Source reviewed; inconsistent 5xl outer width corrected. Authenticated browser review pending. |
| /settings | Source reviewed; inconsistent 6xl outer width corrected. Authenticated browser review pending. |
| /network, /members/:id | PR #508 shared container preserved. Authenticated browser review pending. |
| /businesses, /organizations, /opportunities, /events | Shared container preserved; catalogue action styling corrected. Existing filtered/empty/populated/outage/recovery scenarios retained. Browser review pending. |
| Catalogue create/edit/detail routes | Existing published synthetic fixtures and capture inventory retained. Browser review pending. |
| /events/my | Source reviewed; shared container added and route added to captures. Browser review pending. |
| /events/:slug/attendees | Not audited; attendance management remains an explicit coverage gap. |
| /submissions and application management | Existing owner lifecycle scenarios retained; application-management visual states remain unverified. |
| /messages, /messages/:id | Source reviewed; inbox container standardized; conversation layout preserved. Existing real messaging scenarios retained. Browser review pending. |
| Notifications | Existing notification interaction scenarios retained; full visual state inventory pending. |
| /moderation, /moderation/team | Moderation width standardized; synthetic admin captures retained. Browser review pending. |
| Community Navigator | Existing keyboard/RTL/reduced-motion scenarios retained. Whole-application Farsi/Pashto coverage is not established by Navigator captures. |

## Evidence infrastructure

Design workflow now targets main and the former integration branch, restricted to this final-quality branch family. Pinned before build is the actual baseline above. Captures add 1280px to 1440/768/390/320, localized entry, legal/support and My Events routes. Gallery now uses recorded baseline metadata rather than a stale hard-coded SHA and includes standalone state captures as after-only evidence. Mobile axe WCAG-tagged violations/incomplete checks are written to accessibility-after.json for review; the job does not equate collecting issues with passing accessibility.

The fixture runner signs in real synthetic users against a disposable loopback Supabase stack. This environment has no Docker, Supabase CLI or local Chrome executable; CI is required for that runner. No hosted credentials or production mutations were used.

## Local checks

- TypeScript: passed.
- ESLint: zero errors, six warnings.
- Unit tests: 445 passed, one platform-specific skip, zero failures (446 total).
- Production build: passed.
- Browser runner / gallery syntax and whitespace: passed.

## Remaining acceptance gates

Inspect candidate before/after evidence, resolve observed UI/a11y defects, inspect all private routes including attendance/application management and loading/error states, capture application-wide RTL with longer native content, verify focus/keyboard/touch/contrast manually, and confirm a reachable authenticated Vercel preview. Screenshot collection is not pixel-difference regression approval. This work must remain draft until those gates pass.
