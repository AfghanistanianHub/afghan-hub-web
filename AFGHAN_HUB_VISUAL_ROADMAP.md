# Afghan Hub visual roadmap

Updated 2026-09-30. Visual design/frontend UX only; preserve existing functionality.

## Landing milestone
- Verified current main: `419e11c92f8bd4cd0d5e7e00008a5b11fe222086`; Vercel status successful; no open PRs at start.
- Implemented connected people/organizations/events/opportunities hero with linked business path, reusable SVG/CSS covers, public-scoped indigo/coral/gold palette and larger header touch targets.
- Preserved community pathways, pulse, listing data/empty/error states, metadata and all existing destinations.
- Checks passed: lint (one existing warning), TypeScript, build, 27 relevant regression tests, HTTP/rendered-link smoke, new text-color AA contrast calculations.
- Added sandbox-enabled browser QA to the existing Linux test step, with a local-only content fixture and screenshot evidence; executed successfully on both Node 22/24 (195 tests, zero skips). Hero rows now grow with text to prevent occlusion.
- Passed in actual sandbox-enabled Chrome: 320/375/768/1024/1440px; zero overflow/occlusion/axe AA violations; keyboard, 200% text/reflow, reduced motion, populated listing covers and category navigation. Mobile/tablet/desktop screenshots inspected.
- Follow-up: improve caption backing over connection lines and inspect a populated-card screenshot; verify final-head CI.

Review artifact: draft PR #337; Vercel code build passed. Preview is protected by Vercel login from this session.

## Next
Confirm final caption/card evidence, then refine discovery/detail visual consistency using the same artwork.

Local browser remains unavailable; CI browser QA supplies the verified evidence. No production deployment or merge authorized/performed.
