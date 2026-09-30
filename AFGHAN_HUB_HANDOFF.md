# Afghan Hub visual handoff

Updated 2026-09-30. Circular landing discovery complete and verified; no merge/production deployment performed.

## Current implementation
Repository: https://github.com/loadsnft/afghan-hub-web
PR: https://github.com/loadsnft/afghan-hub-web/pull/337
Branch: `design/connected-community-hero`; base main `419e11c92f8bd4cd0d5e7e00008a5b11fe222086`.
Verified code: `e0671b87f07d32b8c82157cce1c7c08ec0ab9653`. Documentation commits may advance the PR; verify current head/checks on continuation.
Preview: https://afghan-hub-web-git-design-connecte-979249-afghan-hub-s-projects.vercel.app (requires Vercel login).

`CircularDiscovery` is the isolated client component; React state handles hover/focus, CSS/SVG draws four stable clipped link regions, and only decorative surfaces move. Center has no live announcement; static link descriptions remain accessible. Container-based compact alternative reserves center space. People links to existing protected `/network`; other links use existing `/explore?type=organizations|events|opportunities`. Headline, CTAs and below-hero sections preserved. `CommunityPattern` remains a server export for listing covers. No added dependencies or auth/data/workflow/config changes.

## Verified checks
Local lint/type checks passed; 27 local tests passed and the Linux-only browser test explicitly skipped. Existing unused `_userId` warning remains outside scope.
Full Node 22/24 CI: 195 tests each, zero failures/skips, lint/type/build passed; Vercel succeeded. Evidence workflow 36787338094, Node 24 job 110131889919, Node 22 job 110131890100.
Browser test uses the actual production app with GET-only loopback public-content fixtures and sandbox-enabled Chrome (Seccomp-BPF verified). At 320/375/768/1024/1440/1920px: no overflow, all four link labels reachable, populated lower listings and zero axe WCAG AA violations. Hover/focus descriptions, default resets/gaps, fixed center dimensions at every width, stationary labels/hit targets, visible keyboard focus/skip link, four single-tap routes, reduced-motion translation suppression and 200% text/reflow passed; no uncaught browser exceptions. Final screenshots reviewed at every width and Organizations hover.
Fixtures are QA content, not live records. No authenticated member-directory or live-data verification claimed. Native browser tools remain unavailable; CI provides verified browser evidence. Preview protection remains a viewing limitation, not an implementation blocker.

## Continuation
GitHub connector works; do not request another CLI sign-in. Local snapshot `work/afghan-hub-current` in the September 30 chat has synthetic history: do not push it. Remote Git tree/commit operations preserve authentic repository history and the full tree. Existing current-state file retained. Browser screenshot markers are in Node 24 logs; final screenshots/report are in this chat's outputs directory.
Next task: review existing PR/checks, then refine Explore and public details only after inspecting observed responsive UX gaps. Do not merge/deploy automatically.
