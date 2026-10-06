# Exact APNBC global canvas background

## Source inspected

The live APNBC effect is a custom Canvas 2D plugin (not Elementor particles.js):

- https://apnbc.ca/wp-content/plugins/apnbc-network-background-fixed/assets/apnbc-network.js?ver=1.0.1
- https://apnbc.ca/wp-content/plugins/apnbc-network-background-fixed/assets/apnbc-network.css?ver=1.0.1
- DOM: `#apnbc-hero-section > .apnbc-network-html > #apnbc-network-layer > #apnbc-network-canvas`.

Unmodified source snapshots are in [source/apnbc-network.js](source/apnbc-network.js) and [source/apnbc-network.css](source/apnbc-network.css).

## Preserved exactly

48 desktop / 28 mobile particles (breakpoint 768px), random positions, velocity `(random - 0.5) * 0.3`, radius `random * 2 + 1`, blue `rgba(79,125,240,0.75)`, one-pixel lines, 120px particle connections with alpha `(1 - distance / 120) * 0.22`, 160px mouse connections with alpha `(1 - distance / 160) * 0.35`, original per-frame update order and edge bounce, and device-pixel-ratio sizing. No new particle library, labels, boxed tags or long SVG paths.

Deterministic tests execute the saved original script and the port with identical randomness and compare every canvas draw call over moving frames and mouse input at desktop/mobile sizes.

## Necessary integration changes

- Existing root-layout mount is retained; one fixed viewport canvas replaces the reconstructed SVG.
- React effect mount/cleanup replaces WordPress/Elementor DOM boot and retry timers.
- Mouse input is observed on the window because the decorative canvas has `pointer-events: none`; viewport-relative coordinates replace hero-relative dimensions.
- Hidden documents suspend RAF. Reduced motion renders static particles while retaining event-driven mouse connections. Resize resets particles/DPR exactly as the source does, without duplicating loops. All listeners/RAF are removed on unmount.
- Old constellation CSS and dashboard grid removed. Shells are transparent so the original canvas colors are not attenuated; cards, inputs, sidebar/header and hero artwork remain unchanged.

## Screenshots

[Download/open the self-contained before/after screenshot comparison](comparison.html). It contains real raster captures of the local login page before and after, downscaled for review. Full-size PNG captures of home, about and login at 1440×1000 and home/login at 390×844 remain in the local workspace evidence directory, along with member-fixture captures. They are not uploaded as binary files through the text-only connector.

Before baseline: main `dc1e2922438b01475c0bfe9403bddca71d756f69`. Screenshots use local placeholder Supabase configuration, not production data. Particle positions are random, as on APNBC; captures need not have matching dot positions. Existing hero/category content is not part of this canvas and was not redesigned.

## Verification

- `npm run lint`: exit 0, five pre-existing unused-variable warnings in events/opportunities/profile-access; no new warnings.
- `npx tsc --noEmit`: pass.
- `node --test --test-concurrency=4 tests/*.test.mjs`: 317 passed, 0 failed, 1 existing Linux-CI-only browser test skipped on macOS. An unbounded parallel repeat timed out on this host; bounded concurrency completed all tests without changing assertions.
- `npm run build`: pass with local placeholder public Supabase configuration; temporary QA route removed before final build.
- Local sandboxed Chrome CDP checks: one nonempty canvas, fixed positioning, pointer-events none, no horizontal overflow; real mouse input produces connections; all measured connections below 160px; reduced-motion stops RAF but mouse updates still render; desktop/mobile home, about and login render without runtime exceptions.
- Member-shell visual verification: real Header and Sidebar mounted with non-authenticated local fixture data at desktop/mobile widths, then fixture deleted. No production account impersonation or data changes. **Authenticated member journeys are not verified** because acceptance credentials were not available; root placement applies the component to member routes without altering their auth guards.

Browser observations are saved locally. Start the local app at port 3107 and sandboxed Chrome with remote debugging on loopback port 9227, then run `node scripts/apnbc-background-browser.mjs after` to reproduce. The optional member-fixture flag requires a temporary local route as described above; no QA route is shipped.
