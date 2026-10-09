# Three-language Navigator verification checkpoint

## Actual changes

Navigator selectors and shared copy now have exactly `en`, `fa`, `ps`: English, فارسی / Persian, پښتو / Pashto. Persian represents Persian/Dari together. Duplicate Dari chatbot resources were removed. Legacy `fa-AF` requests normalize to `fa` at discovery and analytics boundaries; Navigator-only local preferences migrate to `fa`. RTL and draft translation review labels remain. No profile language or listing-content changes.

The isolated checkout also carries the inspected fixes from open PRs #486 and #487: multilingual location refinements, session-authenticated Realtime subscriptions and configured-origin callback redirects, with regression tests. These are preserved upstream work, not newly discovered defects.

## Checks executed

- Clean `npm ci`: exit 0; lockfile unchanged. Replaced an out-of-root dependency symlink rejected by Turbopack.
- Full Node suite: 365 passed, 1 Linux-only browser test skipped, 0 failed.
- TypeScript: exit 0.
- Final ESLint: exit 0, 0 errors, 8 warnings in unchanged files (not the historically reported 7).
- Production build: succeeded within the browser runner after clean dependency installation.
- Runtime dependency audit: 0 vulnerabilities. Clean install reports 9 high development dependency findings; no forced audit changes made.
- Migration API grant guard: PASS.
- Disposable API/RLS journeys: 14 passed, 0 failed, including cleanup.
- Real sandboxed Chrome: public and member selectors, legacy preference migration, Persian/Pashto RTL, signup/Mailpit/PKCE, session separation, connection forms, notification navigation, listing create/edit and unauthorized moderation/team routes passed.

## Incomplete browser gate

The extended existing runner exercises moderator/admin rejection, approval, database publication state, owner feedback and anonymous/member visibility across organizations, opportunities, events and businesses. All eight moderator/admin content-form scenarios now pass locally. The complete browser gate is still NOT passing.

Earlier runs verified moderator rejection/approval and owner feedback for organizations, opportunities and events. Fixture/schema mistakes were corrected: rejection maps to `closed` for opportunities and `suspended` for entity-status listings; business fixtures require category. Captured synthetic roles are provisioned through loopback Docker SQL because this local service role lacks execution on `mentorship_topics_are_valid`; no grants, RLS or authorization functions were changed.

Final diagnostic run: 27 passed, 1 failed at offline reconnect catch-up; cleanup passed. Admin and moderator each passed all four content types, including invalid rejection reason refusal, rejection status/note/reviewer persistence, owner rejection feedback, approval publication, anonymous/member visibility and owner Published status. Admin-only team access and member/anonymous route refusals passed. Admin team role mutations remain untested. Earlier attempts exposed intermittent offline transport and navigation behavior. The runner now waits for the requested document loader rather than accepting the previous loaded document, and fails HTTP refreshes during offline simulation. The stronger offline interruption still fails to catch up within the bound, so the full CI gate remains red. Sign-out/replayed-link scenarios after that failing step were not reached in this final run. The sanitized raw report is `reports/local-member-browser.json`.

## Remote evidence rechecked

- #484 open/draft at `6fcf1ded0f4d8bb32db65d27f6b9fb59f68d87e1`; Node 22/24 and journey checks succeed, advanced-security check fails.
- #486 open/draft at `cd50b2c72598726d65342c559540502b62326d0b`; not merged.
- #487 open/draft at `6098795adcc3e1903d65ae33d4e3b469fb4e8bf6`; journey CI succeeds: https://github.com/AfghanistanianHub/afghan-hub-web/actions/runs/37892354687
- Vercel connector confirms https://afghan-hub-r3jg0gqws-afghan-hub-s-projects.vercel.app/ is READY with exactly the #487 SHA. It does NOT include these local changes.
- Current scanner failure confirmed from check metadata. HTTP 402 quota diagnosis is historical saved log evidence, not a freshly fetched scanner log.

## Delivery boundary

Local branch: `fix/navigator-three-languages`. Changes are uncommitted and unpublished; no new PR or CI run exists. No main merge, Production deployment, hosted database writes, credentials, paid model activation or provider calls. Other checkout AGENTS.md edits were untouched.

A local production-build preview is registered at http://localhost:3100, using disposable Supabase. Browser panel automation itself returned an unknown-profile error; the CDP runner provided actual browser language verification. Redis Linux-only integration was not rerun on macOS. Native-language approval, multi-tab/duplicate replay, external SMTP/cross-device confirmation and live-model evaluation remain pending.

Next: diagnose offline reconnect catch-up with actual failed HTTP refreshes, rerun the full browser gate including final sign-out/replayed-link scenarios, then explicitly authorize publishing a focused review branch and obtain CI/READY Preview evidence matching its head.
