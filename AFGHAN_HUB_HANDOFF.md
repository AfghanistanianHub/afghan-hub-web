# Afghan Hub visual handoff

Updated 2026-09-30. Approved geometric landing implemented and verified; no merge/production deployment performed.

## Current work
Repository: https://github.com/loadsnft/afghan-hub-web
PR: https://github.com/loadsnft/afghan-hub-web/pull/337
Branch: `design/connected-community-hero`; base main `419e11c92f8bd4cd0d5e7e00008a5b11fe222086`.
Verified application code: `88cd3e52452c9e76e49ccbaeea4f274729b9ddca`. A documentation-only follow-up may advance head; verify current PR/checks on continuation.
Preview: https://afghan-hub-web-git-design-connecte-979249-afghan-hub-s-projects.vercel.app (protected stable alias). Verified immutable preview: https://afghan-hub-qkdxwivv6-afghan-hub-s-projects.vercel.app — deployment `dpl_5HgymYiBD5rjii9LGFGJZQpcnwnq`, READY, verified code above. Vercel connector can generate a temporary 23-hour share link without changing protection; never persist the share token.

The user approved the geometric mockup and superseded all wheel/orbital directions. `community-illustrations.tsx` supplies five original server-rendered SVG illustrations. The hero keeps approved warm canvas, balanced headline/CTAs, violet, neutral borders and drawing-led depth; duplicate arch/grid overlaps simplified. `DiscoveryPanels` has People, Organizations, Events and Opportunities with existing direct routes. People preserves its network/lines, replaces dot nodes with nine consistent person glyphs, and uses opaque warm backings so connections cannot cross the icons. Main person is white on violet; surrounding strokes warm-gray with two restrained details. Hover/focus use CSS; panels do not move; reduced motion supported. Obsolete circular client component removed.

`landing.module.css` and discovery panel CSS implement one/two/four-column responsive composition. Heading IDs avoid legacy catalogue selectors. Public header retains working navigation on mobile; lower pathways/pulse/listing feeds, business routes, listing cover artwork, metadata, auth/data rules and member palette preserved. No dependencies, workflows or production configuration changed.

## Verified checks and evidence
Local lint/type checks passed; 27 local tests passed, with the Linux-only browser test explicitly skipped. Existing unrelated unused `_userId` lint warning remains.
Full Node 22/24 CI each passed 195 tests with zero failures/skips; lint/type/build passed, Vercel succeeded. Evidence workflow 36796427184; Node 24 job 110160810233, Node 22 job 110160809988.
The browser harness builds/runs the actual production app with GET-only loopback public-content fixtures and sandbox-enabled Chrome (Seccomp-BPF verified). At 320/390/768/1024/1440/1920px: no horizontal overflow, four reachable 44px+ destinations, all nine person glyphs, twelve populated listing cards, zero axe WCAG AA violations. Real keyboard/skip/visible focus, physical pointer hover with stationary panel geometry, reduced-motion arrow suppression, 200% text resizing/reflow and all four single-tap routes passed; no uncaught browser exceptions. Final screenshots visually inspected at every width plus People focus.
Screenshot review caught missing explicit warm canvas; fixed and reran verification. The pointer test caught hover media gating in headless Chrome; corrected and final runs passed. Report only final successful evidence above.

## Limits / continuation
Native local browser tools remain unavailable; CI resolves required browser verification. These are actual app screenshots, not SVG mockup renders. Browser data is local QA fixtures, not production content. Authenticated member directory/live-data flows were not exercised. Temporary preview sharing is available through the Vercel connector. Deployment metadata verified; protected server fetch returned an authentication redirect, so remote authenticated HTML/live-data behavior is not claimed.
GitHub connector works; do not request CLI sign-in. Local `work/afghan-hub-current` snapshot has synthetic history and must not be pushed as repository history; use authentic remote Git trees/parents. Current-state context retained. Screenshot markers are in Node 24 logs, with final user-facing captures/report in this chat's outputs directory.
Next task: review current PR/screenshots; then inspect Explore/detail responsive hierarchy and refine only observed gaps. Do not merge/deploy automatically.

Latest interaction completion: each discovery panel is one full-surface semantic link with labelled heading/description; CTA structure and all approved artwork remain unchanged. Added subtle press feedback and full-panel visible keyboard focus. Actual browser checks passed hero mouse press/navigation, Join and Events Enter activation, Organizations artwork click, and four one-tap destinations. Existing routes: `/network`, `/explore?type=organizations`, `/explore?type=events`, `/explore?type=opportunities`; hero `/explore` and `/login?mode=join`. Live production https://app.apnbc.ca/ remains unchanged.
