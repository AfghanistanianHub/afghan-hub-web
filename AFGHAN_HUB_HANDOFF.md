# Afghan Hub visual handoff

Updated 2026-09-30. Approved geometric landing retained; dedicated illustration interaction pass implemented. No merge or production deployment.

## Current work
Repository: https://github.com/loadsnft/afghan-hub-web
PR: https://github.com/loadsnft/afghan-hub-web/pull/337
Branch: `design/connected-community-hero`; base main `419e11c92f8bd4cd0d5e7e00008a5b11fe222086`.
Application motion implementation: `ee28b80a2cc0205f8d24829974c973f3f78556a2`. Later commits refine browser recordings only; confirm current remote head/checks on continuation.

## Implementation
Warm canvas, violet identity, typography, original geometry and nine People glyphs preserved. Reusable server-rendered SVG/CSS; no client interaction bundle, animation library, dependencies, workflow or production configuration changes.
People connections draw in three short steps behind the opaque glyph backings. Organizations' three modules converge through small translations. Events' highlighted paths meet at the focal point. Opportunities' branching route draws toward a highlighted doorway. CSS hover and visible keyboard focus use the same feedback; transitions complete in 320–520 ms and reverse from the current state without queues or loops. Link boxes and labels stay fixed. Reduced motion uses immediate static highlights and no module translation. Hero illustration has one 550 ms arrival and settles; disabled for reduced motion.
Full-panel semantic links remain `/network`, `/explore?type=organizations`, `/explore?type=events`, `/explore?type=opportunities`. Hero CTAs remain `/explore` and `/login?mode=join`. Existing lower sections, listing feeds, member/auth behavior and metadata preserved.

## Reference observation
Poolside https://poolside.ai/ inspected read-only in actual sandboxed CI Chrome before implementation. Careers puzzle pieces separate during hover and return toward their assembled arrangement after exit. Lower-panel link labels acquire a violet highlight during hover and lose it after exit. No visible Model Factory change at the sampled pointer position. No unobserved timing/easing claims; no artwork copied. Reference inspection code was removed from the permanent regression harness.

## Verification / limits
Verified code/test head `ef335bf9274cdd73dfeaa4f3d3ce16259c814bb7`; application motion implementation unchanged since `ee28b80a2cc0205f8d24829974c973f3f78556a2`. Workflow https://github.com/loadsnft/afghan-hub-web/actions/runs/36803831385 — Node 22 job 110183751639 and Node 24 job 110183751726 each passed 195 tests, zero failures/skips, lint/type/build and existing checks. Local lint/type passed (existing unrelated `_userId` warning).
Actual Chrome checks passed all six widths 320/390/768/1024/1440/1920, zero axe WCAG AA violations/overflow, keyboard/skip/focus, mouse/press and all four one-tap routes, text resizing/reflow. Dedicated checks passed visible SVG hover and focus activation, exact resting-state reset, rapid six entry/exit reversals without queued motion, stationary hit bounds and static reduced motion. Hero single 550 ms arrival/settling and reduced-motion suppression passed.
All four actual default → hover → reset recordings visually reviewed at normal panel size. Each final frame matches the first exactly. Capture coordinates and capture-only scrollbar behavior were corrected in the harness before final successful evidence; no page geometry workaround was added. Recordings are GIF encodings of actual browser frames, not independently animated SVGs.
READY preview https://afghan-hub-ch33tlrfq-afghan-hub-s-projects.vercel.app — deployment `dpl_CsLg5wmKPbMgDpfvicLtZoWzrKE7`, preview target, metadata matches verified head. Generate fresh temporary share through Vercel; no share token stored here. Remote browser interaction remains unverified because local browsers cannot start and preview is protected; CI tested the same application implementation with public-content fixtures.
Native local browser tools fail to start. Actual implementation browser verification and recordings use the production Next build in sandbox-enabled CI Chrome, with GET-only loopback public-content fixtures. These recordings are actual browser frames, not animated mockup assets. Remote protected-preview browser interaction and authenticated/live-data flows are not verified; deployment readiness/code identity can be checked separately through Vercel. Production https://app.apnbc.ca/ unchanged.

## Continuation
GitHub/Vercel connectors work; do not request CLI sign-in. Local `work/afghan-hub-current` snapshot has synthetic history; never push its history. Use authentic remote trees/parents. Reuse current-state context; do not revisit superseded wheels/orbits. Temporary preview access is available through Vercel for 23 hours; never persist share tokens.
Next: review the motion recordings/preview, then inspect Explore and public detail interactions within the approved style. Do not merge/deploy automatically.
