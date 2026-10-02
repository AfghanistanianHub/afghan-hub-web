# Afghan Hub visual roadmap
## Calendar continuation — 2026-10-01
Deadline and event date/time fields now use a shared scoped calendar CSS module, restrained icon/control surfaces, in-flow panels bounded by field width and container-responsive day cells. Narrow captions/nav use separate rows; no new dependency. DayPicker autoFocus, Escape close/return-to-trigger, deadline selection focus return and Clear/Done focus return added. Stored date-only/local date-time formats, AM/PM conversion, defaults, future-date limits and event Done requirements preserved. Panel expansion is intentional user-triggered reflow, not claimed zero-layout-shift evidence.
Latest application/test a6b0d793320ae0f6ca68b00cf0d25e466c687130: https://github.com/AfghanistanianHub/afghan-hub-web/actions/runs/36974041597 — Node22/24 lint/type/build and full regression jobs passed; inspected Node22 counts # tests 217; # pass 217; # fail 0. Four component callback tests verify Escape/focus, leap-day date-only submission and event Clear reset without form submission; these are not browser or authenticated-flow tests. Native browser limitation still blocks rendered/private calendar, responsive/touch and actual submission verification. READY preview https://afghan-hub-jnohpvast-afghan-hub-s-projects.vercel.app; PR356 continuation remains separate from production.
Next: pending-submit feedback across listing forms, remaining detail/action states and authorized private rendered review.


Updated 2026-10-01. Preserve approved warm/violet identity, original geometric artwork, People glyphs, working routes and functionality. Use light flat surfaces, clear hierarchy, reusable180/420/600ms feedback and static reduced motion.

## Completed
- Landing staged hero/ambient/pointer/scroll and discovery responses; visible focus, stable hit areas and one-tap links.
- Public/auth/member surfaces, catalog/details, category artwork, People/profiles/connections, messages/settings, profile editor, saved/submissions and member directories aligned.
- Explore compact categories and clear heading/search/results sequence; streamed results focus repaired. PR348 merged and production READY/live HTTP200 verified.
- Current PR356: eight listing create/edit forms plus business/organization logo/cover controls. Consistent surfaces/corners, restrained headings, comfortable inputs, stable press/focus and disabled-upload feedback. Preserved queries/actions/guards, real media and all upload/form logic.

## Verified and limits
Latest application/test b1a923df55794678e983712c39743e48eadcb712: https://github.com/AfghanistanianHub/afghan-hub-web/actions/runs/36972616122; Node22/24 lint/type/build and full regression jobs passed. Public sandboxed browser fixtures verify six widths, WCAG AA/overflow, actual navigation/touch/keyboard and reduced motion. Local media tests and unchanged-logic comparisons passed. Existing unrelated lint warning retained.
Preview https://afghan-hub-1upex3x7n-afghan-hub-s-projects.vercel.app; PR https://github.com/AfghanistanianHub/afghan-hub-web/pull/356 is open, merged=false. Native browser startup blocks private rendered/upload/submit and hosted-preview recording checks. Do not label old public screenshots as new private evidence.

## Next
Authorized private visual review; pending-submit feedback and remaining detail/action states. Later: consented human imagery and accessible global-network discovery. Keep handoff concise and based on verified results; do not store share tokens or push synthetic local history.
