# Afghan Hub current state

## Stage
Public website and discovery are shipped. Main now includes launch-hardening through merged PR #65 (`fe2194ce4c0d6e664c1eb0cef149f08a687e6a79`). Recent exact PR heads passed Node 22/24 CI and Vercel before merge.

## Recently completed
- Account forms: pending feedback, repeat-submit protection, accessible status/errors, login compatibility with existing shorter passwords (#52).
- App recovery: standard Next.js error boundaries and repeatable anonymous smoke verification (#57).
- Public/mobile polish and reduced-motion/focus improvements (#56).
- SEO: auth/recovery noindex, Open Graph image, published detail URLs in sitemap (#58, #59).
- Delivery: CI aligned to supported Node 22/24 runtimes and current GitHub actions (#60).
- Content guardrail: exact placeholder public copy such as `N/A`/`Test` is treated as missing without editing production data (#61).
- Auth callback hardening: explicit signup confirmation callback, allowlisted callback destinations, flow-specific expired-link recovery, regression coverage (#62).
- Route UX: accessible loading states for member workspace/public discovery and branded global 404 recovery (#64, #65).

## Readiness
The repository now has stronger public SEO, failure/loading recovery, auth callback handling, content presentation guardrails and release verification. Full authenticated end-to-end acceptance is still outstanding. Do not describe the product as fully launch-ready until the remaining acceptance and policy dependencies below are resolved.

## Remaining launch dependencies
1. Real registration/confirmation/password-reset delivery with a designated test account, including expired links, session expiry and sign-out behavior.
2. Multi-account member journey: discovery → connection → conversation → unread/read → contribution → moderation, with unrelated-member denial and moderator/admin personas.
3. Production-compatible authorization/persona testing and migration-baseline reconciliation in an isolated/staging database. Never replay/repair production migration history blindly.
4. Editorial cleanup or unpublishing of disposable test records. Public guardrails hide exact placeholder descriptions but do not delete or invent content.
5. Privacy/terms/contact and support surfaces require factual operator identity, support contact, retention/deletion process and product decisions for account deletion/export and abuse/blocking.
6. Broader accessibility/responsive QA across remaining member flows and final release rehearsal/backup-recovery verification.

## Cost and safety constraints
Prefer deterministic CI/tests/builds and existing free infrastructure. Do not trigger token-consuming Autopilot or add paid services without explicit approval. Do not modify production schema/RLS/data or expose member data without a reviewed plan and field-level privacy evidence.
