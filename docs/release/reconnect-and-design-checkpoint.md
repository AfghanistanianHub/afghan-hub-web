# Reconnect and design continuation — local checkpoint

## Preserved work and remote boundary

Checkout `afghan-hub-language-qa`, branch `fix/navigator-three-languages`, base HEAD `6fcf1ded0f4d8bb32db65d27f6b9fb59f68d87e1`. All changes remain local and uncommitted. GitHub connector rechecked #484, #486 and #487: heads remain respectively `6fcf1ded`, `cd50b2c` and `6098795`. #487 journeys remain successful on that older head. #484 advanced-security remains failed; the historical HTTP 402 diagnosis has not been freshly verified from logs. No scanner bypass, production changes or paid model calls.

The local session-before-subscribe helper, PostgreSQL-readiness refresh callbacks and configured callback origin match the #487 patch. #486 multilingual follow-ups remain present. The approved homepage and global network canvas have not been rewritten.

## Reconnect harness correction (first complete pass verified)

Previous offline emulation did not establish socket disconnection. Instrumentation now retains native browser WebSocket references in synthetic contexts only, closes the actual transport, blocks replacement handshakes during interruption, observes native close/open state, counts authenticated joins/PostgreSQL readiness/change delivery/refetch requests, and checks the missed message is persisted exactly once. No tokens, provider payloads or private content are recorded.

Observed diagnostic findings:
- Closing after emulating offline leaves the close handshake pending; close before offline, with replacement handshakes blocked.
- A disconnected receiver can still render a message via a server refresh already in flight. PostgreSQL change counts do not increase while disconnected.
- Failing refresh requests can trigger Next.js fallback navigation to `/`; that is not a valid conversation reconnect test.
- `window.stop()` did not preserve the conversation in that failure case and was removed.
- Current runner waits for the receiver's current-document HTTP refreshes to settle before transport interruption; historical request IDs are reset after navigating to the conversation.

The final correction adds a receiver-only ephemeral loopback HTTP/WebSocket proxy inside the existing CDP harness. It refuses all non-loopback destinations and ports other than the disposable app/API. It cuts native socket transport, holds new HTTP requests and pauses active response streams, then restores them without reload, route changes, fabricated sessions or mocked subscriptions. Compare change counts after native close (not before the close handshake drains buffered frames). Browser online state is recorded but is deliberately not treated as proof of network availability.

First complete corrected run: 30 passed, 0 failed, including all eight admin/moderator content scenarios, actual socket disconnection, exactly one persisted missed message, no missed-message visibility/change delivery during interruption, authenticated stream recovery, catch-up on the same route, sign-out and replay rejection. Evidence: `reports/local-member-browser-pass1.json`. The required second consecutive run is in progress; publication remains conditional on its result.

## Identified rejected artwork and local removal

The exact screenshot source was `CommunityIllustration` in `src/components/public/community-illustrations.tsx`: gateway/arch, stacked architectural cubes, isometric floor lines and purple routes. Its SVG export and every source usage were removed from login/signup, forgot-password, update-password, About and the unused legacy community-network component. Category artwork and `CommunitySignature` are distinct assets; the global APNBC canvas remains in the root layout.

Scoped consistency changes:
- Auth uses compact branding plus one centered task form; no empty illustration column or replacement artwork.
- About uses a content-width intro without artwork.
- Four member directory headers use content/actions instead of oversized art panels.
- People/network intro removes decorative art and shows connections/directory earlier; mobile stats no longer truncate labels.
- Sidebar uses circular icons and logical alignment; shared member width is capped.
- Profile display-name spacing repaired; identity icons circular; profile language fields untouched.
- Not-found and page recovery use focused content/action layouts, no decorative split column.
- Existing functional task cards, lists, forms, moderation and notification logic remain.

## Actual verification so far

- Final full unit suite after principal visual edits: 365 passed, 1 platform-specific skipped, 0 failed.
- Latest focused auth/language tests: 8 passed.
- Realtime regression tests: 9 passed.
- API/RLS disposable journeys rerun: 14 passed, 0 failed, cleanup passed.
- Final TypeScript passed including the mobile network-stat adjustment.
- ESLint passed, 0 errors/8 inherited warnings; final lint rerun tracked in local logs.
- Migration Data API grant guard passed; repository migrations/policies unchanged.
- Existing browser harness optional `LOCAL_QA_VISUAL=1` visited 19 representative routes at 1440px and 390px, checked no horizontal overflow, global canvas presence and rejected SVG absence; Persian/Pashto Navigator RTL captured. That run passed the visual scenario, but failed reconnect afterward.
- Screenshots are in `reports/visual/`, with before/after pairs for login, network, profile, dashboard, businesses and messages. After captures were refreshed with the latest mobile network-stat adjustment.

## Evidence and limitations

`reports/local-member-browser.json` and `reports/local-member-browser-pass1.json` record the first green corrected full run; the second consecutive pass remains required. `reports/visual/layout-checks.json` records route layout checks. Native-language approval remains pending. Admin team mutations, cross-device/external SMTP and multi-tab read receipts remain untested. Browser panel tools return Unknown browser profile; native sandboxed Chrome/CDP provides actual browser evidence. No matching new hosted CI or READY Preview exists. Production is untouched.
