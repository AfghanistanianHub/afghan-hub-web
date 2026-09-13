# Isolated authorization rehearsal — 2026-09-13

Target: the separate non-production Supabase project only. Production was not modified.

## Qualification

The isolated project had zero Auth users, zero Storage objects and zero application-table rows before fixture setup. It is older than production (10 public application tables vs 12 in production) and is therefore not a full production clone. It is nevertheless suitable for a focused authorization rehearsal of the profile/privacy and structural privilege changes below.

## #67 profile privacy rehearsal

Applied only to the isolated project:

- anonymous direct access to `public.profiles` removed;
- authenticated direct `SELECT` limited to explicit member-safe columns;
- `email` and `role` are not selectable directly by `authenticated`;
- direct `role` update is not granted to `authenticated`;
- unrelated-member visibility requires `is_public=true` and `onboarding_completed=true`;
- self remains visible regardless of discovery state;
- added narrow `get_my_access_context()` RPC;
- added `can_moderate()` capability RPC;
- added admin-only `admin_list_member_accounts()` RPC;
- added an authenticated-only rehearsal implementation of `search_afghan_hub()` that never uses email as display fallback and excludes hidden/incomplete profiles.

Six synthetic `example.test` identities were added only to this isolated project: member A, member B, hidden member, incomplete member, moderator and admin. They contain no real user data and no working credentials.

### Persona results

All focused database-level checks passed:

- member A can see eligible member B;
- hidden member is not visible;
- incomplete member is not visible;
- self remains visible;
- authenticated can select safe display fields but cannot select `email` or `role`;
- authenticated cannot directly update `role`;
- anon has no direct profile SELECT;
- ordinary member cannot call admin account listing;
- moderator has moderation capability but cannot call admin account listing;
- admin has moderation capability and can call admin account listing;
- member search returns eligible member B, excludes hidden/incomplete fixtures and returns zero email-like profile titles/subtitles;
- anon cannot execute member search or access-context RPC; authenticated can.

## #80 public-schema privilege rehearsal

Applied only to the isolated project:

- revoked `TRUNCATE`, `TRIGGER`, `REFERENCES` and `MAINTAIN` from `anon` and `authenticated` across all current public tables;
- changed postgres-owned public-table default privileges so future tables no longer inherit broad grants for `anon`/`authenticated`.

Verification returned zero current public-table grants for those four structural privileges to either application role. The postgres public-table default ACL now contains postgres/service-role grants only.

## Important limits

This does **not** authorize production rollout yet.

The isolated project is not a complete production replica: production currently has additional tables/functions/policies and a substantially different migration history. The search function used here intentionally uses simpler matching than production; it exists to rehearse privacy/visibility/execute boundaries, not ranking parity.

Before production authorization DDL:

1. translate the proven authorization behavior into a production-specific reversible migration;
2. inventory current production consumers and exact required direct DML privileges;
3. preserve a pre-change production ACL/policy/function snapshot for rollback;
4. review interaction between #67 and #80;
5. apply only after an explicit production security-change decision;
6. repeat read-only production verification immediately after rollout.

Hosted signup/email/session lifecycle and full multi-account application journeys remain separate acceptance work (#119/#120).