# Afghan Hub visual roadmap

Updated 2026-09-30. Visual/frontend UX only; preserve working functionality.

## Implemented — approved landing and interaction pass, PR #337
- Warm-neutral composition, restrained violet, calm typography and original geometric hero retained. People network uses nine thin person glyphs, violet/white main person, warm-gray neighbors and opaque backings.
- Four full-surface semantic discovery links and existing hero CTAs retained. Lower public sections and member functionality preserved.
- People connections activate in sequence; organization structures converge; gathering paths meet; branching opportunity route reveals an opening. Reversible CSS transitions finish within 520 ms; stable link boxes, hover/focus parity, no loops or client interaction bundle.
- Hero has one 550 ms introductory animation; reduced motion uses static feedback and suppresses translation/introduction.
- Poolside inspected in actual sandboxed Chrome; Careers puzzle separation/reset and violet link highlights observed. No copied artwork or inferred behavior.

## Verification
Verified code/test head `ef335bf9274cdd73dfeaa4f3d3ce16259c814bb7`; application motion implementation unchanged since `ee28b80a2cc0205f8d24829974c973f3f78556a2`. Workflow https://github.com/loadsnft/afghan-hub-web/actions/runs/36803831385 — Node 22 job 110183751639 and Node 24 job 110183751726 each passed 195 tests, zero failures/skips, lint/type/build and existing checks. Local lint/type passed (existing unrelated `_userId` warning).
Actual Chrome checks passed all six widths 320/390/768/1024/1440/1920, zero axe WCAG AA violations/overflow, keyboard/skip/focus, mouse/press and all four one-tap routes, text resizing/reflow. Dedicated checks passed visible SVG hover and focus activation, exact resting-state reset, rapid six entry/exit reversals without queued motion, stationary hit bounds and static reduced motion. Hero single 550 ms arrival/settling and reduced-motion suppression passed.
All four actual default → hover → reset recordings visually reviewed at normal panel size. Each final frame matches the first exactly. Capture coordinates and capture-only scrollbar behavior were corrected in the harness before final successful evidence; no page geometry workaround was added. Recordings are GIF encodings of actual browser frames, not independently animated SVGs.
READY preview https://afghan-hub-ch33tlrfq-afghan-hub-s-projects.vercel.app — deployment `dpl_CsLg5wmKPbMgDpfvicLtZoWzrKE7`, preview target, metadata matches verified head. Generate fresh temporary share through Vercel; no share token stored here. Remote browser interaction remains unverified because local browsers cannot start and preview is protected; CI tested the same application implementation with public-content fixtures.

## Next task / limits
Review actual recordings/current preview, then inspect Explore and public detail interactions. Refine observed gaps only; do not revive circular/orbital designs or merge/deploy automatically. Native local browser unavailable; actual CI browser uses public-content fixtures. Remote protected-preview interactions and authenticated live-data flows are not verified. Production remains unchanged.
