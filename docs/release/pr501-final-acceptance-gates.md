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

## Release-blocking gates not established for this integration revision

1. **Two independent complete authenticated acceptance runs on one immutable head.** Use the existing disposable local Supabase, Chrome, Mailpit and API/RLS harness; preserve all existing assertions. Require a full scenario inventory, zero failures, fixture deletion and stack destruction in each run. Do not combine a partial run with another run or cite results from an older commit.
2. **Roles and authorization:** administrator promotion/demotion via UI, forbidden moderator/member/anonymous mutations, old-session authorization and refresh/sign-out behavior.
3. **Auth lifecycle:** signup confirmation and password recovery, duplicate/expired/replayed links, cross-context behavior, and actual hosted SMTP/delivery only if explicitly authorized. The documented PKCE cross-device limitation must not be called a successful cross-device recovery.
4. **Owner lifecycle:** business, organization, opportunity and event create/edit ownership, visibility and foreign-owner refusal. Business/organization delete UI is not implemented and must not be claimed as complete.
5. **Cross-page design and accessibility:** review localized navigation and real Arabic-script typography on desktop/mobile, keyboard/focus and reduced-motion behavior, with a clear disposition for any remaining defects.
6. **Production release approval:** after all above, obtain explicit approval to merge PR #501 into PR #490's branch, verify PR #490 again, and separately obtain explicit approval before Production deployment.

## Execution constraints

The existing `scripts/qa/prepare-local-journey.mjs` and `scripts/qa/local-member-browser.mjs` are the source of truth for the disposable authenticated journey. The latter requires a clean Git source tree, a loopback Supabase instance, a sandboxed Chrome binary, and synthetic credentials. It refuses hosted targets. Do not weaken these requirements to make CI green.

The current browser smoke test is intentionally separate: it proves six anonymous language/viewport combinations, **not** API/RLS behavior. The absence of Docker and Supabase CLI in the assistant's present execution container prevents responsibly claiming a complete local authenticated run here.

## Review policy

Keep PR #501 Draft and Production unchanged until the release-blocking gates are evidenced at the same head and approved. Update this ledger with exact commit, workflow run, artifact IDs and failures, rather than generalized pass claims.
