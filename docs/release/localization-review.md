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
| `/profile` | Translated | Identity, work/skills, mentorship, location and link sections, hints, placeholders, fallbacks and submit state localized in this audit; server action error strings and the avatar/profile-strength widgets remain English. |
| `/dashboard` | Partial | Greeting, workspace header, next-step guidance and navigation are localized; recommended/suggested opportunity blocks remain English. |
| `/network` | Translated | Heading, stats, directory, mentorship filters, connection actions and empty states localized in this audit; signed-in browser pass outstanding. |
| `/search` | English-only | Search headings, filters, counts, empty and error states remain English. |
| `/opportunities` | English-only | Listing heading, filters, cards, empty and error states. |
| `/opportunities/new` | English-only | Create form, validation and review notice. |
| `/opportunities/[slug]` | English-only | Detail, deadline states, related cards and calls to action. |
| `/opportunities/[slug]/edit` | English-only | Editor form and status copy. |
| `/businesses` | English-only | Listing heading, category/city filters and empty states. |
| `/businesses/new` | Translated | Full create form, hints, placeholders and submit state localized in this audit; server error banner text stays English. |
| `/businesses/[slug]` | English-only | Detail, hiring state and calls to action. |
| `/businesses/[slug]/edit` | Translated | Editor headings, fields, hints and save state localized; media-upload chrome and server error banner remain English. |
| `/organizations` | English-only | Listing heading, filters and empty states. |
| `/organizations/new` | Translated | Create form plus localized type options (canonical English values preserved) in this audit; server error banner text stays English. |
| `/organizations/[slug]` | English-only | Detail, volunteer state and calls to action. |
| `/organizations/[slug]/edit` | Translated | Editor headings, fields, volunteer toggle and save state localized; media-upload chrome and server error banner remain English. |
| `/events` | English-only | Listing heading, search, format filters and empty states. |
| `/events/new` | Translated | Create form, review notice, date/time picker copy and submit state localized in this audit; server error banner text stays English. |
| `/events/[slug]` | English-only | Detail, registration states and errors. |
| `/events/[slug]/edit` | Translated | Editor headings, fields, date/time picker copy and save state localized; server error banner text stays English. |
| `/events/[slug]/attendees` | English-only | Attendee heading, privacy note and empty states. |
| `/events/my` | English-only | Registered events heading, empty states and actions. |
| `/members/[id]` | English-only | Profile detail headings, biography fallback, connection actions. |
| `/messages` | Translated | Header, inbox search, counts, previews, dates, unread labels and empty states localized; message bodies are user content. |
| `/messages/[conversationId]` | Translated | Thread chrome, read receipts, composer labels, limits and known error messages localized; message bodies untouched. |
| `/saved` | Translated | Heading, description, load error, expired/empty states and CTA localized in this audit; signed-in browser pass outstanding. |
| `/submissions` | Translated | Heading, filters, counts, status labels, dates, moderator note and empty/error states localized; signed-in browser pass outstanding. |
| `/settings` | Translated | Merged in #522; not re-rendered in this audit. |
| `/moderation` | English-only | Queue headings, filters, actions, dialogs and empty/error states. |
| `/moderation/team` | English-only | Team headings, role controls and error states. |
| Global loading boundary | Translated | Workspace loading announcement localized (#524 candidate); not merged into `main`. |
| 404 / error states | English-only | Default framework copy remains English. |

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

- Signed-in browser matrix (en/fa/ps at 390/768/1280/1440) for `/network`, `/saved`,
  `/submissions`, `/messages`, `/messages/[conversationId]`, `/settings` and `/dashboard`. This
  audit has no Supabase project or acceptance credentials in the local checkout, so those routes
  were verified by source, typecheck and contract tests only.
- Localize the remaining listing/detail surfaces, search, moderation, event registration,
  attendee lists, member detail, 404/error boundaries and the avatar/profile-strength and
  media-upload widgets listed as English-only or partial above.
- Localize server-side action error strings. They currently travel as English text in the `error`
  query parameter; converting them to message codes is a separate change.
- Localize page titles/metadata through a deliberate routing or cookie decision.
- Native Farsi and Pashto editorial sign-off recorded with reviewer, date and commit SHA.
- Full `npm run lint`, `npx tsc --noEmit`, `node --test tests/*.test.mjs`, `npm run build` and the
  CI browser workflows on the final candidate SHA.

Issue #514 remains open. This document records partial, code-backed progress, not completion.
