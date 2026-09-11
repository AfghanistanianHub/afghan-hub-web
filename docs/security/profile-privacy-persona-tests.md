# Profile privacy persona test matrix

Status: **pre-production acceptance plan**

Related: #67, `profile-privacy-remediation.md`, and `profile-privacy-remediation-draft.md`.

The goal is to prove the database boundary directly. UI success is not enough because the confirmed issue exists below the UI projection layer.

## Test personas

Use disposable accounts/data only in an isolated, production-compatible environment:

- anonymous client
- Member A — visible, onboarding complete
- Member B — visible, onboarding complete
- Member C — hidden (`is_public=false`)
- Member D — public flag true but onboarding incomplete
- Moderator
- Admin

Do not use real production member email addresses or message contents in test fixtures.

## A. Anonymous client

Expected:

- direct `profiles` SELECT is denied/no rows according to the final policy;
- direct request for `email`, `role`, timestamps, or any private future field is denied;
- `search_afghan_hub` execution is denied unless anonymous member search is explicitly approved later;
- `is_admin`, `get_my_access_context`, `admin_list_member_accounts`, `set_profile_role` are not usable by anon;
- public catalog for businesses/organizations/opportunities/events continues to work independently of member-profile access.

## B. Ordinary authenticated member

As Member A, verify direct API requests—not just UI:

Allowed:

- safe display fields for Member B when Member B is visible and onboarding complete;
- own safe display fields;
- existing connection/notification display identity joins required by the app.

Denied:

- Member B `email`;
- Member B `role`;
- Member B `created_at`/`updated_at`;
- Member B private/internal future fields;
- hidden Member C through discovery/profile search;
- incomplete Member D through discovery/search.

Also verify that requesting a mixed projection such as `id,display_name,email` fails rather than silently returning email.

## C. Self access

As Member A:

- Auth supplies the signed-in account email for Settings;
- profile editing still reads/writes the allowed self fields;
- `get_my_access_context()` returns only the caller's role/onboarding state;
- caller cannot use self access to change `role` directly;
- direct update attempting self-promotion remains neutralized by the existing profile-role trigger/database enforcement.

## D. Search

For visible Member B:

- search result title prefers display name;
- if display name is blank, uses first/last name;
- if all public name fields are blank, uses a generic member label;
- **never** returns email as title/subtitle/slug/image/location;
- public + onboarding-complete member can appear;
- hidden member cannot appear;
- onboarding-incomplete member cannot appear.

For anonymous client:

- member search RPC is denied under the current launch policy.

Verify business/organization/opportunity/event search behavior remains unchanged, including published/active filtering.

## E. Moderator

Verify:

- moderator receives only moderator capabilities required by the app;
- moderator cannot call `admin_list_member_accounts()` successfully;
- moderator cannot change member roles through `set_profile_role()`;
- moderator cannot directly SELECT private profile columns merely because moderation UI is available.

## F. Admin

Verify:

- `is_admin()` returns true only for the admin account;
- `admin_list_member_accounts()` returns the intentionally privileged fields needed by the team page;
- ordinary members/moderator cannot call that RPC successfully;
- `set_profile_role()` works for a different target member;
- admin cannot change own role through `set_profile_role()`;
- admin UI remains functional after broad profile-column access is removed.

## G. Relationship joins

Regression-check all joins that currently use `profiles` for display identity:

- incoming connection requests;
- accepted connections;
- notification actor display;
- message participant display;
- any event attendee/member identity surface.

Each should return only the intended display fields and must not require broad `profiles` SELECT.

## H. Application journey

After database-level persona tests pass, run the ordinary product path with at least two member accounts:

1. register/confirm/login;
2. complete profile;
3. discover another member;
4. send connection;
5. accept/decline;
6. start conversation;
7. verify unread/read behavior;
8. create one contribution;
9. verify moderation path;
10. sign out and confirm protected routes are inaccessible.

This is an application regression layer; it does not replace the direct API privacy tests above.

## I. Required evidence before production

Attach to the security issue/PR:

- exact isolated schema revision tested;
- test result for every persona section above;
- proof that an unrelated authenticated token cannot retrieve another public profile's email/role;
- proof hidden and incomplete profiles do not appear in member search;
- CI result for Node 22 and 24;
- Vercel preview status;
- reviewed production rollback SQL generated from current production metadata.

## Production change gate

Do not apply profile grant/RLS/function changes to production until:

1. the migration baseline discrepancy is accounted for;
2. this matrix passes in an isolated environment;
3. the final SQL is compared against current production definitions;
4. a rollback is prepared;
5. explicit approval is given for the production authorization change.
