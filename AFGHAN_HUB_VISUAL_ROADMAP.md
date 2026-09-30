# Afghan Hub visual roadmap

Updated 2026-09-30. Visual/frontend UX only; preserve working functionality.

## Completed landing milestone — PR #337
- Verified current repository and reconciled the older local draft with main.
- Connected ecosystem hero; shared geometric SVG/CSS covers; public indigo/coral/gold palette; 44px header targets.
- Content-sized rows support enlarged text; caption backing prevents decorative lines crossing text.
- Preserved pathways, pulse, metadata, listing states and account/discovery links.
- Actual sandboxed Chrome: 320/375/768/1024/1440px; zero overflow/occlusion/axe AA violations; keyboard, reduced motion, enlarged text/reflow and category navigation pass.
- Hero and populated mobile-card screenshots visually reviewed.
- Both Node 22/24 CI: 195 tests, zero failures/skips; lint/type/build/Vercel pass. Evidence code commit: 684fdb3b9047af7c497775bda4ad9a63fdf37b39.

## Next milestone
After the focused landing PR is accepted, inspect Explore/search/category states and public detail hierarchy. Reuse the artwork and verify the full responsive browsing flow; change only observed UX gaps.

No landing QA blocker remains. Local browser tools still fail, so use the existing Linux CI browser harness. Preview requires Vercel login. No automatic merge/production deployment.
