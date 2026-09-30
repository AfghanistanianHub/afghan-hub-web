# Afghan Hub visual handoff

Updated 2026-09-30.

## Authoritative source
Repository: https://github.com/loadsnft/afghan-hub-web
Base: main `419e11c92f8bd4cd0d5e7e00008a5b11fe222086` (Vercel successful). Read AGENTS.md, existing AFGHAN_HUB_CURRENT_STATE.md and docs/agent/autopilot-policy.md. Older September 8 checkout does not match the live app; its draft was reconciled against current source rather than replacing newer sections.

Current source is under `work/afghan-hub-current` in the September 30 Codex chat workspace. Application source/config/public assets were retrieved through the GitHub connector and verified against remote blob hashes. This is a source snapshot with local synthetic history, not a complete Git clone. Existing public/member-entry and navigation/layout regression tests were retrieved; the full repository test suite must run in CI. Dependencies installed from the current unchanged lockfile (Next 16.3.4).

## Review artifact
Draft PR: https://github.com/loadsnft/afghan-hub-web/pull/337
Preview: https://afghan-hub-web-git-design-connecte-979249-afghan-hub-s-projects.vercel.app
Code commit: `c6c497e53b5bc653c0f7566fa74fc0097ed71860`; Vercel build passed. Preview requests from this session return the Vercel login page, so rendered hosted UI is not verified. Check the final PR head for CI status; documentation updates advance it.

## Changes and checks
New CommunityEcosystem/CommunityPattern components provide connected, photo-free hero cards and default listing artwork. Public-only palette avoids changing member styling. Hero retains current title/CTAs; pathways, pulse, listing states, data queries and account flows remain intact. Header targets now have 44px minimum height. Compact grid below 400px avoids layered card collisions; tablet/desktop use layered cards. Decorative art hidden from assistive technology; hero links retain category names; existing focus and reduced-motion support retained. No client hooks or new client-side JavaScript.

Passed: ESLint (0 errors; existing unused `_userId` warning in profile-access.ts), TypeScript, production build, 27 relevant regression tests, git diff --check. Local production `/` and event/organization Explore return 200; rendered hero/category/join destinations verified. Calculated new text contrast: primary 10.14:1, muted 5.85:1, card labels 6.64:1, caption 6.33:1. These do not replace a full accessibility audit.

## Limits and next task
Browser automation cannot initialize/launch normally. Automatic approval review rejected sandbox-disabled Chrome and command-line sign-in input. GitHub connector access works. Review also rejected copying the old environment file due to possible secrets; no environment file transferred. Local preview http://localhost:3001 therefore shows unavailable listing states without live configuration. No populated-data, authenticated, visual or keyboard browser pass claimed.

Next: inspect the draft's Vercel preview at 320/375/768/1024/1440px, keyboard/zoom/reduced motion and populated covers; fix any defects, confirm exact-head CI/Vercel. Keep draft until that QA is complete. Do not merge/deploy automatically. Existing current-state file retained.
