# Afghan Hub launch review

Reviewed 2026-09-11 against main `91dd40c3e3d98ba526993da5251c3da3ef72d2bf` (PR #51 merged). No open PRs at audit start. The local source tree matches main. Main Node CI run 34559927021 passed; production deployment and public landing were verified in the preceding release check.

## Implemented and verified to a defined extent

| Area | Evidence | Remaining acceptance work |
| --- | --- | --- |
| Public website | Landing, mission, categories/search/pagination/details; desktop/mobile/tablet review; published-only anonymous queries | Content review and broader mobile/accessibility testing |
| Public SEO | Titles/canonicals, search noindex, member layout noindex, six-entry sitemap and robots | Social preview image, published-detail sitemap, auth-page indexability review |
| Authentication | Login/signup/recovery actions and callback exist; member-entry regression tests | Real confirmation email, expired-link recovery, session expiry and sign-out across tabs |
| Member application | Dashboard, profile, settings, network, messaging, notifications, saved content and search routes exist | Multi-account end-to-end acceptance; route presence is not proof of completion |
| Contribution | Create/edit/moderation flows for four listing types; event RSVP/calendar/attendees | Owner/unrelated-member/moderator/admin tests, capacity concurrency, upload failures |
| Security | Hardening migrations for roles, identity, URLs, contact fields, storage, conversations and message history | Reconcile applied migration history and test each authorization persona against production-compatible staging |
| Delivery | CI runs lint, type checking, all regression tests and builds on Node 20/22 | Repeat exact-main CI + production verification after each merge |

## Priority work remaining

1. **Account-entry acceptance:** test registration/confirmation and reset delivery with a designated test account. This branch improves pending states, screen-reader notices and compatibility with existing passwords. No real account credentials were entered and no reset emails were sent during this audit.
2. **Member journey:** execute discovery → connection → conversation → unread/read updates → contribution → moderation with at least two test members and moderator/admin personas. Include hidden profiles and unrelated-member denial. Existing unit coverage does not replace this.
3. **Operational reliability:** add route error/loading recovery where absent; verify failure states instead of blank/default framework errors. Define error monitoring and an operational contact without exposing message contents or personal data.
4. **Content readiness:** public records still include `Test`/`N/A` descriptions. Owner/editor should identify real records and correct or unpublish disposable entries; no automatic deletion or invented content.
5. **Policies and support:** privacy/terms/contact surfaces are absent from the route inventory. Need the operator identity, support contact, retention/deletion process and applicable terms before publishing factual policy text. Account deletion/export and abuse reporting/blocking need product decisions and implementation scope; no implementation was found in the targeted audit.
6. **Privacy-safe member discovery:** current public catalog deliberately excludes members. Inspect exact profile field visibility and consent before adding anonymous member pages; `is_public` currently appears in member settings and is not sufficient evidence that every profile field may be exposed.
7. **Accessibility/responsiveness:** keyboard navigation, focus restoration, form errors, long labels/content, contrast and intermediate widths across remaining member flows. Earlier QA covered selected surfaces, not the entire product.
8. **Final release rehearsal:** run above scenarios on a production-compatible test environment, verify backup/recovery arrangements and document known limitations. Do not assign an arbitrary completion percentage or describe launch as fully ready yet.

## Security advisor follow-up

Read-only Supabase security advisors reported warnings, not a demonstrated exploit:
- `pg_trgm` is installed in public: [extension guidance](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public). Check dependencies before relocating it through a migration.
- 18 authenticated-callable SECURITY DEFINER functions: [function guidance](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable). Many are deliberate application RPCs. Review their authorization/search paths and grants individually; blanket revocation would break core flows.
- Leaked password protection disabled: [password guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). Check availability and any plan cost before changing configuration. No paid service or setting was enabled.

No schema, RLS, production data or authentication configuration was changed in this audit.
