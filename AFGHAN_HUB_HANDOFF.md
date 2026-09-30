# Afghan Hub visual handoff

Updated 2026-09-30. Landing visual milestone verified; no merge/production deployment performed.

## Current work
Repository: https://github.com/loadsnft/afghan-hub-web
PR: https://github.com/loadsnft/afghan-hub-web/pull/337
Base main: `419e11c92f8bd4cd0d5e7e00008a5b11fe222086`.
Verified application code: `684fdb3b9047af7c497775bda4ad9a63fdf37b39`. Documentation commits may advance the PR; verify current head/checks on continuation.
Preview: https://afghan-hub-web-git-design-connecte-979249-afghan-hub-s-projects.vercel.app (requires Vercel login from this session).

Hero connects people, organizations, events, opportunities and businesses using shared SVG/CSS artwork. Public-only indigo/coral/gold palette; 44px header targets; content-sized grid rows prevent text-growth collisions. Caption backing keeps connection lines behind readable text. Current pathways, pulse, listings, metadata and account/discovery destinations preserved. Shared listing covers reuse the artwork. No dependencies, workflows, auth/data rules or production configuration changed.

## Verified evidence
Both Node 22/24 CI passed 195 tests, zero failures/skips; lint/type/build and Vercel passed. Existing unused `_userId` lint warning remains outside this scope.
`tests/landing-browser.test.mjs` runs the actual production app with GET-only loopback public-content fixtures and sandbox-enabled Chrome (Seccomp-BPF verified), using the existing CI test step.
Passed at 320/375/768/1024/1440px: no horizontal overflow or people/card occlusion; accessible/clickable hero targets; populated covers; zero axe WCAG AA violations. Keyboard/skip/focus, reduced motion, 200% text resizing/reflow and event-category navigation passed.
Hero screenshots and populated mobile listing cards visually inspected. Evidence: workflow run 36777624779; Node 24 job 110099424681, Node 22 job 110099424283. Screenshots are actual app renders; listing data is explicitly local QA data, not production content. No authenticated/live-data QA claimed.

## Continuation / access
GitHub connector access works; do not require another CLI sign-in. Local source snapshot is `work/afghan-hub-current` in the September 30 Codex chat; its history is synthetic and must not be pushed as repository history. Remote commits preserve the full repository tree. Existing AFGHAN_HUB_CURRENT_STATE.md retained.
Local native browser tools remain unavailable, but CI browser QA supplies working evidence. Local test skips do not imply a browser pass. Screenshots are captured in Node 24 job logs with AFGHAN_HUB_SCREENSHOT markers and can be decoded without touching user credentials. Final screenshots/report are in this chat's outputs directory.

Next task: review current PR/checks; after this focused landing change is accepted, inspect Explore and public detail hierarchy at mobile/tablet/desktop using the same fixture/browser method. Preserve data/state behavior and refine only observed visual/UX gaps. Do not merge/deploy automatically.
