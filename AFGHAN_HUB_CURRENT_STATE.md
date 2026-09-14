# Afghan Hub current state

## Authoritative checkpoint — 2026-09-14

This checkpoint supersedes the obsolete pre-rollout checkpoint previously in this file. Reconciliation used live main, the current profile-access adapter, open issues and their rollout evidence. Main at the start of this work was `a62e156bfd7714169b5afdabbfd48820a3826509`. Do not treat that SHA as the resulting head of this change.

## Delivered

- Public visual refresh: homepage, Explore, listing details, mission page and supporting loading/not-found states are shipped.
- #67 profile privacy: production now uses narrow access-context/admin RPCs; ordinary members cannot directly SELECT private role/email columns. The isolated synthetic persona rehearsal preceded rollout.
- #80 current-table structural grants: production has zero remaining TRUNCATE/TRIGGER/REFERENCES/MAINTAIN grants for anon/authenticated; postgres-owned future-table defaults were narrowed. The owner-specific residual below remains open.
- #93 draft media privacy is closed. Production business-media and organization-media buckets are private, with published-or-owner SELECT policies. Uploads store supabase:// references; the existing published organization logo was migrated with its moderation state preserved. Application images resolve signed URLs.
- Issue #93 rollout evidence records successful Node 22/24 CI and Vercel for application commit a62e156.
- Auth acceptance infrastructure exists, but its old direct profiles.role read conflicted with #67. This change replaces it with get_my_access_context and guarantees local sign-out in finally. Three synthetic behavioral regression tests cover success with direct reads forbidden, role mismatch and RPC failure.

Synthetic regression tests do not establish hosted account, mailbox or browser acceptance. Fresh final-head CI/Vercel and resulting-main checks must be verified separately.

## Remaining launch gates

1. #119: real disposable-account signup/confirmation/reset delivery, expired-link, session and cross-tab acceptance. A controllable mailbox and designated credentials are required. No Gmail tool is exposed in the current session.
2. #120: controlled hosted multi-account member/moderator/admin journey, including success and deny paths. Do not test with unrelated real users.
3. #80 residual: supabase_admin-owned future-table default ACL. The project migration role previously returned permission denied; use only a supported authorized owner/platform route. Current tables are already hardened.
4. #105: eight previously identified test-content rows need deliberate disposable-content approval before deletion/unpublishing. Existing placeholder guards suppress published test opportunities from public catalog and sitemap.
5. #99 partial delivery: SAM Azad and info@apnbc.ca are operator-confirmed. /privacy, /terms and /support now provide current service facts, email request/reporting routes and explicit limitations; links are in the public footer, sign-in/join and Settings, and all three are in the sitemap and 15-route smoke harness. Jurisdiction/contractual terms, retention and deletion/export fulfillment including backups/shared content remain undecided. Keep #99 open until those processes and decisions are confirmed.
6. Final release rehearsal, backup/recovery verification, browser acceptance and exact-main production smoke after the remaining gates.

Do not close #119/#120 based on mocks, static review or historical usage aggregates.

## Support/contact delivery — 2026-09-14

This change delivers the public information/support surfaces above. It does not establish legal compliance or deletion/export fulfillment. The confirmed support email is info@apnbc.ca; the earlier Gmail address is superseded. Do not request Gmail again: it was declined. Hosted acceptance can use an operator-controlled manual email workflow, but pass/fail evidence is still needed. Issue #119 was closed externally without recorded acceptance evidence; do not infer a hosted test pass from its closed status.

## Account/profile download — 2026-09-14

Settings now offers a scoped account/profile JSON download via POST /api/account/export. Authentication, exact same-origin checks, explicit field allowlists and private no-store responses protect the route. It reads only the validated user's profile using the existing session/RLS; no service-role key, grant change or mutation is involved. Five behavioral security tests cover deny paths, owner scoping, redaction and missing profile handling. Anonymous hosted smoke now includes the denied download path and cross-origin rejection (16 checks total).

This is not a complete data export: messages/conversations, connections, contributions, saves, RSVPs and file contents remain outside scope. Wider export and deletion handling remain part of #99. No live authenticated download has been claimed without designated test-account evidence.

## Continuation and constraints

- Prefer fixing concrete regressions and batching meaningful changes over generating more review-only infrastructure.
- Zero-cost mode: no paid agents/Autopilot, upgrades, purchased credits or potentially billable Supabase branches.
- The existing separate Supabase project was used for isolated rehearsal on 2026-09-13. Old statements that no staging target exists are superseded.
- Do not blindly replay repo migrations or run db push against production. Production history does not align one-to-one with repo files; current metadata and same-window rollback evidence govern security work.
- Preserve the existing profile privacy and draft-media boundaries. No broad grant, blanket function revocation, Auth weakening or production reset for test convenience.
- Production mutations require the applicable isolated evidence, rollback and explicit risk decision. Continuing work does not automatically authorize deleting real/test production content.
- Never commit credentials, tokens, session cookies or confirmation/reset links. Record only non-sensitive acceptance evidence.
- Keep issue evidence as the detailed record: #67, #80, #93, #99, #105, #119 and #120. Verify live main and deployments on the next continuation.
