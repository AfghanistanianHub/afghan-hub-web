# Afghan Hub — cross-page design and responsive audit

Review PR: #511. Baseline: `b7310c3978d431e76de550a23f9b171fdab8c4fa`, including merged PR #508. Final candidate identity is recorded by the PR and its CI artifacts. Status: draft while the final attendee/contrast/accessibility changes are verified.

## Changes

- Reuse PR #508's 88rem container on Dashboard, Search, Saved, Settings, Messages, Moderation, moderation-team administration, My Events and host attendance management. Keep focused auth, conversation and long-form columns purpose-specific.
- Use the approved editorial MemberPageHeader on Search, Saved, Settings, My Events, Moderation, Moderation team and Event attendees. Remove their redundant intro cards, heavy shadows and decorative intro glows. Preserve actions, account status and attendance statistics.
- Use logical inline spacing for Dashboard separators, allow heading actions to wrap, and align catalogue button icons with shared control radii and minimum heights.
- Make the public language selector and mobile footer links at least 44px high.
- Strengthen the input border token from `#b4aa9e` to `#91877a`: contrast against the page background increases from 2.10:1 to 3.24:1; against cards it is 3.38:1. Fields use the input token rather than decorative card borders. Card borders remain subtle.
- Add explicit accessible names to profile-photo, business-cover/logo and organization-cover/logo inputs. Increase decorative goal-number contrast and use darker danger text. Closed notification/date-picker triggers no longer reference unmounted panels through aria-controls.
- Display the requested Farsi label in both Navigator language menus. Keep locale identifiers and normalization unchanged.

The circular Hero, three-node entrance, APNBC canvas, homepage scroll motion, editorial style and all existing auth/catalogue operations are retained. There are no schema or business-logic changes.

## Audit method and evidence

Live signed-in checks cover 34 surfaces/states at 390, 768, 1280 and 1440 CSS pixels: 136 recorded measurements with zero horizontal overflow. Measurements exclude hidden file inputs from touch-target checks; their visible upload controls are evaluated instead. The sanitized record is `docs/evidence/final-design-live-layout.json`. It contains no account details, message content or authentication state.

The isolated runner uses real synthetic accounts, real forms and a disposable loopback Supabase stack. The last completed paired run, 39198490690, compared baseline b7310c3 with revision 5286904: 470 before/after viewport checks across 47 routes, with zero horizontal overflow. It also completed 47 axe checks and exposed the label/contrast findings corrected in this candidate. Two independent authenticated runs on the same application tree each completed 52 browser scenarios. Final host-attendance coverage adds a real member registration and owner attendee-list interaction; its final result is in the new CI artifact.

Source-tagged gallery images show the actual canvas. Empty, populated, filtered, outage/recovered, onboarding, notification/role and auth states are retained. State captures without a baseline are marked after-only rather than presented as pairs. Detail and edit images now have separate filenames and duplicate capture paths fail the run.

## Page-by-page ledger

