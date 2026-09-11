# Release verification

Run `node scripts/smoke-public.mjs` against a running production build on localhost:3000. For another origin, set `SMOKE_BASE_URL` to that origin. Checks are anonymous, read-only and require no keys. They validate public pages, basic sitemap content, unsupported detail noindex/404 and member redirects. They do not prove successful database reads, authenticated behavior, visual quality, or interactive error recovery.

## Current recovery milestone

This clean recovery branch ports the page/root-layout error recovery work onto the post-#52 main branch. Lint, type check, production build and regression tests must pass again on this branch before merge. Fault injection browser verification remains incomplete: earlier local development hit EMFILE watcher limits and browser navigation timed out. Temporary fixtures were removed; no test routes were deployed.

## Database audit, 2026-09-11

Read-only checks on the configured production project found:
- Zero anonymous-callable SECURITY DEFINER functions in public.
- Zero public SECURITY DEFINER functions without an explicit search_path.
- No public ordinary/partitioned tables with RLS disabled.
- Neither anonymous nor authenticated roles can CREATE in public.
- Authenticated direct INSERT is revoked on conversations and conversation_members.

These are specific checks, not a complete security certification. The advisor's authenticated-callable RPC warnings need function-by-function authorization tests. Existing auth.uid()/role/connection guards were seen in inspected functions. No user records were returned or modified.

The applied migration history has 45 entries; the repository migration folder has 29 and lacks the original table-creation baseline. Names overlap but versions differ. Do not blindly db push, repair migration history, or replay these files against production. Reconstruct a reviewed baseline and verify a fresh isolated database before calling disaster recovery/staging reproducible. The production schema and migration history were not changed.

## Outstanding inputs and acceptance

Operator identity, public support contact, jurisdiction and deletion/retention process are requested from the owner for accurate policy pages. Real signup/email recovery and multi-account member journeys require designated test accounts/environment. `AFGHAN_HUB_LAUNCH_REVIEW.md` contains the broader checklist. Do not claim the whole project is complete until these and interactive/responsive acceptance are resolved.
