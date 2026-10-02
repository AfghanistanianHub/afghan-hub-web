# Afghan Hub visual roadmap
Updated 2026-10-02.

## Direction
Approved warm off-white/violet identity, calm readable typography and original geometric SVGs/People glyphs. Preserve real content, routes and server/client boundaries. Stable targets, first-tap navigation, visible focus and static reduced motion.

## Completed implementation
Public/member/auth/catalog/detail surfaces aligned; layered hero/discovery motion pauses offscreen/hidden. Explore direct links and streamed results focus fixed. Forms/media/calendar/delete/RSVP/save/connect/message/request decisions aligned; ownership/actions/data logic retained.
PR368 published: header/notification flat surfaces, viewport-bounded panel below lg, comfortable controls, bounded scrolling, open/Escape focus handling, pending logout/read feedback with preserved notification content. No new library; subscription/helpers unchanged.

## Verified
9dc5af4f17511fa75118c5e8a5547fa3f0d42a32; https://github.com/AfghanistanianHub/afghan-hub-web/actions/runs/37078790418: Node22/24 lint/type/build and242 tests passed. Local five state/focus callback tests, scoped lint/typecheck passed. Production app.apnbc.ca READY at 1a1f6e74c37e3773ca252a69b22ef99e982b70c9; landing/Explore HTTP200 and anonymous dashboard login response verified.
Public six-width Chrome/interaction/reduced-motion fixture evidence is separate from live/private verification.

## Remaining
Native browser startup blocks signed-in responsive/touch/rendered/actual-action checks and recordings. Do not mark these complete or use public screenshots as private evidence. Next: remaining detail/navigation controls, then authorized signed-in end-to-end review. Later: consented imagery and accessible network discovery. Preserve fresh remote/concurrent work; never push synthetic local history.

Mobile navigation continuation: flat warm drawer/overlay, shared44px trigger/close controls, restrained active states, readable wrapping labels and stable reduced-motion feedback replace the older blur/shadow/lift styling. Real navigation arrays, moderator visibility, badges, active-route matching, direct links and Base UI Dialog primitives retained. Desktop-breakpoint check now runs immediately on opening as well as on resize, preventing a stale modal at desktop width. Two route/role/breakpoint callback tests, scoped lint and typecheck passed; these do not verify real Dialog focus trapping or rendered layouts. Full remote checks pending. Private native-browser/touch/rendered review remains blocked; no real actions performed. Next: complete checks/publication under existing authorization, then remaining detail controls and signed-in review.
