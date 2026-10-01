# Afghan Hub visual roadmap

Updated 2026-09-30. Visual/frontend UX only; preserve working functionality.

## Completed — approved geometric landing, PR #337
- Implemented the approved warm-neutral composition, restrained violet, calm typography and original geometric community hero. Slightly stronger key strokes; removed duplicate arch and excess base-plane guides.
- Replaced the rejected wheel with four illustrated discovery panels. People keeps the nine-node network with thin head-and-shoulders glyphs, violet/white main person, warm-gray surrounding people and two small accents. Connections remain behind opaque glyph backings.
- Server-rendered reusable SVG/React components; CSS hover borders/link cues and visible keyboard focus; reduced-motion support. Deleted the obsolete circular client component; no added dependencies or client interaction bundle.
- Existing People/member directory, Explore categories, join/sign-in, business catalogue, lower pathways/pulse/listings and metadata preserved. Public warm canvas applied explicitly; member palette unchanged.
- Actual sandboxed Chrome production renders at 320/390/768/1024/1440/1920px visually reviewed. No horizontal overflow; four usable 44px+ links; nine person glyphs; populated lower listings; zero axe WCAG AA violations. Keyboard/skip/focus, stable hover, reduced motion, 200% text/reflow and all four physical single-tap routes passed.
- Node 22/24 each passed 195 tests with zero failures/skips; lint/type/build and Vercel passed. Verified code `88cd3e52452c9e76e49ccbaeea4f274729b9ddca`; workflow 36796427184.

## Next task
Review the implemented screenshots/current PR, then inspect Explore and public detail hierarchy using the same browser harness. Refine observed visual/UX gaps only. Do not revive the superseded circular/orbital direction or merge/deploy automatically.

Native local browser tools remain unavailable; CI supplied actual browser evidence. READY preview verified at https://afghan-hub-qkdxwivv6-afghan-hub-s-projects.vercel.app; temporary 23-hour access available through Vercel connector. Remote authenticated HTML/live data not verified. Authenticated member/live-data flows were not tested; no required visual verification remains blocked. No production deployment.

Latest interaction completion: each discovery panel is one full-surface semantic link with labelled heading/description; CTA structure and all approved artwork remain unchanged. Added subtle press feedback and full-panel visible keyboard focus. Actual browser checks passed hero mouse press/navigation, Join and Events Enter activation, Organizations artwork click, and four one-tap destinations. Existing routes: `/network`, `/explore?type=organizations`, `/explore?type=events`, `/explore?type=opportunities`; hero `/explore` and `/login?mode=join`. Live production https://app.apnbc.ca/ remains unchanged.
