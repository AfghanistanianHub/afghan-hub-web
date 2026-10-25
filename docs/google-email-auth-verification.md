# Google and email authentication completion

## Delivery status

Repository work is ready for review, **not end-to-end acceptance or Production release**. Base: `bd5f04f` (latest main fetched for this task). No Production deployment, Auth setting change, schema migration or account mutation was performed.

## Audit

- Existing email/password signup/login, token-hash confirmation, PKCE email callback, recovery, password policy, logout and SSR session refresh were preserved.
- Google OAuth had no application implementation. A read-only request to the production project's public `/auth/v1/settings` returned `external.google=false`, `external.email=true`, `disable_signup=false`, `mailer_autoconfirm=false`.
- Read-only catalog inspection verified `profiles` RLS is enabled and `on_auth_user_created` inserts a profile keyed by `auth.users.id`. Existing profile save uses the authenticated ID; callbacks do not create profiles or write identity/ownership columns. The primary key prevents duplicate profile rows for a user. Existing ownership, connections, messages and organizations are untouched.
- Private provider settings (client ID/secret, redirect allowlist, manual-linking setting) are not exposed by the available Supabase connector and were not read or changed. RLS enabled is not a complete policy/persona audit.

## Changes

- Separate Google and email controls on login/join, standard multicolor Google mark, consistent control dimensions, accessible names/pending state, three-language copy and RTL boundaries.
- Server Action initiates Google via existing Supabase SSR client (SDK-managed PKCE verifier/cookies). Public provider settings are checked with a bounded timeout so a disabled provider leaves users on an actionable screen rather than a raw Auth error.
- Callback exchanges the code through Supabase, rejects duplicate/missing codes and provider errors, redacts provider details, allows only known member route shapes, uses configured deployment origin (never request Host), prevents caching/referrer disclosure, and refuses HEAD token consumption.
- Signed-out member requests retain a validated destination through login; refreshed cookies are copied to the redirect. Existing dashboard guard routes incomplete profiles to the shared profile builder; complete profiles retain their requested route.
- Language persists through callback query/cookie and browser preference; profile-builder labels, hints, avatar controls and profile-strength labels support English/Farsi/Pashto. No Dari locale.
- No new runtime dependencies or secrets.

## Identity linking: operator decision required

Supabase documents **automatic linking** of eligible identities with the same verified email. This is provider behavior, not an Afghan Hub merge implementation. This PR does not call `linkIdentity`, merge rows by email, change linking settings, or move ownership/data.

The mission's requirement for explicit linking consent must be reconciled with Supabase's automatic-linking policy **before enabling Google**. Do not claim that application code disables provider automatic linking. If explicit consent is mandatory even for matching verified emails, obtain a supported provider-side policy and reviewed design first. Manual linking is a separate opt-in authenticated OAuth flow and must not be used as an unauthenticated merge workaround.

Sources:
- https://supabase.com/docs/guides/auth/social-sign-in/auth-google
- https://supabase.com/docs/guides/auth/server-side/advanced-guide
- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/docs/guides/auth/auth-identity-linking

## Required setup (not performed)

1. Use an approved non-production Supabase target with compatible schema/RLS and authorized disposable Google/email identities plus test inbox. Do not repurpose the secondary project without approval.
2. In Google Cloud Console configure a Web OAuth client/consent screen. The authorized redirect URI is the selected Supabase project's `https://<project-ref>.supabase.co/auth/v1/callback`, not the app callback. Store client secret only in Supabase's Google provider settings, never public environment variables/source.
3. Enable Google only on the explicitly authorized target. Production changes need separate approval.
4. In Supabase redirect settings allow the exact app callback on approved Preview/Production origins, including permitted callback query variants. Prefer explicitly scoped paths/Preview project patterns over unrestricted Vercel wildcards. Keep Site URL/email-template behavior under operator change control.
5. For each Preview, set `NEXT_PUBLIC_SITE_URL` to that Preview's trusted origin or leave it unset to use `VERCEL_URL`. A shared Production override wins and would send callbacks to Production; remove that override from Preview scope. Never trust Host/X-Forwarded-Host for this setting.
6. Keep reviewed token-hash confirmation/recovery templates unless an approved change is needed. They use `.SiteURL`; operator must verify they target the intended environment, especially when Preview shares Production Auth. Cross-device email confirmation cannot inherit origin-local browser language automatically.
7. Do not relax password policies, confirmations, PKCE, CSRF or RLS to unblock tests. Never paste credentials into PRs/chat.

## Verification

- `npm ci`: successful; npm reports 14 existing dependency vulnerabilities (4 moderate, 9 high, 1 critical). No dependency upgrade attempted in this focused change.
- `npm run lint`: zero errors, eight pre-existing warnings.
- `npx tsc --noEmit`: passed.
- `node --test tests/*.test.mjs`: 469 passed, zero failed, one skipped in the final full run.
- `node --check agents/orchestrator.mjs`: passed.
- `npm run build`: passed with public Supabase URL/publishable key only. No deployment.
- Targeted executable tests cover OAuth initiation, provider-disabled/failure redaction, trusted callback/destination, exchange failure, cancellation, duplicate codes, locale and HEAD rejection; existing email confirmation/recovery, password policy and profile-ownership tests remain.
- Local browser at 390×844: English/Farsi/Pashto login/join UI, RTL, accessible control names, no horizontal overflow; both provider buttons measured 310×50 CSS pixels. Native select keyboard automation did not reliably change options; locale changes were exercised by dispatching the select's change event. Keyboard focus reached the Google control.
- Local browser: real provider-disabled button submission returned localized actionable error without leaving the app. Synthetic cancellation callback returned localized safe feedback, preserved `/messages`, and did not display `error_description`. These are error-path tests, **not successful OAuth**.
- Captured mobile Farsi PNG is retained as raw evidence but the capture was visibly clipped despite correct DOM rectangles; it is not offered as visual signoff. A desktop capture was blocked by the browser not being drawn while the app window was covered. Recording includes setup/failed selector interactions, so is not supplied as a successful journey demo.
- Vercel connector deployment listing failed twice with SSRF-guard errors; latest hosted Preview could not be discovered/verified through that integration.

## Blocked acceptance — not passed

User chose “Finish PR with explicit blockers.” No disposable accounts, authorized Google identity or test inbox were supplied; Google is disabled. Consequently these remain unverified on a latest hosted Preview:

- New/returning Google success; correct Supabase identity and persisted session.
- New email signup and inbox confirmation; duplicate account behavior.
- Actual password recovery email and reset completion.
- Real provider cancellation (synthetic callback only tested) and upstream provider errors.
- Existing email account signing in through Google and provider-side linking/explicit-consent policy.
- Authenticated onboarding completion/resumption/bypass, data ownership preservation, logout/session refresh, mobile signed-in flows and all three languages end-to-end.

Do not merge as a claim of completed authentication acceptance. Enable/configure an approved test target, resolve linking policy, then run the full requested browser matrix and attach successful Preview evidence before release.
