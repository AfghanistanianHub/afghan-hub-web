# Afghan Hub visual roadmap

Updated 2026-10-01. Frontend visual/interaction scope; working functionality preserved. Preview only, production unchanged.

## Implemented
- Approved warm/violet identity, original SVGs, People glyphs, concise hierarchy and clear destinations. Original stepped geometric signature; restrained environmental ridge/coast references without copied or Indigenous artwork.
- Landing discovery: reversible connection/module/gathering/branch feedback. Hero: staged introduction, ambient pauses, selected-layer pointer/capped mobile-scroll depth, CTA focus connection, offscreen/hidden pause and static reduced motion. Stable hit areas;180/420/600ms shared motion vocabulary.
- Shared public/auth/member surfaces and catalog/listing artwork. Uploaded photos preserved. Category headers/details reuse interactive SVGs. People directory, profiles, recommendations and connection/request controls now have flat surfaces, consistent corners and visible focus/press feedback.
- Messaging/settings: inbox, conversation, composer, account panels and export/save controls use the same vocabulary. Mobile inbox dates have their own line; message dates have stronger contrast and bodies wrap safely. Explicit composer label, stable44–48px controls. Existing queries/actions/guards, realtime/read state, pagination, Enter/IME handling, privacy and export preserved.

- Profile/collections: editor, photo upload, completeness, saved opportunities, submissions, business/organization directories and My events now share flat surfaces, original signature, restrained headings, 44px+ controls and stable focus/press/arrow feedback. Existing data, routes, actions and photos preserved; no new client logic.

## Verified / pending
Full CI passed on Node22/24: https://github.com/loadsnft/afghan-hub-web/actions/runs/36954778300, application/test 26d875336c21f065af032d86cb88ffefeba88246; lint/type/build and regression jobs successful (inspected Node22 log:195 tests, zero failures). Matching READY preview: https://afghan-hub-jfya663if-afghan-hub-s-projects.vercel.app (preview target, production unchanged). Local13 targeted accessibility/avatar/permission tests also passed after fixes. Avatar remains compatible with its behavioral harness; submission focus test now checks the visible focus-within border instead of the removed shadow. No private rendered/action verification claimed.

Baseline application c138b58ed8d230229d2f5e99f4b647b275d875f8: https://github.com/loadsnft/afghan-hub-web/actions/runs/36931256069 — both jobs passed lint/type/build and195 tests each. Real sandboxed Chrome public fixtures passed six widths, WCAG AA/overflow, routes, keyboard/mouse/first-tap/reduced motion and hero suspension/performance; p95~16.7–16.8ms with zero measured layout shifts/long tasks. Actual reviewed public screenshots/recordings live in task outputs; no private captures claimed.
Current messaging continuation: local lint/type and10 focused tests passed; full CI passed on Node22/24: https://github.com/loadsnft/afghan-hub-web/actions/runs/36944784643 (application/test 68fa3761a7fa1494eccc9c04b74cc545cda7f387; inspected Node22 log:195 tests, zero failures). Visible inbox focus retained explicitly; recording uses live hit geometry and waits for committed frames. Existing unrelated _userId warning remains.

## Blockers / next
Native browser startup blocks authenticated rendered review, live actions and hosted-preview recording. No fake accounts/auth bypass. Matching READY preview: https://afghan-hub-2vg9qbjjy-afghan-hub-s-projects.vercel.app; hosted UI remains unverified. Next: authorized signed-in route review, then listing create/edit and media-control consistency. Later: consented photography and lightweight accessible global-network discovery. Keep source/artwork reusable, avoid heavy globe/animation dependencies, preserve approved identity.
