# Controlled member/auth acceptance runbook — 2026-09-13

This runbook is the next release gate after the public visual-refresh delivery. It turns the remaining authentication/member acceptance work into a bounded, repeatable checklist without changing production authorization, schema, content, storage, or user data.

## Safety boundary

- Use designated disposable test accounts only.
- Never commit credentials, access tokens, reset links, or mailbox contents.
- The automated harness uses the public/publishable Supabase key only. It does not use a service-role key and performs no signup, password-reset, profile/content write, moderation action, or database/schema mutation.
- Production execution requires an explicit acknowledgement in `AUTH_ACCEPTANCE_ALLOW_PRODUCTION` so the script cannot be pointed at production accidentally.
- The profile-privacy rehearsal in `scripts/security-profile-personas.mjs` remains **isolated non-production only**. Do not weaken its production hard stop.

## Persona matrix

Minimum release-acceptance set:

| Persona | Required | Expected role | Purpose |
| --- | --- | --- | --- |
| Member A | yes | `member` | ordinary-user positive path |
| Member B | yes | `member` | second ordinary account / cross-account journey |
| Moderator | strongly recommended | `moderator` | moderation capability boundary |
| Admin | strongly recommended | `admin` | privileged capability boundary |

All personas should be email-confirmed and onboarding-complete before the automated account/session check is treated as passing.

## Phase 1 — automated account/session acceptance

Configure the following only in the operator shell or a temporary untracked env file:

```text
AUTH_ACCEPTANCE_SUPABASE_URL=https://PROJECT_REF.supabase.co
AUTH_ACCEPTANCE_PUBLISHABLE_KEY=...
AUTH_ACCEPTANCE_MEMBER_A_EMAIL=...
AUTH_ACCEPTANCE_MEMBER_A_PASSWORD=...
AUTH_ACCEPTANCE_MEMBER_B_EMAIL=...
AUTH_ACCEPTANCE_MEMBER_B_PASSWORD=...
AUTH_ACCEPTANCE_MODERATOR_EMAIL=...       # optional, recommended
AUTH_ACCEPTANCE_MODERATOR_PASSWORD=...    # optional, recommended
AUTH_ACCEPTANCE_ADMIN_EMAIL=...           # optional, recommended
AUTH_ACCEPTANCE_ADMIN_PASSWORD=...        # optional, recommended
```

For the Afghan Hub production project only, also set exactly:

```text
AUTH_ACCEPTANCE_ALLOW_PRODUCTION=I_UNDERSTAND_THESE_ARE_DISPOSABLE_TEST_ACCOUNTS
```

Then run:

```bash
node scripts/member-auth-acceptance.mjs
```

Pass criteria for each configured persona:

1. Password sign-in succeeds.
2. Supabase returns an authenticated user and session.
3. The account is email-confirmed.
4. `auth.getUser()` resolves to the same account.
5. The account can read only its own `id`, `role`, and `onboarding_completed` fields for this check.
6. The profile role matches the intended persona.
7. Onboarding is complete.
8. Session refresh succeeds.
9. Local sign-out clears the local session.

This phase is deliberately read-only with respect to application data. It does **not** prove browser cookie/session propagation, email delivery, password-reset links, cross-tab behavior, or authorization deny paths.

## Phase 2 — browser auth delivery acceptance

Use one fresh disposable account and a mailbox controlled by the operator. Record only pass/fail and timestamps; do not paste links, tokens, or message contents into issues or PRs.

### Fresh signup / confirmation

1. Open `/signup` in a private browser session.
2. Register the designated disposable email.
3. Confirm that the UI does not leak raw provider/database errors.
4. Confirm the verification email is delivered.
5. Open the confirmation link once.
6. Confirm the callback completes successfully and the account can proceed through onboarding.
7. Re-open the same confirmation link and verify the expired/already-used path is user-safe.

### Password reset

1. From the account-recovery entry point, request a reset for the disposable account.
2. Confirm reset email delivery.
3. Open the reset link and set a new disposable password.
4. Confirm the old password no longer signs in and the new password does.
5. Re-open the reset link and confirm the expired/used-link experience is user-safe.

### Session / cross-tab

1. Sign in in tab A and open an authenticated dashboard route.
2. Open tab B in the same browser profile and verify the authenticated state is recognized.
3. Sign out in tab A.
4. Refresh tab B and verify it no longer has authenticated access.
5. Directly request a protected route while signed out and confirm redirect behavior is correct.

## Phase 3 — controlled member and role acceptance

With Member A, Member B, Moderator, and Admin available, verify both positive and deny paths. Use only disposable content where a write is necessary.

Required matrix:

- Member A can access ordinary member surfaces after onboarding.
- Member A cannot access admin-only moderation/team capabilities.
- Member B cannot act as Member A or mutate Member A-owned records.
- Direct conversation creation is available only where the accepted-connection prerequisite is satisfied.
- Conversation/message reads are limited to members of that conversation.
- Moderator can use only intended moderation capabilities and cannot use admin-only account-management capability.
- Admin can access the intentionally privileged moderation/account-management capability.
- Sign-out removes access for every persona.

If any step would touch real member data, stop and replace it with disposable fixtures or an isolated target. Do not broaden production grants/RLS to make acceptance easier.

## Phase 4 — isolated security rehearsal

The auth acceptance gate and the #67/#80 security rehearsal are separate gates. After a trustworthy production-compatible isolated database exists:

1. Apply the reviewed #67 forward rehearsal there.
2. Run `scripts/security-profile-personas.mjs` with isolated persona tokens.
3. Verify the exact rollback rehearsal.
4. Re-run the persona matrix after rollback.
5. Rehearse #80 Phase A structural-privilege changes and rollback in the same isolated discipline.

Do not apply #67 or #80 authorization DDL to production until isolated evidence is complete and reviewed.

## Evidence to record

For each acceptance run, record:

- target environment (production or isolated);
- exact application commit SHA;
- exact timestamp window;
- configured personas by label only (`Member A`, `Member B`, etc.); never email addresses;
- automated harness pass/fail summary;
- browser signup/confirmation/reset/session pass/fail summary;
- role/capability positive and deny-path summary;
- any defects with reproducible steps that omit secrets and personal content.

A release gate is not closed by CI alone. It closes only when the applicable manual browser/email steps and the controlled persona matrix have been executed successfully.
