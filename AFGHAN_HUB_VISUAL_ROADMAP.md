# Afghan Hub visual roadmap

Updated 2026-09-30. Visual design/frontend UX only; preserve existing functionality.

## Landing milestone
- Verified current main: `419e11c92f8bd4cd0d5e7e00008a5b11fe222086`; Vercel status successful; no open PRs at start.
- Implemented connected people/organizations/events/opportunities hero with linked business path, reusable SVG/CSS covers, public-scoped indigo/coral/gold palette and larger header touch targets.
- Preserved community pathways, pulse, listing data/empty/error states, metadata and all existing destinations.
- Checks passed: lint (one existing warning), TypeScript, build, 27 relevant regression tests, HTTP/rendered-link smoke, new text-color AA contrast calculations.
- Added sandbox-enabled browser QA to the existing Linux test step, with a local-only content fixture and screenshot evidence; awaiting execution. Hero rows now grow with text to prevent occlusion.
- Pending: actual browser checks at 320/375, 768, 1024 and 1440px; keyboard, 200% zoom, reduced motion and populated listing covers. Source-level responsive/accessibility review is not a visual pass.

Review artifact: draft PR #337; Vercel code build passed. Preview is protected by Vercel login from this session.

## Next
Finish browser QA on the draft preview and resolve any layout issues before marking the landing milestone complete. Then refine discovery/detail visual consistency using the same artwork.

Blocker: native browser initialization and normal Chrome launch fail in this session. No production deployment or merge authorized/performed.
