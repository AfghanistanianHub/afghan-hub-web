# Cross-page design consistency review

Base source: `472a4dda64204b68f47957b4769f963fa97add1a` (PR #490 after typography lab #496).
Review branch: `audit/cross-page-consistency`; stacked draft PR #497. No edits are pushed to the concurrent #490 branch.

## Findings and focused fixes

Source review is backed by the baseline screenshots from run 38515523799: 39/39 browser journeys, 14/14 API/RLS scenarios, 208 viewport checks, zero horizontal overflow. Desktop and 320px screenshot grids and Persian Navigator were inspected; the complete after image review remains pending.

| Finding | Before evidence | Focused correction |
| --- | --- | --- |
| Navigator surface diverges from forms/directories | `homepage-navigator.module.css`: hard-coded lavender borders, almost-white translucent background, 26px panel/30px field radii; shared form controls use `--radius-control` | Use existing card, border, input, secondary, surface shadow and radius tokens; keep Navigator composition and behaviour |
| Navigator type differs across public/member contexts | Homepage headings use Georgia, member drawer uses the shared sans; prompts/utilities are 10–12px versus 14px workspace controls | Shared 14px control and 12px caption tokens; sans UI headings; retain existing Persian/Pashto font overrides |
| Native-script field font overrides touch sizing | Native homepage Navigator overrides input to a 14px minimum; language selector is 10px | Input/selector 16px; consistent 44px utility targets and 48px fields |
| Authentication identity changes during recovery | Login renders an A mark and branded focusable link; both password pages render text-only links | Shared server-rendered AuthBrand across login/signup/recovery/update-password, 44px link, common main landmark |
| Public navigation has smaller text and hit areas | Navigation/footer text 12px; footer links 28px desktop/36px mobile | 14px type and 44px targets, token borders and control radius; preserve approved public logo |
| Search/member chrome has inconsistent translucent styling | Search form and member header use backdrop blur; event date/opportunity type badges do too; shared listing cards are opaque | Opaque token backgrounds and remove blur on those task surfaces; Search heading uses shared subtle surface shadow |
| Recovery content is unnecessarily cramped at 320px | Recovery inner horizontal padding is 28px in addition to outer gutters | 20px inner padding below the existing tablet breakpoint |
| Locale regression harness references an obsolete module | Baseline tests fail on actual `@/lib/i18n/site-language` import, expecting removed Dari helper | Load the current shared module; retain all locale/resource/preference assertions |

## Layout decisions retained

Purpose-specific widths remain: public content around 80rem; member shell capped at 88rem; listing forms around 56rem; focused auth panel 32rem. Conversation and directory layouts stay distinct. Homepage Hero, spacing, approved motion, five categories and global canvas are preserved. No dependency was added to the application lockfile.

## Evidence method

The existing real-browser fixture runner builds both sources against one disposable loopback Supabase stack. It creates synthetic users, signs in through real forms, asserts requested member routes, and cleans up IDs/stack. Captures use 1440, 768, 390 and 320 CSS pixels, DPR 1, 100% zoom. Full-page PNGs plus JPEG review copies and `index.html` are in the workflow artifact. The before source is pinned, independent of future branch movement. Missing captures are explicitly unavailable.

The expanded review adds Search, Saved, Settings, Home, Explore, listing detail/edit/public-detail pages; captures onboarding, moderation, date dialog, notifications, empty/filtered/outage/recovered surfaces; exercises Navigator keyboard containment/Escape, reduced motion and English/Persian/Pashto. axe-core 4.11.0 is installed only in runner temporary storage with install scripts disabled. It records WCAG-tagged violations and incomplete checks rather than pretending automation certifies accessibility.

## Validation status

Local: type check and production build pass; 401 tests pass with the existing CI-only browser test skipped. Lint has three pre-existing warnings. Baseline locale tests initially failed until the loader correction above. The expanded baseline run passed at 74c2cd8147b6d5b078d2617c6993d625ffd3fffe (application code identical to pinned 472a4dd). Final candidate browser/API, expanded full-page inspection and axe results remain pending, not claimed as passed.

Local Chrome could not launch because this container blocks its required socket; local Docker and Supabase CLI are absent. The isolated CI runner provides those capabilities. No hosted credentials, secrets, Production data, billing, provider calls or Production deployment are used.

## Remaining verification boundaries

Native-speaker copy/typeface review, external SMTP and cross-device confirmation, hosted authenticated smoke and live model-provider behaviour remain unverified. Admin team mutations are outside the existing fixture run; read-only admin/team pages are captured. Transient loading states are not yet comprehensively captured. Manual screen-reader behaviour is not certified by axe. Additional limits will be updated from the completed run and image inspection.
# Cross-page consistency review

Baseline: `dad64a27c09aebb32651149b5e33f8bf2534703f` (PR #490 head observed 2026-10-14). Isolated branch preserves that candidate, including typography lab and role acceptance work. No homepage Hero, motion, global background, category, authorization or database changes.

## Source-backed inconsistencies and focused fixes

| Surface | Observed source evidence | Change |
| --- | --- | --- |
| Search / Moderation vs directories | Search and Moderation h1 used bold 48px desktop text; `MemberPageHeader` used medium 30px. Intro panels used a 55px shadow and blurred colour disks. | Shared `workspace-heading` and `workspace-surface` utilities; 30px medium headings, subtle token shadow, quieter padding. Decorative intro disks removed. |
| Search controls | Search form used translucent `bg-card/88` and `backdrop-blur`. | Opaque card token, without blur. |
| Navigator vs page shells | Navigator used independent violet/white hex colours, a 26px radius and Georgia heading; page shells use shared surface/colour/font tokens. | Card, border, input, muted, primary and secondary tokens; shared card radius, shadow and sans heading. Native Persian/Pashto heading overrides preserved. |
| Navigator control legibility | English search text was 12px, example text 11px, utility text 10px. | Search input 16px in all three languages; examples/actions 14px; small metadata/utilities 12px. |
| Visual verification coverage | Harness primarily captured 1440/390 and omitted Search, Saved, Settings, all detail/edit and public-detail routes. | 1440/768/390/320; additional task routes; published synthetic owner detail/edit/public detail fixtures; independent synthetic admin for Moderation. Paired baseline builds use identical loopback fixtures. |

These are source findings. They must be reconciled against actual rendered before/after images before declaring the complete visual audit finished.

## Evidence production

The isolated acceptance workflow runs two complete browser/API/RLS jobs. Design branches build the pinned baseline separately with the same disposable loopback Supabase target. The browser harness writes before/after PNGs, source revision/tree metadata and observations. `scripts/qa/design-gallery.mjs` creates a standalone `reports/visual/index.html` with viewport filtering and paired images. Missing/partial captures remain marked, not implied passing. Download the workflow artifact and open that HTML alongside its images.

The harness checks horizontal overflow, requested member route identity, global canvas, headings, a native Tab target and reduced-motion media emulation. Persian and Pashto Navigator captures use actual RTL attributes. This is focused accessibility evidence, not a full WCAG audit. Screen-reader review, comprehensive keyboard traversal, contrast automation and every dialog state are not established by these checks.

## Local validation

- ESLint: zero errors, three inherited unused-variable warnings.
- TypeScript: passed.
- Unit suite: 402 total; 401 passed, zero failed; one existing platform-specific skip.
- Production build: passed.
- Runner syntax and diff whitespace: passed.

## Unverified until workflow evidence is inspected

Actual rendered cross-page comparisons and new 320/tablet checks; create/edit form lower sections; public details; admin pages; all interactive modal states, notification variants, loading skeletons, error/recovery variants beyond existing acceptance scenarios; complete keyboard navigation and native-language reading review. Local Docker/Chrome are absent. Do not substitute old `337b23b` evidence for the new revision.

No merge, Production deploy, secret write, paid provider call or production data mutation is authorized by this review.
