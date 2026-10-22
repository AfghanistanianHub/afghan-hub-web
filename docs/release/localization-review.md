# Localization review — English, Farsi, Pashto

Updated 2026-10-20. This document replaces the obsolete four-language Navigator review instructions. The supported user-facing locale set is **en**, **fa**, and **ps** only. **Dari is not a separate UI language.** Legacy `fa-AF`, `fa_*`, and `prs` identifiers normalize to `fa` through `src/lib/i18n/site-language.ts`. Do not reintroduce separate Dari menus, dictionaries or preference options.

## Confirmed repository baseline

- PRs #517–#523 are merged; their auth, navigation, dashboard and settings localization must not be reimplemented without an identified regression.
- The public About page has en/fa/ps body copy; the previous assertion that it has English-only body text is stale.
- The authenticated loading boundary had an English-only screen-reader status; localized in the current candidate branch.
- The Saved page still contains English-only heading, explanatory content, load error, empty states, and call to action. Other routes require inspection before completion is claimed.
- Issue #514 remains open. This is a **partial, code-backed audit**, not a claim that all MVP routes are translated.

## Required route inventory and review evidence

| Area | Representative routes | Status on 2026-10-20 |
| --- | --- | --- |
| Entry/home/About | `/`, `/en`, `/fa`, `/ps`, `/about` | Translated components observed; full browser audit outstanding |
| Support/Explore/legal | `/support`, `/explore`, `/explore/[kind]/[slug]`, `/privacy`, `/terms` | Privacy page source confirmed English-only; remaining states unverified |
| Auth/onboarding | `/login`, `/forgot-password`, `/update-password`, `/profile` | Auth PRs merged; completion unverified |
| Core member workspace | `/dashboard`, `/members/[id]`, `/settings`, `/network`, `/search`, `/saved` | Nav and selected dashboard/settings copy merged; Saved source confirmed English-only |
| Catalogues | `/businesses`, `/organizations`, `/opportunities`, `/events`, including `/new`, `/[slug]`, `/[slug]/edit` | Not fully audited |
| Applications & communications | `/submissions`, `/messages`, `/messages/[conversationId]`, `/events/my`, `/events/[slug]/attendees` | Not fully audited |
| Administration & Navigator | `/moderation`, `/moderation/team`, public/member Navigator | Navigator three-locale contract exists; full user-facing state inventory and native review outstanding |
| Shared system states | loading, empty, errors, not-found, forms, dialogs, validation | Member loading announcement fixed in this candidate; all other states require matrix evidence |

## Review gates before issue #514 can close

1. Enumerate every reachable MVP route and every interactive state, including email/password errors and access-denied variants; publish complete locale-key coverage, documenting any intentionally untranslated user-generated content.
2. Check desktop 1440/1280/768 and mobile 390 px views for en/fa/ps in real signed-out and isolated authenticated sessions. Capture browser evidence, mixed-direction identifiers, overflow, focus order, icons, mobile drawer, and accessible names.
3. Check language preference through deep links, redirects, sign-in, sign-out, refresh and mid-form language switching without avoidable data loss.
4. Run TypeScript, ESLint, localization tests, production build and browser journeys against the **same candidate commit SHA**. Do not infer success from historical reports.
5. Arrange native Farsi and Pashto editorial review. Translation completeness tests do not establish idiomatic accuracy. Never machine-translate member-generated titles, messages or descriptions without consent.
6. Keep the approved entrance, circular hero, canvas background and route/SEO conventions. Do not add decorative language-entrance network lines.
7. Keep issue #514 open and PRs unmerged until the above evidence exists.

