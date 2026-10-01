# Afghan Hub visual roadmap

Updated 2026-09-30. Visual/frontend UX; preserve working functionality. Production unchanged.

## Implemented
- Approved warm canvas, restrained violet, calm typography and original geometric landing illustration. People network retains nine person glyphs, violet/white main person and warm-gray neighbors. Existing CTAs and full-panel links preserved.
- Discovery illustrations respond to hover/focus through sequenced connections, module convergence, gathering paths and branching-route highlights. Reversible 320–520 ms feedback; stable hit areas, first-tap navigation and static reduced motion.
- Hero: draw paths → reveal architecture → activate accents; staggered ambient pulses with pauses, selected-layer pointer depth and primary CTA keyboard highlight. Offscreen/hidden suspension, static reduced motion; text/buttons stay fixed.
- Site consistency: shared warm/violet semantic tokens and small corners now apply to public, authentication and member surfaces. Explore, shared listing cards, public details, mission, sign-in/recovery and policy/support surfaces follow the geometric style. Original business SVG cover added. Member header/sidebar and shared panels use flatter surfaces.
- Mobile Explore categories use compact two-column destinations; artwork stays readable and results require less scrolling. Existing search/filter/pagination/date/deadline/auth/member behavior retained.

## Verification
Verified application/test head 0a19719c192160a4e44f8004b246b7e27c72ee9b; workflow https://github.com/loadsnft/afghan-hub-web/actions/runs/36823009895. Node 22 job 110242449914 and Node 24 job 110242449724 passed: 195 tests each, lint/type/build and existing checks. Nine public/auth routes at 320/390/768/1024/1440/1920 had zero axe WCAG AA violations and no horizontal overflow. Search, empty state, clear-search, keyboard listing navigation and protected member destination verified. All landing/hero interaction regressions passed.
Local lint/type passed (existing unrelated _userId warning); seven focused account-form/Explore tests passed. Actual implementation screenshots reviewed; mobile category density/artwork sizing refined from those observations.

## Next / limits
Signed-in dashboard, network, messages, profile, settings, saved/submission pages and member listing details need route-by-route visual/interaction review with a working authenticated browser. Shared styling reaches these pages, but do not claim their rendered experiences are verified. Auth submissions/live data and authenticated password update remain untested.
Local browsers cannot launch; actual production Next build is verified in sandbox-enabled CI Chrome with GET-only public-content fixtures. Hosted preview browser interaction/recording remains blocked; do not label CI captures as hosted-preview captures. No physical-device benchmarks. No automatic merge or production deployment.
