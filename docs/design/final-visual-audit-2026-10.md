# Afghan Hub — forensic visual audit, October 2026

**Status: PARTIAL / BLOCKED. Keep the audit PR draft. No exhaustive visual sign-off.**

Audit date: 2026-10-23. Production was read only. No deployment, hosted account creation, message sending, data/schema/RLS/provider changes or merge was performed.

## Verified current state and approved design

- Fetched latest main: `bd5f04fd8ef8abd68c4a4590b145744996ec7494`.
- Production: same SHA, Vercel deployment `dpl_7MmBMXiW3S3zw2cctG8QGdm71yW8`, https://app.apnbc.ca/.
- Latest Preview at discovery: `2bd2c33053dea5a5fb6b116e06ac0bfd7be4bd60`, deployment `dpl_3m3Zw78y8H6h6pgSJ98z3bTrVaL7`, https://afghan-hub-8raafbr6d-afghan-hub-s-projects.vercel.app/ . This is unmerged PR #527, not main; READY is not visual/auth verification.
- [#526](https://github.com/AfghanistanianHub/afghan-hub-web/pull/526) merged: pre-paint language/direction, information-page and member-chrome localization, sign-out selector contract. Do not repeat it.
- [#524](https://github.com/AfghanistanianHub/afghan-hub-web/pull/524) open/draft at `28c066faa77df1702dfc165881c50451b6108544`. Actual diff includes Saved localization and loading announcements. Avoid duplicate fixes. Its English-only Privacy observation predates #526 and is stale.
- [#525](https://github.com/AfghanistanianHub/afghan-hub-web/pull/525) open/draft at `6511d30aa3b31f45cf57c08a39980098ddc85a7f`. Editorial entrance proposal is not deployed. Do not reimplement it.
- [#527](https://github.com/AfghanistanianHub/afghan-hub-web/pull/527) open/draft: Google/email auth and onboarding changes, with provider/successful-auth blockers. Not audited as main.

Read AGENTS.md, README, source-of-truth documentation, approved-homepage handoff, cross-page-consistency and final-cross-page-quality-2026-10-19 before changes. Historical checks are context, not current evidence. Preserve editorial hero, five circular destinations, global APNBC canvas, approved motion, purpose-specific widths (public approximately 80–82.5rem, member 88rem, form 56rem, auth 32rem), input/border tokens, focus/reduced motion, authorization and business behavior. Exactly en/fa/ps; no separate Dari UI. Technical identifiers remain LTR. Intentional editorial whitespace is not automatically a defect.

## Reproducible browser environment

Sandboxed headless installed Chrome **156.0.8078.47**, existing repository Playwright, Node 24.13.0, macOS; widths **320, 375, 390, 430, 768, 1024, 1280, 1440, 1920**, height 900, DPR1, light mode, reduced motion, en-CA, America/Vancouver. Waited for network idle and document.fonts.ready. Fresh anonymous contexts; Production non-GET/HEAD/OPTIONS requests blocked. Publicly published business/organization content may appear; no private member data or credentials in screenshots.

Full-page and top viewport images per case; pages over 1800px also middle/bottom. Actual rendered boxes record dimensions, padding, gaps, typography, direction, clipping candidates and document width. Decorative SVG overflow and screen-reader-only headings are not automatically findings. No horizontal document overflow does not imply correct composition.

Shared Browser panel automation initially returned Unknown browser profile. Actual capture used external sandboxed Playwright Chrome. Bundled headless-shell install was unsupported on macOS13; no browser version was invented. Local preview was subsequently registered at http://127.0.0.1:3100/.

## Complete source route inventory

41 page source files; route-group directories do not become URL segments. Dynamic expansions and UI/query states are separate cases.

### Public and auth

- `/`: first-visit entrance; returning-home state is separate and not fully approved.
- `/[locale]`: `/en`, `/fa`, `/ps` only.
- `/about`, `/support`, `/privacy`, `/terms`.
- `/explore`: opportunities, businesses, organizations, events; filtered-empty captured; pagination/outage/recovery blocked.
- `/explore/[kind]/[slug]`: four valid kinds above. Actual published businesses and organizations captured. Published opportunities/events blocked: no public fixture.
- `/login`: login; signup is `/login?mode=join`, not `/signup`.
- `/forgot-password`; invalid confirmation/recovery/callback feedback captured. Successful signup/confirmation/recovery blocked.
- `/update-password`: authenticated recovery session required; intended form blocked.

### Members — intended states captured with synthetic personas (see baseline note)

- `/profile`: onboarding and profile editing share this route; no separate onboarding page.
- `/dashboard`, `/network`, `/members/[id]`, `/search`, `/saved`, `/settings`, `/messages`, `/messages/[conversationId]`, `/submissions`.
- Connections/request management are within `/network`; notifications and Community Navigator are shared components, not standalone routes.
- `/businesses`, `/businesses/new`, `/businesses/[slug]`, `/businesses/[slug]/edit`.
- `/organizations`, `/organizations/new`, `/organizations/[slug]`, `/organizations/[slug]/edit`.
- `/opportunities`, `/opportunities/new`, `/opportunities/[slug]`, `/opportunities/[slug]/edit`.
- `/events`, `/events/new`, `/events/my`, `/events/[slug]`, `/events/[slug]/edit`, `/events/[slug]/attendees`.
- `/moderation`, `/moderation/team`: moderation, verification and administrative controls, not a fabricated `/admin` route.

### Handlers, metadata and boundaries

Seven handlers: `/api/account/export`, `/api/assistant/analytics`, `/api/assistant/public-search`, `/api/assistant/search`, `/auth/callback`, `/auth/confirm`, `/events/[slug]/calendar`. Invalid auth redirect UI captured; successful/private/export/calendar/API states not approved. Never include exported private data in evidence.

Metadata: robots, sitemap, Open Graph image, favicon. Inventory only, not a metadata/content-type sign-off.

Nine boundaries: dashboard loading; Explore loading; root error/global-error/not-found; business/organization/member/public-detail not-found. Representative public missing-page/listing screens captured; other individual boundaries/loading/errors blocked pending deterministic fixtures.

## Evidence deliverables and availability

**Full evidence is currently local to this audit workspace. The draft PR does not contain the binary screenshot archive. Do not treat unresolved evidence links on GitHub as published artifacts.** Reviewable report, shared repair and regression runner can be published through the GitHub connector; its file tools accept UTF-8 text, not a local binary directory. Artifact attachment remains a delivery blocker.

Local evidence directory: `docs/evidence/visual-audit-2026-10/`:

- `route-inventory.json`: every source page/handler/boundary, access and blockers.
- `index.html`: filterable route/state/language/width gallery with measurements and blockers.
- `case-register.json`: 2,608 rows containing route, language, viewport, screenshot paths, observed issue, expected behavior, actual measurement, severity, root cause, suggested fix, component and verification status.
- `screenshot-index.json`: all **4,453 images**, review status and validity.
- `measurements.json`: **567 anonymous capture cases** across 21 route/state variants × three languages × nine widths; default/closed document overflow zero. Not a pass claim.
- `private-measurements.json`: **1,026 authenticated capture cases** across 38 route/state variants × three languages × nine widths, all CAPTURED_NOT_SIGNED_OFF, zero BLOCKED. Synthetic disposable personas only; cascade-deleted after capture.
- `interaction-states.json`: **124** menu open/Escape/focus, Navigator goal/topic/long-input and scaling records.
- `header-fix-verification.json`: **27 passing local geometry/interaction cases** after repair.

Selected original entrance/home/header/signup/legal images, six coarse en/fa/ps grids at 320/1440, and selected private dashboard (en/fa 320) plus a ps conversation capture were opened. **Other images are NOT individually visually approved.** Full-page thumbnails cannot certify glyphs/line breaks or micro-spacing. Cases say CAPTURED_NOT_SIGNED_OFF or BLOCKED_DETAILED_IMAGE_REVIEW, not PASS. **864 ledger rows explicitly BLOCKED** for boundaries/handlers/special dialog/success/error/loading states; remaining unreviewed captures also do not constitute visual approval.

## Measured findings and root causes

### V01 — P1 — 320px English public-header controls overlap

Routes: every PublicNavigation consumer, including home, information pages, Explore and public details. English 320×900: selector x=228,width=80,right=308; menu x=266,width=44,right=310; both y=14..58. **42px overlap despite scrollWidth=320**. Screenshot `screenshots/home-en-320-top.jpg` visibly places hamburger over English. Expected separate readable controls and nonoverlapping hit areas.

Cause: stacked max-360/max-359 overrides reset reserved padding while mobile details remains absolutely positioned. Component: `src/components/public/public-navigation.module.css`.

**Fixed locally:** leave mobile details in flex flow with a 44px allocation; remove transformed absolute positioning. 27 width/language checks pass. Production unchanged.

### V02 — P1 — 320px open menu collapses and overflows

Screenshots `state-menu-open-{en,fa,ps}-320.jpg`. Panel width **48px**; English x=266, document width **391**; Farsi x=6,width **363**; Pashto x=6,width **348**, all viewport320. Links spill/wrap into fragments. Expected full-width readable menu below header.

Cause: positioned/transformed 44px details becomes descendant-nav containing block; 24px horizontal padding consumes content space. Same shared component/fix as V01. **Fixed locally:** each language panel x=0,width=320,scrollWidth=320; Escape closes/restores summary focus. No redesign.

### V03 — P2 — English catalogue/detail UI inside fa/ps chrome

Explore four categories, results/empty and public details. fa/ps document direction and nav change while headings/search/empty/actions remain English. Expected localized application copy; original published listing content unchanged. Actual JSON headings retain English text under fa/ps. Cause: hardcoded server-page strings in Explore/detail/helpers. Suggested focused locale-contract slice, no automatic listing translation. **Observed source/browser; not fixed.**

### V04 — P2 — English legal links in translated contact panel

Privacy/Terms/Support fa/ps. `privacy-fa-1440-full.jpg`: translated body/sidebar/footer, but contact links Privacy/Terms/Support remain English. Expected selected language consistently. Cause: InformationPage passes undefined labels.navigation to SupportLinks' English fallback. Suggested shared localized link labels without rewriting legal claims/operator. **Observed source/browser; not fixed.**

### V05 — P2 — 200% text stress overflow

Explicit computed-font doubling: English width320/390 yields scrollWidth443; English1440→1568; Farsi320→339,1440→1474. Expected readable reflow without loss. Fixed allocations require targeted isolation. This is **not native browser text scaling or zoom**. DPR2/720×450 emulation is only a 1440/200%-zoom equivalent, not native zoom verification. Suggested native-resize reproduction then focused geometry fix, never shrinking text to hide it. **Stress finding; not fixed.**

### V06 — P3 — inconsistent small language selectors

English auth320 select88×33px, fa/ps86×37px; public header44px tall; Navigator85×32px with12px type. Expected deliberate readable sizing. Cause: independent py-1/utility rules in AuthBrand, Navigator and header. Suggested scoped sizing review, including coarse pointers and target-size exceptions. Auth fields50px vs submit48px is not by itself a defect. **Measured; not fixed.**

### V07 — P2 — English missing-page/invalid-link feedback

fa/ps root/public-listing not-found and invalid confirmation/recovery/callback. Translated chrome/fields surround English explanations/actions; captured at all nine widths. Expected selected-language recovery guidance, technical identifiers LTR. Cause: hardcoded not-found copy and missing authFeedback keys. Suggested shared system-state localization coordinated with #527, without weakening token/session checks. **Source/browser observed; not fixed.**

## Isolated private-state baseline — resolved without touching Production or migrations

Docker initially stopped; started successfully. Existing local-journey stack restored an older volume, so stopped preserving that volume and created **fresh unique `afghan-hub-forensic-20261023` at127.0.0.1:56321** with repository migrations. Synthetic example.invalid personas signed in through real UI; no hosted credentials/session.

Root cause of the earlier invalid baseline: the Supabase CLI template database does not reproduce Supabase Cloud's ambient table privileges. After a fresh replay, core tables exposed `relacl` entries only for postgres (plus service_role Dxtm leftovers): anon/authenticated held nothing, so every publishable-key read failed at the permission layer before RLS was evaluated, and service_role fixture inserts failed with 42501 (locally it holds no INSERT). This is an environment-fidelity gap, not an app bug: the application reads exclusively through the publishable key (`src/lib/supabase/server.ts`, `src/lib/public-content.ts` — "The publishable key plus anon RLS defines the public boundary"), and RLS policies are granted TO anon/authenticated throughout, so Production necessarily carries those ambient grants; otherwise no page could render there.

Resolution, isolated container only: applied disposable local-only `outputs/forensic-local-grants-20261023.sql` (never a migration, never Production) reproducing Cloud's effective grants — SELECT/INSERT/UPDATE/DELETE to authenticated and service_role, SELECT to anon — while leaving every RLS policy untouched and preserving the deliberate `public.profiles` column-level hardening (no table-level profiles grant). The audit preflight was corrected accordingly: the old `has_table_privilege` assertion was invalid (it ignores column-level grants and RLS), replaced by a behavioral gate — probe user sign-in plus own-profile and published-content reads.

Proof RLS still enforces (disposable matrix, 15/15): service_role fixtures insert; anon reads published but not drafts; owners read own drafts while others see zero rows; private profiles and A-only conversations/messages are invisible to user B; B's update of A's business affects zero rows; A reads its own messages. Zero auth users and zero synthetic rows remain (cascade delete verified). **1,026/1,026 private captures are intended-layout evidence, zero BLOCKED.**

Unique stack stays running only for local preview. Stop after review with `supabase --workdir "$LOCAL_QA_DIR" stop --no-backup`; stop only the identified owned server, never unrelated listeners. No old volume deletion.

## Prioritized correction and completion plan

1. Review V01/V02 isolated shared CSS fix and 27-case browser proof; preserve brand/routes/approved hero/canvas.
2. Baseline resolved locally with RLS proof above. Remaining private work: owner/nonowner/moderator/admin/unauthorized variants beyond the captured default states, RSVP transitions, long-content forms, messaging edge states and dialogs — each still explicitly BLOCKED until exercised. Do not accept login/404 as page evidence.
3. Attach complete screenshot archive and machine-readable register to the PR; finish individual micro-level review at all widths/languages. Current coarse review is not exhaustive approval.
4. Focused P2 locale slices: catalogue/details/system states/contact links; coordinate Saved/loading with#524 and auth/onboarding with#527. Do not repeat merged#526.
5. Capture valid confirmation/recovery/success, loading/error/recovery, public Navigator retrieval/empty/error (Production mutations blocked), pagination, date pickers, confirmation dialogs, normal motion, native200% text/zoom, real-device safe areas. Each has explicit BLOCKED rows until exercised.
6. Qualified native Farsi/Pashto reviewers must approve shaping/natural line breaks/copy; automated font load/direction checks are insufficient.
7. P3 selector consistency and spacing corrections only when evidence shows accidental composition, not intentional editorial whitespace. No unrelated redesign.

## Validation and reproduction

- npm ci passed; lockfile unchanged. Reports14 inherited vulnerabilities:4 moderate,9 high,1 critical; no unrelated dependency upgrade.
- ESLint0 errors,8 inherited warnings; TypeScript passed.
- Node suite461 passed,0 failed,1 skipped (462 total).
- Next production build passed; compiled/generated33 static pages.
- Runner syntax, git diff whitespace, required case-field schema and all4,453 indexed image paths verified; private register regenerated after baseline resolution (2,608 ledger rows, 864 explicitly BLOCKED for boundaries/handlers/special states).
- Shared-header repair:27 actual Chrome cases pass all nine widths × en/fa/ps; mobile open/closed, no overlap/overflow, full panel width, links≥44px high, Escape/focus.

QA scripts in scripts/qa/: forensic-visual-audit, forensic-visual-states, forensic-private-audit, forensic-local-server, forensic-header-check, forensic-audit-register (.mjs). Supply an existing Playwright module via AUDIT_PLAYWRIGHT_MODULE; no app dependency added. Public runners are read-only Production; local runners reject non-loopback/wrong stack identity. LOCAL_QA_DIR points to the unique disposable stack, never hosted credentials.

**Acceptance: NOT APPROVED as an exhaustive completed audit.** Public evidence, 1,026-case private intended-state evidence and the safe shared fix are reviewable. Full image-by-image review, special dialog/success/error/loading states, hosted Preview verification and artifact publication remain BLOCKED. Keep draft; do not deploy or modify Production.
