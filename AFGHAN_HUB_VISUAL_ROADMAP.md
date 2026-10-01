# Afghan Hub visual roadmap

Updated 2026-10-01. Visual/frontend scope; preserve routes, content and working functionality. Preview only; production unchanged.

## Implemented
- Approved warm off-white/violet identity, original SVG artwork, readable horizontal labels and nine People glyphs preserved.
- Landing discovery panels: reversible sequenced connections, converging modules, gathering paths and branching openings; full semantic links, keyboard focus and first-tap navigation.
- Hero: staged SVG introduction, staggered ambient pulses with pauses, selected-layer pointer depth, primary CTA connection highlight, offscreen/hidden suspension and static reduced motion.
- Public/auth/member shells share warm semantic colors, fine borders and small corners. Explore, listing cards, public details, mission and authentication use matching original illustrations. Member category headers and detail fallback covers share pointer/hover/focus feedback; uploaded covers and existing access/actions preserved.
- Phase 1 refinement: clearer global Afghan connection message; stronger stable CTA feedback; eight-pixel hero pointer input plus limited mobile scroll depth; human glyphs in the hero network. Original stepped geometric signature connects hero and pathway panels. Small ridge/coast contours provide environmental context without Indigenous motifs. Shared 180/420/600 ms motion vocabulary; below-fold decorative artwork reveals once while readable text remains fully visible. No libraries, fake profiles/statistics or raster interface added.

## People consistency continuation
Directory, connection/request cards, member profile, connection controls and shared recommendations now use flat warm surfaces, fine borders, small corners and common focus/press timing. Profile cover reuses the original interactive People SVG; actual avatars, query/access guards, search, ranking and connection/message actions preserved. Touch controls are at least 44px; card/link frames stay stationary. Local lint/type and four focused navigation tests passed. Verified head c138b58ed8d230229d2f5e99f4b647b275d875f8: https://github.com/loadsnft/afghan-hub-web/actions/runs/36931256069 — both jobs passed lint/type/build and 195 tests each, zero failures/skips. Public six-width/browser regressions passed; authenticated People/profile rendering and action execution remain unverified because native browser startup failed.

## Verified baseline
Application head 09f49ef6287f6d76d53d161069db7112a80e59fa: https://github.com/loadsnft/afghan-hub-web/actions/runs/36923836847 — both CI jobs succeeded, including lint/type/build and 195 tests each. Existing sandboxed Chrome checks cover six widths 320/390/768/1024/1440/1920, WCAG AA audits, overflow, navigation, mouse/keyboard/touch/reduced motion, category near/far pointer positions and hero pacing/pause/layout shifts. Captures use GET-only loopback public-content fixtures, not real members/live data.
Phase 1 head cf24d5e341e83b2cd159d5f8472b9cccbb654570: local lint/type and seven focused tests passed. https://github.com/loadsnft/afghan-hub-web/actions/runs/36928230719 — both Node 22/24 CI jobs passed lint/type/build and 195 tests each, zero failures/skips. Six widths passed WCAG AA audits/overflow/navigation checks; mouse, keyboard, first-tap routes, reduced motion, mobile scroll depth and hidden/offscreen suspension passed. Hero p95 frame interval 16.7–16.8 ms, zero layout shifts/long tasks. Actual desktop/tablet/laptop/mobile screenshots and 13-second hero capture reviewed. Existing unrelated _userId lint warning remains.

## Limits / next
Native local browsers fail to start; protected hosted-preview interaction and authenticated/member route rendering remain unverified. Do not weaken access guards or invent accounts for screenshots. Phase 1 evidence: task outputs/AFGHAN_HUB_PHASE1_QA.md, afghan_hub_phase1_hero_13s.gif and afghan_hub_phase1_{desktop,mobile}.jpg. Next: authenticated route review, genuine consented member photography when available, and an accessible global network experience built on the lightweight person/connection SVG foundation; no heavy globe in this phase.

## Working preview
https://afghan-hub-f79wxmuy9-afghan-hub-s-projects.vercel.app — READY, preview target, verified application SHA. Production unchanged. Temporary share tokens are never stored here.
