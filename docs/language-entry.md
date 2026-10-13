# Three living nodes — interactive language entry

This is a focused, stacked change based on PR #490 at `337b23b84c2d93495de7e7ecc3b1c65dda71bac2`. It does not merge that PR or change Production. Main/Production were inspected at `0091fee8c569ed05b954336fe7a06794f1eb8412`.

The entrance uses the existing small brand mark and three stable script-specific labels in a sparse asymmetric network. Hover/focus forms a fine halo; pointer motion changes only the decorative network, with a maximum 7px/5px offset. Mobile uses a gently staggered vertical composition. All links work before animation or JavaScript. Native cross-document view transitions reveal the actual server-rendered destination over 450ms when supported; unsupported/interrupted transitions use ordinary browser navigation. No animation completion handler controls routing. There are no new application dependencies.

## Routing and persistence

`/` is an independent entry page without public navigation/footer. An explicit, year-long, SameSite=Lax preference cookie redirects subsequent root visits to `/en`, `/fa` or `/ps`. Cookie writes occur only at `/language/select`, a GET endpoint used by accessible ordinary links. Direct locale homepages resolve from the URL without a first-visit redirect or automatic preference write. Direct non-home paths remain intact.

The existing proxy matcher is unchanged. The proxy removes inbound locale headers and supplies a server-only locale hint for the three exact homepage paths or a valid `?lang=` on UI routes. It does not rewrite any path. APIs, auth callbacks and framework internals do not receive query-based locale hints. Cookie preference is not an authorization input. Supabase session handling and server action guards remain intact.

The shared switcher keeps the current path, duplicate query values and fragment, replacing `lang` for existing internal routes or changing the homepage path. Its native no-JS link retains server-visible path and query; JavaScript adds the current fragment. Auth callback/API/internal handler targets and external redirects are rejected. Browser storage failure does not affect cookie persistence. If cookies themselves are disabled, the current explicit locale URL remains usable but subsequent root visits cannot remember a preference.

Locale context renders on the server, including `<html lang dir>`. The chooser deliberately resets its own direction to LTR and applies lang/dir per label. The locally hosted Noto Sans Arabic font supports Persian/Pashto; original English fonts and the approved homepage composition/motion remain. Navigator initializes from the site locale; member Navigator reads the explicit site cookie ahead of legacy browser storage. `fa-AF` remains normalized to `fa`; member profile languages and user-authored text are not modified.

## Coverage and remaining work

| Surface | en | fa / ps | Routing / remaining gap |
| --- | --- | --- | --- |
| Root chooser | All three labels | All three labels | First root visit only; no header/footer |
| `/en`, `/fa`, `/ps` | Complete public homepage interface | Draft translated hero, goals, categories, benefits, CTAs, navigation/footer and existing Navigator messages | Native language review outstanding |
| Homepage metadata | Localized title/description | Draft localized title/description | Locale canonical and en/fa/ps/x-default hreflang; retained social assets |
| Sitemap | Three locale homes + original published public routes | Same locale home entries | No locale aliases advertised for untranslated routes |
| Public navigation/footer | Localized shell | Draft localized shell | Switcher preserves current path/query/hash |
| `/explore` and public listing detail | Existing English body | Shell changes; body is still English | Extract catalogue/filter/error/detail UI messages next; author content stays original |
| `/about`, `/support`, `/privacy`, `/terms` | Existing English body | Shell changes; body is still English | Editorial/legal translations need review before claiming localization |
| Auth UI: login/join/recovery/update-password | Existing English | Body remains English; locale resolution/direction foundation available | No entrance interception; translate forms/errors separately |
| `/auth/callback` signup/confirmation/recovery | Existing callback behavior | Unchanged | Actual email delivery and successful identity/session checks require isolated auth acceptance |
| Dashboard/member routes | Existing English | Shared language switcher, locale resolution/direction; most UI remains English | Extract per-module messages, including mobile/header/sidebar, and verify RTL before site-wide release |
| APIs/assets/robots | Unchanged | Unchanged | Never redirected to entrance |
| User-authored listings/profile languages | Original | Original | Never machine-translated or overwritten |

This PR localizes the **public homepage entry experience**, not the whole website. Persian/Pashto translations are drafts; native-speaker approval has not been obtained. Remaining pages are an explicitly identified prerequisite for a fully translated site, not represented as complete.

## Verification and reproducibility

- `node --test tests/*.test.mjs`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `scripts/qa/language-entry-browser.mjs`, using temporary pinned Playwright 1.62.1 and existing sandboxed Chrome, is run by `.github/workflows/language-entry.yml`. It serves a local production build against an empty loopback-only public catalogue fixture; blocks external browser requests; checks first visits, keyboard focus, three choices, return/reload, internal query/fragment switching, no-JS/storage/reduced-motion fallbacks, touch, explicit homes, anonymous auth-route bypasses, metadata and widths 320/390/768/1440. Artifacts contain desktop/mobile PNGs, actual interaction videos and commit-tagged JSON. It does not prove authenticated journeys or successful signup/email confirmation.
- Existing approved-homepage browser regression now opens `/en`, since `/` intentionally changed.

Local build and TypeScript passed. Local unit regression before the new locale-specific tests: 396 passed, 0 failed, 1 CI-only browser skip. Local lint has zero errors and three pre-existing unused-variable warnings. Native local browser startup is blocked by this execution environment's socket restrictions, so local screenshots/authenticated checks are not claimed. CI and Preview evidence must be inspected before marking this PR ready.

Release gate: do not publish this entrance until the three actual home destinations pass browser/layout verification and draft translations have appropriate review. No paid model calls, secrets, production data/configuration changes, merges or Production deployment are part of this work.
