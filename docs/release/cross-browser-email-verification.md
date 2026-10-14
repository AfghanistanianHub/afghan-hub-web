# Cross-browser confirmation and recovery

## Implementation

`/auth/confirm` accepts a Supabase token hash for only `email` (signup confirmation) or `recovery`. The server calls `verifyOtp` using the request-scoped SSR client; its cookie adapter writes the authenticated session into the receiving browser. It does not copy sessions or require the browser that requested the email to provide a PKCE verifier.

Verified flow type fixes the destination to `/dashboard` or `/update-password`. User-provided destinations are ignored. Missing, malformed, repeated, unsupported or invalid parameters fail with generic feedback. Tokens and provider errors are not logged or placed in redirect URLs. Redirects are private/no-store and set a no-referrer policy. HEAD returns 405 without verification, preventing HEAD link probes from consuming tokens. GET-based email scanners can still redeem a one-time link; external scanner and deliverability behavior remains unverified.

The existing `/auth/callback` remains unchanged for previously issued PKCE links and other compatible existing callers. Existing links are not retroactively converted into cross-browser links.

## Email templates and activation boundary

Reviewed templates are `supabase/templates/confirmation.html` and `supabase/templates/recovery.html`. Both build links from the operator-configured `SiteURL`, not user metadata or an arbitrary RedirectTo value.

The disposable preparation script copies these templates and adds their configuration only to its newly created loopback stack. Repository `supabase/config.toml`, hosted authentication settings, SMTP credentials and Production templates are unchanged.

Hosted activation is a separate operational step:

1. Deploy the route to an authorized isolated hosted test application and identify its corresponding isolated Supabase project. Confirm that Site URL is that test application's public origin. Do not point the test at Production or use real identities.
2. Preserve the two existing hosted template values, then configure the confirm-signup and reset-password templates with the reviewed HTML in that isolated service. Configure the matching Site URL. Template support and external delivery must be available in the authorized service; do not buy a plan or provision a mail service implicitly.
3. Send signup and reset requests using synthetic identities. Open actual delivered links in a fresh browser/device; verify the correct account, password replacement, old-password refusal, one-time redemption, expiration, wrong-type refusal, sign-out/replay and cleanup. Disable any email-provider click tracking that rewrites authentication URLs.
4. Review exact revision evidence before any separate Production activation decision. Deploy the compatible route before changing hosted templates; leave the legacy callback available for previously issued emails.

Rollback: restore saved hosted templates to the legacy flow first. Keep `/auth/confirm` available until already issued token links have expired. This document does not authorize Production changes.

## Acceptance contract

The complete disposable acceptance suite reads links from real local Mailpit deliveries. It tests same-context signup/recovery and successful separate-context signup/recovery with independent cookie stores. No token or session is injected into the receiving browser. The requesting browser remains signed out. It also checks password mismatch, old/new password behavior, wrong token type, malicious destination input, HEAD non-consumption, duplicate requests, expiration, superseded links, signed-out replay and fixture/stack cleanup.

The older 4ef04a8 results established safe refusal of cross-context PKCE exchanges; they do not verify this new implementation. New complete passes must be obtained at the final immutable revision. External delivery, real physical-device compatibility and hosted activation remain unverified until explicitly tested in an authorized service.

References: https://supabase.com/docs/guides/auth/auth-email-templates and https://supabase.com/docs/guides/local-development/customizing-email-templates
