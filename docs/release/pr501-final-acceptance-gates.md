# PR #501 — final integration acceptance gates

Status: **not release-approved**. This is an evidence ledger for the multilingual integration candidate, not permission to merge or deploy to Production.

## Immutable scope

- PR: https://github.com/AfghanistanianHub/afghan-hub-web/pull/501
- Integration branch: `integration/multilingual-qa-2026`
- Base PR #490 branch: `feat/member-page-workspaces`
- Browser-evidence revision: `473b3d947e18d401365a7634baf95726fbf230a6`
- Any later source commit invalidates a claim that acceptance applies to the latest head until checks are rerun.
- Never use Production credentials, live accounts, hosted database data, paid AI calls, or production SMTP to fill these gates.

## Evidence verified on the browser-evidence revision

| Gate | Evidence | Result | Scope |
| --- | --- | --- | --- |
| Multilingual source contracts, typecheck and lint | GitHub Actions `Multilingual typography and homepage` | Passed | Static checks only |
| Real Chromium desktop/mobile `en/fa/ps` | GitHub Actions `Multilingual browser smoke`, run `38621334887` | Passed | Local anonymous dev server; font readiness, computed font, direction, JS errors and horizontal overflow |
| Six full-page screenshots | GitHub artifact `11921882869` | Available | Manual visual review; not a complete accessibility audit |
| Preview deploy | Vercel GitHub integration | Previously READY | Not a substitute for authenticated acceptance |

## Release gates and current disposition (verified 2026-10-14)

1. **Two independent authenticated acceptance runs — PASSED at `c43fba6f9296fad791f740ff06dafd4485e36773`.** [Workflow 38662208587](https://github.com/AfghanistanianHub/afghan-hub-web/actions/runs/38662208587) completed successfully: each independent job logged **14 API/RLS passed, 0 failed** and **52 Chrome scenarios passed, 0 failed**. Both sanitized evidence artifacts `pr501-authenticated-pass-1` and `pr501-authenticated-pass-2` were present. CI teardown step succeeded. Re-run after any source change.
2. **Roles and authorization:** administrator promotion/demotion via UI, forbidden moderator/member/anonymous mutations, old-session authorization and refresh/sign-out behavior.
3. **Auth lifecycle — local browser coverage passed; external delivery unverified.** Isolated cross-context signup and password recovery, invalid/replayed links and authorization flows were included in the 52-scenario acceptance suite. The new app confirmation endpoint and disposable templates are included. Real hosted SMTP delivery, DNS/email reputation and physical-device behavior remain outside the verified scope; do not change hosted templates without authorization.
4. **Owner lifecycle:** business, organization, opportunity and event create/edit ownership, visibility and foreign-owner refusal. Business/organization delete UI is not implemented and must not be claimed as complete.
5. **Cross-page design and accessibility:** review localized navigation and real Arabic-script typography on desktop/mobile, keyboard/focus and reduced-motion behavior, with a clear disposition for any remaining defects.
6. **Production release approval:** after all above, obtain explicit approval to merge PR #501 into PR #490's branch, verify PR #490 again, and separately obtain explicit approval before Production deployment.

## Additional verified workflows at accepted head

- [Multilingual browser smoke 38662208566](https://github.com/AfghanistanianHub/afghan-hub-web/actions/runs/38662208566): success.
- [Multilingual typography and homepage 38662208437](https://github.com/AfghanistanianHub/afghan-hub-web/actions/runs/38662208437): success.
- GitHub reports `mergeable=true` for PR #501 at the accepted head. The base branch has independent commits; copying their file contents into integration is not the same as merging their commit history. Recheck base movement and conflict status before final merge.
- **Still unapproved:** production release, hosted email configuration, and optional destructive business/organization deletion UI. The green suite is evidence of isolated acceptance, not approval of these scope decisions.

## Execution constraints

The existing `scripts/qa/prepare-local-journey.mjs` and `scripts/qa/local-member-browser.mjs` are the source of truth for the disposable authenticated journey. The latter requires a clean Git source tree, a loopback Supabase instance, a sandboxed Chrome binary, and synthetic credentials. It refuses hosted targets. Do not weaken these requirements to make CI green.

The multilingual browser smoke test is intentionally separate: it proves six anonymous language/viewport combinations, **not** API/RLS behavior. The distinct authenticated acceptance workflow supplies isolated API/RLS and browser evidence. The absence of Docker and Supabase CLI in the assistant's present execution container prevents responsibly claiming a complete local authenticated run here.

## Review policy

Keep PR #501 Draft and Production unchanged until the release-blocking gates are evidenced at the same head and approved. Update this ledger with exact commit, workflow run, artifact IDs and failures, rather than generalized pass claims.
