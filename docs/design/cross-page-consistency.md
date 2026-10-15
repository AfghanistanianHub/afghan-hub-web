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
