# Afghan Hub current state

## Stage
Public website shipped in merged PR #51. Current main is `91dd40c3e3d98ba526993da5251c3da3ef72d2bf`; exact-main CI and Vercel production passed. Public landing was verified in-browser.

## Active work
`feature/account-entry-polish`: pending submit feedback and repeat-submit protection in login/signup/password recovery; accessible status/errors; signup password length no longer applied to existing-account login. No authentication action, database or RLS changes.

## Readiness
See `AFGHAN_HUB_LAUNCH_REVIEW.md` for evidence, acceptance gaps and security advisor follow-up. Public routes and 23 previous regression tests were verified; full authenticated end-to-end acceptance is still outstanding. No arbitrary completion percentage is claimed.

## Next
Verify the active branch and publish a focused PR. Continue multi-account acceptance, failure-state recovery, content review and accessibility. Policy text requires operator/contact/retention details. Do not publish member data without field-level privacy review. No production content was edited or deleted.
