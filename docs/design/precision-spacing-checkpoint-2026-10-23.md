# Precision spacing — initial implementation checkpoint (2026-10-23)

This is a **partial, draft** implementation of the precision design-system brief, not a completed visual audit.

## Verified baseline
- `AGENTS.md` requires checking the installed Next.js guides before Next-specific source edits. This change does not touch Next APIs.
- The latest checked-in audit is `docs/design/final-cross-page-quality-2026-10-19.md`; its paired browser work and remaining limits must not be reclassified as proof for this revision.
- Existing global tokens already cover colors, control heights, fonts, radii and surfaces. Member list/profile pages share an 88rem container with responsive gutters; purpose-specific auth, details and forms remain narrower.
- The approved Hero, APNBC canvas, page motions, language entrance, member page header and routing were left unchanged.

## Token/component change log

| Surface | Change | Rendering impact |
| --- | --- | --- |
| `src/app/globals.css` | Define `--space-1/2/3/4/6/8/12/16/24` as 4/8/12/16/24/32/48/64/96px | None yet: reference tokens only; existing component spacings remain |
| `tests/member-page-container-regression.test.mjs` | Assert spacing token values and the established member width | Test only |
| Shared catalogue filters | Stack controls into a single column below 640px; restore two columns at the `sm` breakpoint and existing first-label spanning at `md` | Real layout adjustment; requires new responsive screenshots before approval |

## Gate before completion

1. Review recent merged design work and obtain accessible paired screenshot artifacts, including the exact audited source SHAs.
2. Collect specific defects per route/state (element selector, screenshot, viewport, locale, root cause, approved corrected measurement). Do not change spacing merely for uniformity.
3. Implement the smallest shared-component adjustments, preserving existing purpose-specific widths and intentional empty states. Log every touched component and reason.
4. Capture **new** before and after screenshots of each changed context at 390, 768, 1280 and 1440 CSS px, including English and RTL, and manually inspect.
5. Run lint, typecheck, full tests, production build, horizontal overflow, keyboard, touch and axe checks. Record exact commit SHA and run links; check results rather than assuming pass.
6. Only mark specific audit findings resolved after browser proof; otherwise leave PR draft. Do not merge or deploy based solely on tokens or stale screenshots.

## Not yet completed
A narrow-screen catalogue filter grid correction was made from source inspection. No new browser captures, full lint/type/build validation or final approval were performed for this branch. Existing evidence is historical, not proof of this commit.
