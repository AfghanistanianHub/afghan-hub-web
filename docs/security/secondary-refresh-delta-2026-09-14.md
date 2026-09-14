# Secondary target refresh delta — 2026-09-14

Issue: #159

This is a read-only planning artifact. No DDL/DML was applied to either Supabase project while producing it.

## Current secondary baseline

Present core tables:
- profiles
- businesses
- events
- opportunities
- organizations

Missing launch tables:
- notifications
- event_rsvps

Present helper RPCs:
- get_my_access_context()
- can_moderate()
- is_admin()

Missing launch RPCs:
- moderate_business(uuid,text,text)
- moderate_event(uuid,text,text)
- moderate_opportunity(uuid,text,text)
- moderate_organization(uuid,text,text)
- set_profile_role(uuid,user_role)
- rsvp_to_event(uuid)
- get_event_rsvp_count(uuid)

## Column delta versus production

Missing moderation columns on businesses/events/opportunities/organizations:
- moderation_note text
- moderated_at timestamptz
- moderated_by uuid -> profiles(id) on delete set null

Missing search columns:
- profiles.search_vector
- businesses.search_vector
- opportunities.search_vector
- organizations.search_vector

The base business/event/opportunity/organization/profile columns otherwise align closely enough for a targeted refresh; do not infer that constraints/RLS/triggers are aligned.

## RLS/policy delta

Secondary currently has only a small subset of the production policies. In particular, events and opportunities have no RLS policies in the current secondary snapshot. Production additionally has owner/creator INSERT/UPDATE/DELETE policies and authenticated published-or-owner/moderator policies across the four content tables, plus RSVP/notification policies.

Do not copy policy names blindly. The refresh must reproduce the effective production authorization contract and then be verified through `security:qualify-target` plus persona acceptance.

## Trigger delta

Secondary currently exposes only the five `*_set_updated_at` application triggers on profiles/businesses/events/opportunities/organizations.

Production additionally relies on:
- search-vector triggers;
- moderation-enforcement triggers;
- listing identity preservation triggers;
- business/organization verification protection;
- profile role protection.

These are behavior-sensitive and must be added only after their backing functions/columns exist.

## Constraint delta

Production adds moderation foreign keys and moderation-note length constraints to content tables, plus the full constraints for `notifications` and `event_rsvps`. Production also includes later integrity constraints for URL/email formatting and listing identity protections that are not all present on the secondary baseline.

A refresh should prefer the narrow launch-critical contract first, then run full qualification rather than pretending the secondary is a byte-for-byte clone.

## Grant delta

The broad direct table grants on the shared core content tables currently resemble production's pre-Phase-B surface. `notifications` and `event_rsvps` are absent, so their authenticated grants do not exist yet.

Do not apply #136 Phase-B privilege reductions as part of this refresh. The purpose of the secondary target is first to reproduce current production behavior for acceptance, not to combine schema refresh with a separate privilege-hardening experiment.

## Relevant repository migration sources

Useful source migrations include:
- `20260823000200_add_content_moderation.sql`
- `20260823000300_add_moderation_notifications.sql`
- `20260823000400_add_moderation_feedback.sql`
- `20260904000100_add_event_rsvps.sql`
- `20260904000200_skip_self_moderation_notifications.sql`
- `20260904000300_allow_content_moderation_notifications.sql`
- `20260904000500_moderate_businesses_and_organizations.sql`
- `20260904000700_protect_profile_roles.sql`
- `20260904001000_consolidate_moderation_rls.sql`
- `20260904001100_add_admin_role_management.sql`

These files are source material, not an ordered replay plan. The secondary database already contains partial state from earlier versions.

## Execution gates

Before any secondary DDL:
1. Run `tests/security/secondary-refresh-preflight.sql` and require a pass.
2. Build a secondary-only idempotent forward delta from the current live snapshot, not from assumed migration history.
3. Build rollback for every created table/function/policy/trigger/column where rollback is operationally safe.
4. Keep production project ref hard-blocked.
5. Apply only to the secondary project.
6. Run `npm run security:qualify-target` against secondary.
7. Only if qualification passes, execute RSVP and role-persona acceptance using disposable accounts.

The preflight intentionally fails if the secondary baseline changes before the delta is applied. In that case, re-run the schema diff instead of forcing the old plan.
