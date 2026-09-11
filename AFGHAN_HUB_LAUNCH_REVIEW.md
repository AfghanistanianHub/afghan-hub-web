# Afghan Hub launch review

Reviewed 2026-09-11 against main `fe2194ce4c0d6e664c1eb0cef149f08a687e6a79` after launch-hardening PRs through #65. Recent PR heads were merged only after Node 22/24 CI and Vercel passed. No production schema, RLS or content write was performed during this hardening sequence.

## Implemented and verified to a defined extent

| Area | Evidence now on main | Remaining acceptance work |
| --- | --- | --- |
| Public website | Landing, mission, category discovery/search/pagination/details; mobile/public interaction polish; accessible loading state; branded global 404 | Editorial review and broader accessibility/intermediate-width QA |
| Public SEO | Titles/canonicals, search noindex, member/auth/recovery noindex, Open Graph image, robots, static + published-detail sitemap | Final production crawl/index review |
| Authentication | Login/signup/recovery actions; pending-state protection; explicit signup confirmation callback; allowlisted callback destinations; flow-specific expired-link recovery; regression coverage | Real confirmation/reset email delivery, session expiry and cross-tab sign-out acceptance |
| Operational recovery | App/global error boundaries, retry path, route loading states, global not-found recovery, repeatable anonymous smoke script | Error-monitoring/support ownership and production failure drills |
| Content presentation | Public queries remain published-only/anonymous/field-allowlisted; exact `N/A`/`NA`/`Test`/`Testing` summary/description placeholders are hidden at render mapping without production edits | Owner/editor must correct or unpublish disposable real records |
| Member application | Dashboard, profile, settings, network, messaging, notifications, saved content and search routes exist | Multi-account end-to-end acceptance; route presence is not proof of completion |
| Contribution | Create/edit/moderation flows for four listing types; event RSVP/calendar/attendees | Owner/unrelated-member/moderator/admin tests, capacity concurrency and upload-failure acceptance |
| Security | Existing hardening migrations; public catalog excludes member profiles; auth callback next destinations are allowlisted | Reconcile migration baseline and execute authorization-persona tests in production-compatible staging |
| Delivery | CI runs install, lint, typecheck, regression tests, syntax check and production build on supported Node 22/24; GitHub Actions upgraded from deprecated Node-20-backed versions | Exact-main release rehearsal and production smoke verification at final candidate |

## Priority work remaining

1. **Real account-entry acceptance:** use a designated test account to verify registration, confirmation delivery, confirmed login, password reset delivery, expired confirmation/reset links, session expiry and sign-out behavior. Code paths are hardened, but no synthetic unit test can prove external email delivery or provider configuration.
2. **Multi-account member journey:** execute discovery → connection → accept/decline → conversation → unread/read updates → contribution → moderation using at least two ordinary members plus moderator/admin personas. Include hidden profiles and unrelated-member denial.
3. **Authorization and migration rehearsal:** reconstruct a reviewed migration baseline and test a fresh isolated/staging database before any production schema operation. Production applied history and repository migration history were previously observed to differ; do not blindly `db push`, repair versions or replay migrations against production.
4. **Editorial readiness:** identify real published records with disposable/test content and correct or unpublish them. The public placeholder guard prevents exact placeholder descriptions from being shown but intentionally does not delete, rewrite or invent production content.
5. **Policies/support/product decisions:** privacy, terms and contact/support surfaces need factual operator identity, support contact, retention/deletion process and applicable terms. Account deletion/export and abuse reporting/blocking require product decisions and implementation scope.
6. **Accessibility/responsive acceptance:** keyboard navigation, focus restoration, form errors, long labels/content, contrast, reduced motion and intermediate widths across remaining authenticated flows.
7. **Operational ownership:** define error monitoring, incident/support contact and backup/recovery procedure without exposing message contents or personal data.
8. **Final release rehearsal:** run the accepted scenarios on a production-compatible environment, verify backup/recovery, run exact-main CI and anonymous smoke checks, deploy, then document any known limitations. Do not claim full launch readiness before these dependencies are resolved.

## Security advisor follow-up

Earlier read-only Supabase advisor results were warnings, not demonstrated exploits:
- `pg_trgm` installed in public. Check dependency use before relocating it through a reviewed migration.
- 18 authenticated-callable `SECURITY DEFINER` functions. Many may be deliberate application RPCs; review authorization, grants and `search_path` individually rather than blanket revocation.
- Leaked-password protection was disabled. Confirm feature availability and cost before changing configuration; do not enable a paid setting without explicit approval.

A previous read-only audit also found no anonymous-callable public `SECURITY DEFINER` functions, no ordinary/partitioned public tables with RLS disabled, no `CREATE` privilege for anon/authenticated in public, and direct authenticated `INSERT` revoked on conversation membership tables. These findings reduce concern but do not replace persona-level acceptance testing.

## Cost and change-control constraints

Use deterministic CI/tests/builds and existing free infrastructure first. Do not trigger token-consuming Autopilot, buy credits or add paid services without explicit approval. Do not alter production schema/RLS/data, secrets, auth-provider policy or public member visibility without a reviewed plan and an explicit risk decision.
