# Afghan Hub visual roadmap

Updated 2026-09-30. Visual/frontend UX only; preserve working functionality.

## Completed landing milestone — PR #337
- Replaced floating cards with an airy circular discovery menu: community center, four curved lavender/peach/gold surfaces, horizontal labels and fine geometric detail.
- Hover and keyboard focus show the requested icon/title/description; stable semantic link hit regions, visible focus, default reset, reduced-motion support and no live announcements.
- Compact container-based layout preserves all four destinations on phones and enlarged text. Reserved center/text space prevents interaction-driven layout shifts.
- Existing routes: People `/network` (member directory), Organizations/Events/Opportunities via their existing Explore category queries. One-tap navigation verified.
- Preserved headline, CTA structure, all lower landing sections and shared server-rendered listing artwork. No dependency/workflow/auth/data/config changes.
- Production-rendered sandboxed Chrome at 320/375/768/1024/1440/1920px: no horizontal overflow; four usable destinations; zero axe WCAG AA violations. Hover/focus/reset, ring gaps, stable center/labels, touch routes, reduced motion and 200% text/reflow passed. Screenshots visually reviewed, including Organizations hover.
- Node 22/24: 195 tests each, zero failures/skips; lint/type/build and Vercel success. Verified code `e0671b87f07d32b8c82157cce1c7c08ec0ab9653`; workflow 36787338094.

## Next task
Review the focused landing PR, then inspect Explore/search/category states and public detail hierarchy using the existing browser harness. Refine observed visual/UX gaps while preserving behavior.

No implementation blocker. Native browser tools remain unavailable; CI supplied actual browser evidence. Protected preview requires Vercel login; authenticated production-data flows were not tested. No automatic merge/production deployment.