| Page or surface | Review and result |
| --- | --- |
| `/`, `/en`, `/fa`, `/ps` | Live English/Farsi/Pashto entry and four-width checks; isolated screenshots. Approved Hero/entrance preserved. No measured overflow. |
| `/about` | Live mobile inspection and isolated captures. English body inside localized navigation is a remaining copy-localization gap. |
| `/explore` | Live search interaction updates the URL; empty/result structure and keyboard focus checked. Isolated populated/detail captures. |
| `/explore/businesses/:slug` | Isolated published-fixture detail captures at all widths. |
| `/explore/organizations/:slug` | Isolated published-fixture detail captures at all widths. |
| `/explore/opportunities/:slug` | Isolated published-fixture detail captures at all widths. |
| `/explore/events/:slug` | Isolated published-fixture detail captures at all widths. |
| `/support`, `/privacy`, `/terms`, not-found | Isolated four-width and supplementary 320px captures; content/hierarchy inspected. |
| `/login` and signup mode | Real synthetic signup/login/error journeys and captures. Focused auth composition retained. |
| `/forgot-password`, `/update-password` | Real synthetic recovery, invalid/expired flows and separate-context journeys; screenshots retained. |
| `/profile` onboarding | Real synthetic onboarding journey and state captures. |
| `/profile` editing | Live four-width check and synthetic capture; one h1 and no overflow. Upload name corrected after axe finding. |
| `/dashboard` | Live four-width inspection and synthetic populated/empty sections. Shared width and logical spacing; decorative numbers now have readable contrast. |
| `/search` | Live intent selection, URL update and four-width checks; editorial heading replaces boxed intro. Repeated after Farsi and Pashto entry flows. |
| `/saved` | Live empty state and synthetic captures; editorial heading and shared width. |
| `/network` | Live search/mentorship-filter interaction, populated directory and four-width checks. Repeated through real Farsi/Pashto entry navigation with RTL document direction. |
| `/members/:id` | Live populated member detail and synthetic captures; one h1, no overflow at requested widths. |
| `/settings` | Live account/visibility layout and keyboard focus check; synthetic captures. Account data and settings were not saved or changed. |
| `/businesses` | Live populated directory and shared controls; synthetic filtered/empty/outage/recovery states. |
| `/businesses/new` | Live long Farsi/Pashto text, four-width form checks; synthetic native form journey. No live content was published. |
| `/businesses/:slug` | Live populated detail and isolated owner detail capture. |
| `/businesses/:slug/edit` | Isolated owner form/interaction coverage and distinct edit screenshots; upload names corrected. |
| `/organizations` | Live directory and four-width checks; synthetic filtered/empty/outage/recovery states. |
| `/organizations/new` | Live form checks and isolated native creation journey. |
| `/organizations/:slug` | Live owner detail and isolated published-fixture captures. |
| `/organizations/:slug/edit` | Live owner form layout and synthetic edit journey; upload names corrected. No live edit was saved. |
| `/opportunities` | Live empty directory/shared controls and isolated populated/filter/outage/recovery states. |
| `/opportunities/new` | Live long Farsi/Pashto content and deadline popover; four-width form check; isolated native creation journey. |
| `/opportunities/:slug` | Live owner detail and isolated public/owner detail screenshots; danger text contrast corrected. |
| `/opportunities/:slug/edit` | Live owner form layout and isolated edit journey; input border token harmonized. |
| `/events` list/calendar | Live view switch and four-width checks; isolated populated/filter/outage/recovery states. |
| `/events/my` | Live empty/host sections and synthetic host fixtures; shared editorial heading and container. |
| `/events/new` | Live form and date/time popover: fits 390px and Escape restores trigger focus. Isolated native creation journey. |
| `/events/:slug` | Isolated published-fixture owner/member detail captures and existing interaction coverage. |
| `/events/:slug/edit` | Isolated owner edit journey and distinct screenshots. |
| `/events/:slug/attendees` | Previously omitted. Now uses the shared editorial layout. Added real synthetic RSVP-to-host-list scenario and paired populated captures; final CI result required. |
| `/submissions` | Live populated owner view and isolated lifecycle/rejection/approval/outage/recovery scenarios. Shared heading/container preserved. |
| Application management | Current opportunity applications use an external URL. No separate internal application-management screen exists to visually approve; no new feature was added. |
| `/messages` | Live populated list and zero-match filtering/clear; four-width checks; synthetic empty/populated transport scenarios. |
| `/messages/:conversationId` | Live populated thread/composer checks at all widths; synthetic send/read/offline/reconnect journeys. No live message was sent. |
| Notifications | Live panel bounds at all four widths; Escape closes it and restores trigger focus. Synthetic unread/read/empty states retained. Closed-panel ARIA reference corrected. |
| `/moderation` | Synthetic authorized moderator/admin interactions, pending/recent states and screenshots; editorial header and danger contrast corrected. |
| `/moderation/team` | Synthetic admin role changes plus unauthorized refusal tests and screenshots. Shared container/editorial heading replaces the old boxed glow. No live role changes were made. |
| Community Navigator | Live English LTR, Farsi RTL and Pashto RTL panels at all four widths; no panel overflow; Escape restores focus. Synthetic structured-search/keyboard/reduced-motion scenarios retained. |

## Accessibility checks

The paired axe report found unlabeled hidden upload inputs on profile and business/organization edit screens, low-contrast goal numbering, and low-contrast danger text on moderation and owner actions. These are addressed in this candidate. Dangling closed-panel aria-controls references were reviewed and corrected on notification and date/time triggers. The design job now fails for any WCAG-tagged axe violation and preserves its JSON report.

Seven color-token regression checks cover body text, muted text, primary button text, input boundaries and danger text. Input boundaries target at least 3:1 against adjacent page/card colors; ordinary text pairs target at least 4.5:1. Reference: W3C, [Understanding Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

Live checks confirm visible keyboard outlines on Search and Settings, mobile navigation opening/closing, and focus restoration for notification, Navigator and date/time popovers. Global reduced-motion rules and existing renderer interaction tests are retained. This is evidence of the checks performed, not a claim of complete screen-reader or WCAG certification. Axe incomplete checks remain visible for review.

## Validation and limits

Local final-candidate validation: 452 tests passed, one platform-specific skip, zero failures; TypeScript and production build pass; ESLint has zero errors and six inherited warnings. Runner syntax and diff whitespace pass.

Automated responsive regression checks assert route identity, overflow, canvas presence and capture uniqueness across the route matrix. The paired gallery supports visual review; it is not a pixel-difference golden-image gate.

The remaining product localization gap is explicit: entry routes and Navigator support native Farsi/Pashto UI, while many member/public-page labels remain English. Native content reflow and real RTL entry flows were tested, but complete translation was not implemented by this visual pass. Final CI/axe/host screenshots must be reviewed before changing this PR's draft status.
