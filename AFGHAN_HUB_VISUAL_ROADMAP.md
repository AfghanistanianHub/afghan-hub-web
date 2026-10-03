# Afghan Hub visual roadmap
Updated 2026-10-02.

## Direction
Approved warm off-white/violet identity, calm readable typography and original geometric SVGs/People glyphs. Preserve real content, routes and server/client boundaries. Stable targets, first-tap navigation, visible focus and static reduced motion.

## Completed implementation
Public/member/auth/catalog/detail surfaces aligned; layered hero/discovery motion pauses offscreen/hidden. Explore direct links and streamed results focus fixed. Forms/media/calendar/delete/RSVP/save/connect/message/request decisions aligned; ownership/actions/data logic retained.
PR368 published: header/notification flat surfaces, viewport-bounded panel below lg, comfortable controls, bounded scrolling, open/Escape focus handling, pending logout/read feedback with preserved notification content. No new library; subscription/helpers unchanged.

PR370 mobile drawer and PR372 desktop sidebar/details published: consistent flat surfaces, readable44px navigation, scrollable viewport sidebar, preserved direct routes/role visibility. Verification submits show stable pending feedback; real artwork/actions/data preserved. Dashboard horizontal clip avoids a sticky scroll ancestor. Private rendered/touch/action verification remains blocked.

## Verified
0a6de14b83f79dc1c33d63834bf23dc32e786617; https://github.com/AfghanistanianHub/afghan-hub-web/actions/runs/37082812812: Node22/24 lint/type/build and248 tests passed. Local four pending/navigation tests, scoped lint/typecheck passed. Production app.apnbc.ca READY at e338f223571d03ab4884b349023f47bc009dc036; landing HTTP200 and anonymous dashboard login response verified.
Public six-width Chrome/interaction/reduced-motion fixture evidence is separate from live/private verification.

## Remaining
Native browser startup blocks signed-in responsive/touch/rendered/actual-action checks and recordings. Do not mark these complete or use public screenshots as private evidence. Next: remaining account/moderation controls, then authorized signed-in end-to-end review. Later: consented imagery and accessible network discovery. Preserve fresh remote/concurrent work; never push synthetic local history.
