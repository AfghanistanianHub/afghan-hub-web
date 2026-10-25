# Localization review — English, Farsi, Pashto

Updated 2026-10-23. This document supersedes the earlier four-language Navigator review. The
supported user-facing locale set is exactly **English (`en`)**, **Farsi/Persian (`fa`)** and
**Pashto (`ps`)**. **Dari is not a separate UI language, locale or selector.** Legacy `fa-AF`,
`fa_AF`, `fa-*`, `prs` and `prs-*` values normalize to `fa` in
`src/lib/i18n/site-language.ts`; do not reintroduce a separate Dari menu, dictionary or
preference. Farsi copy represents the written Persian used by the Afghan audience.

Translation status legend:

- **Verified** — localized UI copy was rendered in a real browser for en/fa/ps at 390, 768,
  1280 and 1440 px, including 200% root text scaling, direction, icon mirroring and reload
  persistence.
- **Translated** — three-language source exists and typechecks/tests, but this audit did not
  render the surface in a signed-in browser.
- **Partial** — some visible UI copy is localized; listed areas remain English.
- **English-only** — no localization implemented yet.
- **By design** — user-generated content is never machine-translated.

## Route-by-route status

| Route | Status | Notes |
| --- | --- | --- |
| `/` | Verified | Entry language screen; CI `Multilingual browser smoke` covers en/fa/ps at 390/1440. |
| `/en`, `/fa`, `/ps` | Verified | Server-rendered localized homepage sections; same CI coverage. |
| `/about` | Verified | Body copy merged in #526; CTA controls fixed for 200% text in this audit. |
| `/explore` | Verified | Category navigation, search, empty/unavailable states, pagination and footer prompt localized in this audit. |
| `/explore/[kind]/[slug]` | Verified | Detail chrome, dates, expired states and sidebar localized; listing content stays in its original language. |
| `/privacy` | Verified | Body copy from #526; operational footer links were still English and are now localized. |
| `/support` | Verified | Body copy from #526; support links localized. |
| `/terms` | Translated | Body copy from #526; not re-rendered in this audit. |
| `/login` | Translated | Auth localization merged in #517–#523; signed-in/browser re-verification outstanding. |
| `/forgot-password` | Translated | Same as above. |
| `/update-password` | Translated | Same as above. |
| `/profile` | Translated | Identity, work/skills, mentorship, location and link sections, hints, placeholders, fallbacks, submit state and server-action failures (`profileFormErrorKey`) localized in this audit; the avatar and profile-strength widgets remain English. |
| `/dashboard` | Partial | Greeting, workspace header, next-step guidance and navigation are localized; recommended/suggested opportunity blocks remain English. |
| `/network` | Translated | Heading, stats, directory, mentorship filters, connection actions and empty states localized in this audit; signed-in browser pass outstanding. |
| `/search` | Translated | Headings, intent selector and goal labels, keyword field, result counts, per-intent empty states, intent reasons, result type labels, goal cards and explorer card localized in this audit; server error strings and result titles stay as stored. |
| `/opportunities` | Translated | Heading, search/type/format/city filters, counts, cards, localized type labels and locale-aware deadlines, empty and error states localized in this audit. |
| `/opportunities/new` | Translated | Create form, review notice, every field, the deadline picker, submit state and the validation banner localized in this audit; validation failures now arrive as message codes. |
| `/opportunities/[slug]` | Translated | Detail chrome, status notices, deadline states, save/edit/delete controls, related cards, assistant prompts and the expired/delete/save action errors (mapped from codes) localized in this audit. |
| `/opportunities/[slug]/edit` | Translated | Editor form, fields, deadline picker, submit state and validation banner localized in this audit; failures arrive as message codes. |
| `/businesses` | Translated | Heading, search/category/city filters, verification and hiring filters, counts, directory rows, empty and error states localized in this audit. |
| `/businesses/new` | Translated | Full create form, hints, placeholders, submit state and validation/save failures (mapped from action codes) localized in this audit. |
| `/businesses/[slug]` | Translated | Detail chrome, status notices, hiring and verification states, contact sidebar, services, edit/verify controls, image alt text and verification failures localized in this audit. |
| `/businesses/[slug]/edit` | Translated | Editor headings, fields, hints, save state, the cover/logo media-upload chrome and the validation banner (mapped from action codes) localized. |
| `/organizations` | Translated | Heading, search/type/city filters, volunteer and verification filters, counts, directory rows, empty and error states localized in this audit. |
| `/organizations/new` | Translated | Create form, localized type options (canonical English values preserved) and validation/save failures (mapped from action codes) in this audit. |
| `/organizations/[slug]` | Translated | Detail chrome, status notices, mission/programs sections, volunteer state, contact sidebar, edit/verify controls, image alt text and verification failures localized in this audit. |
| `/organizations/[slug]/edit` | Translated | Editor headings, fields, volunteer toggle, save state, the cover/logo media-upload chrome and the validation banner (mapped from action codes) localized. |
| `/events` | Translated | Heading, search/format/city filters, counts, list and calendar views, weekday and month labels, localized event times, empty and error states localized in this audit. |
| `/events/new` | Translated | Create form, review notice, date/time picker copy, submit state and the validation banner (mapped from action codes) localized in this audit. |
| `/events/[slug]` | Translated | Detail chrome, status notices, registration states and confirmations, attendance counts, calendar downloads, related cards, assistant prompts and delete failures (mapped from action codes) localized in this audit; RSVP failures use their own status tokens. |
| `/events/[slug]/edit` | Translated | Editor headings, fields, date/time picker copy, save state and the validation banner (mapped from action codes) localized. |
| `/events/[slug]/attendees` | Translated | Attendee heading, privacy note, table labels, registration states, dates and empty/error states localized in this audit; attendee names and emails stay as stored and render LTR. |
| `/events/my` | Translated | Registered-events heading, table labels, status chips, dates, empty state and actions localized in this audit. |
| `/members/[id]` | Translated | Headings, biography/skills/languages fallbacks, mentorship signals, links, name fallback and the failed-conversation-start banner now come from the discovery catalogue (`member.*`, `memberActionErrorKey`); connection buttons use the network catalogue. |
| `/messages` | Translated | Header, inbox search, counts, previews, dates, unread labels and empty states localized; message bodies are user content. |
| `/messages/[conversationId]` | Translated | Thread chrome, read receipts, composer labels, limits and send failures (`messageActionErrorKey`) localized; message bodies untouched. |
| `/saved` | Translated | Heading, description, load error, expired/empty states and CTA localized in this audit; signed-in browser pass outstanding. |
| `/submissions` | Translated | Heading, filters, counts, status labels, dates, moderator note and empty/error states localized; signed-in browser pass outstanding. |
| `/settings` | Translated | Merged in #522; not re-rendered in this audit. |
| `/moderation` | Translated | Queue headings, tabs, per-entity labels, dates, approve/reject controls and reason field, history view, empty and error states localized in this audit. |
| `/moderation/team` | Translated | Team heading, role chips, role picker, save state, self-role and empty/error states localized in this audit. |
| Global loading boundary | Translated | Workspace loading announcement localized (#524 candidate); not merged into `main`. |
| 404 (`not-found.tsx`, businesses, organizations, members, explore listing) | Verified | All five boundaries render from `notFound.*` in the discovery catalogue: localized eyebrow, title, body and calls to action, local `۴۰۴` digits, mirrored back arrow, and `DocumentLanguage` restoring `lang`/`dir` on refresh-loaded 404s. The root and public listing 404s were rendered in en/fa/ps at 320, 390, 768, 1280, 1440 and 1920 px with 200% text; the three signed-in 404s are **Translated** because they need an authenticated session. |
| Error boundary / recovery | Translated | `PageRecovery` reads `recovery.*` from the same catalogue, sets its own `lang`/`dir` boundary, and the global error document reloads the stored language before first paint and localizes its `<title>`. Rendered in en/fa/ps by `tests/page-recovery.test.mjs`; not triggered in a browser. |

## Workspace catalog (this audit)

`src/lib/i18n/workspace-copy.ts` is a second typed catalog, kept separate from the public
`ui-copy.ts` so each can be reviewed on its own. It covers profile onboarding and the create/edit
forms for businesses, organizations and events. `src/components/i18n/workspace.tsx` provides
`<W>`, `LocalizedField`, `LocalizedSelect`, `LocalizedChoiceField`, `LocalizedCheckbox`,
`LocalizedSubmitButton`, `LocalizedBackLink` and `LocalizedCancelLink`.

- Values that are stored in the database (organization type, event AM/PM, select
  values) keep their canonical English token; only the visible label changes.
- URL, email and phone inputs render `dir="ltr"` so technical values stay readable inside RTL
  layouts.
- `tests/workspace-copy-contract.test.mjs` enforces key parity, non-empty values, no Latin text in
  Farsi/Pashto, canonical stored values, and that these pages no longer hardcode back links or
  pending labels.
- The event date/time picker now reads its copy and display date from the same catalog and
  locale-aware formatter instead of hardcoded English.

## Discovery catalog (this slice)

`src/lib/i18n/browse-copy.ts` is a third typed catalog for search, the four directories and their
member-facing detail pages. `src/components/i18n/browse.tsx` provides `<B>`, `useBrowseCopy`,
`BrowseField`, `BrowseSelect`, `BrowseCheckbox`, `BDate`, `BDatePhrase`, `BWeekdays` and `BNumber`.

- Field labels, placeholders and filter options come from the catalog, so server pages never ship
  English placeholder or aria copy.
- `BDate` renders Gregorian dates with locale month names and digits (`monthYear`, `shortDate`,
  `datetime`, `time`, `monthDay`, `monthShort`, `day`); the events calendar weekday headings are
  generated with `Intl`, not hardcoded.
- Result counts and dates interpolate through `formatSiteNumber`/`formatSiteDate`, so Farsi and
  Pashto get local digits.
- Stored canonical values (opportunity `type`, submission status, organization type) keep their
  English token in the database; `opportunityTypeKey` maps known tokens to catalog copy and leaves
  unknown or user-authored values untouched.
- Back arrows and `ArrowUpRight` affordances mirror under RTL with `rtl:rotate-180` and
  `rtl:-scale-x-100`; arrows previously pointed the wrong way in Farsi and Pashto.
- Email and phone values render `dir="ltr"` inside RTL layouts; cover/logo images use empty alt
  text because the adjacent heading already names the listing.
- `tests/browse-copy-contract.test.mjs` enforces key parity, non-empty values, no English fallback,
  interpolation, opportunity-type mapping, catalog usage on every localized route, removal of the
  previously hardcoded English chrome, and locale-aware date/number helpers.
- Not-found and recovery screens read `notFound.*` and `recovery.*` from this catalogue, and
  `DocumentLanguage` re-applies `lang`/`dir` to the document because a document served from an
  error shell never runs the root layout's language bootstrap. `tests/not-found-recovery-localization.test.mjs`
  enforces three-language key parity, no Latin fallback, per-route catalogue usage, that every key
  is rendered, and that the previously hardcoded English is gone.
- Server actions no longer put English sentences in the `error` query parameter. Failures redirect
  with stable codes (`title-required`, `create-failed`, `cannot-delete`, `invalid-role`, …) and the
  page maps them through `opportunityFormErrorKey`, `opportunityActionErrorKey`,
  `eventFormErrorKey`, `businessFormErrorKey`, `organizationFormErrorKey`, `eventActionErrorKey`,
  `verificationActionErrorKey` or the moderation code maps, so validation and failure text follows
  the active language. Unknown codes fall back to a generic localized message instead of leaking
  provider text.
- `<option>` may only contain text, so localized role choices render through the small client
  component `src/components/moderation/member-role-select.tsx` while the stored tokens stay
  `member` / `moderator` / `admin`.

Metadata and page titles are **English-only** on every route. Language preference is currently a
client-side preference, so server `generateMetadata` cannot know it. Localizing titles and social
metadata requires locale-prefixed routes or cookie-based server negotiation; that is a separate
architectural change and must not be claimed as complete.

## Shared UI contract

- `src/lib/i18n/ui-copy.ts` is the shared typed catalog (`UiCopy`) for the surfaces above. Its
  English shape is the key contract, so a missing Farsi or Pashto key fails TypeScript.
- `tests/ui-copy-contract.test.mjs` enforces identical key sets in all three languages, non-empty
  values, no accidental English fallback (keyboard key names excepted), interpolation and
  listing-value localization.
- `src/components/i18n/localized.tsx` provides `useSiteLanguage`, `useUiCopy` and `<Localized>`.
  Every rendered string carries its own `lang` and `dir` boundary.
- UI-generated catalogue values (`Online event`, `Community event`, `Remote`, `Online`,
  `Location not listed`) are localized at render time. User-authored titles, names, messages,
  biographies and listing descriptions are never translated.
- Dates use Gregorian formatting with locale month names and digits
  (`src/lib/i18n/format.ts`). Calendar choice, digit style and date order still require native
  editorial confirmation.

## Typography and RTL audit

Evidence for this audit: public `/explore`, `/explore?type=events`, `/about`, `/privacy` and
`/support` in en/fa/ps at 390, 768, 1280 and 1440 px, plus 200% root text scaling, in Chrome via
Playwright. 128 states checked; all passed after the fixes below.

Checks included: document `lang`/`dir`, bundled Estedad headings for Farsi and Vazirmatn for
Pashto, loaded font assertions, horizontal overflow, control clipping, mirrored directional icons
(`matrix(-1, 0, 0, 1, 0, 0)`), language switching on a deep route without navigating away, and
language persistence after reload.

Fixes made in this pass:

- Public header now wraps at large text sizes instead of pushing account controls off-screen.
- Explore intro art is width-constrained so it cannot squeeze Persian/Pashto copy at 200%.
- About calls to action wrap and no longer clip at 768 px with 200% text.
- Listing covers use logical `border-inline-end`; mobile art uses `margin-inline-start`.
- Directional icons mirror in RTL; category hover motion mirrors too.
- Persian/Pashto body copy gets 1.85 line-height, headings balance, and long catalogue labels can
  break instead of overflowing.
- URLs, codes and technical identifiers stay LTR and isolated in RTL copy.

## Editorial review gates

1. Native Farsi and Pashto reviewers must read every surface in context. **No locale is native
   approved.** The copy in `ui-copy.ts`, `about-content.tsx`, `information-page.tsx`,
   `dashboard-text.tsx`, `settings-text.tsx` and the Navigator resources are machine-assisted
   drafts.
2. Confirmed terminology to preserve unless a reviewer overrides it: فرصت / فرصت (opportunity),
   رویداد / پېښه (event), کسب‌وکار / سوداګري (business), سازمان / سازمان (organization),
   پیام / پیغام (message), اعلان / خبرتیا (notification), ذخیره‌شده / خوندي (saved).
3. Re-check mixed Latin/Persian names, phone numbers, URLs and dates after review; do not convert
   digits or calendar for printed/legal copy without approval.
4. Reopen review for any materially changed string.

## Remaining verification required before Issue #514 can close

- Signed-in **three-language** browser matrix (en/fa/ps at 390/768/1280/1440) for `/network`,
  `/saved`, `/submissions`, `/messages`, `/messages/[conversationId]`, `/settings`,
  `/profile` and the create/edit forms. The CI `journeys` and `Independent acceptance` jobs run
  real authenticated Chrome journeys against a local Supabase stack and pass on commit
  `685644b`, including owner create/edit for businesses, organizations, opportunities and
  events, submissions, messaging, moderation and connection flows — but those journeys assert
  English copy on the authenticated surfaces. A signed-in pass that switches each of those
  routes through Farsi and Pashto is still outstanding.
- Localize the remaining surfaces: 404/error boundaries, the avatar/profile-strength widgets
  and the remaining dashboard recommendation blocks, all listed as English-only or partial
  above.
- Localize the remaining server-side action error strings. Opportunity, moderation, event,
  business, organization, profile and messaging failures now travel as message codes
  (`opportunityFormErrorKey`, `opportunityActionErrorKey`, `moderation.error*`, `team.error*`,
  `eventFormErrorKey`, `businessFormErrorKey`, `organizationFormErrorKey`,
  `eventActionErrorKey`, `verificationActionErrorKey`, `profileFormErrorKey`,
  `messageActionErrorKey`, `memberActionErrorKey`). `/profile` renders its banner from
  `profileFormErrorKey`, the message composer from `messageActionErrorKey`, and `/members/[id]`
  renders the failed conversation start from `memberActionErrorKey`.
- Localize page titles/metadata through a deliberate routing or cookie decision.
- Native Farsi and Pashto editorial sign-off recorded with reviewer, date and commit SHA.
- Full `npm run lint`, `npx tsc --noEmit`, `node --test tests/*.test.mjs`, `npm run build` and the
  CI browser workflows on the final candidate SHA. On `685644b` these pass locally, and the CI
  `build`, `typography`, `browser`, `journeys` and `Independent acceptance` jobs all pass. The
  discovery catalog slice is verified locally and by CI on its own candidate commit, which is
  recorded in the pull request.

Issue #514 remains open. This document records partial, code-backed progress, not completion.
