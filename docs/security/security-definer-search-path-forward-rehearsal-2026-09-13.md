# SECURITY DEFINER search-path forward rehearsal — 2026-09-13

Status: **review/rehearsal only — DO NOT APPLY TO PRODUCTION FROM THIS DOCUMENT**

Related: #134.

Fresh production metadata confirms these 10 intentionally authenticated-callable `public` SECURITY DEFINER functions still have `search_path=public`; `anon` has no EXECUTE on them:

- `get_message_inbox()`
- `get_unread_message_counts()`
- `mark_conversation_read(uuid, uuid)`
- `moderate_business(uuid, text, text)`
- `moderate_event(uuid, text, text)`
- `moderate_opportunity(uuid, text, text)`
- `moderate_organization(uuid, text, text)`
- `send_connection_request(uuid)`
- `set_profile_role(uuid, public.user_role)`
- `start_direct_conversation(uuid)`

Their reviewed definitions already schema-qualify application relations/functions sufficiently for an empty function search path, and ordinary app roles do not have CREATE on `public`. This is therefore hardening, not a response to a demonstrated exploit.

## Candidate forward SQL

```sql
-- REHEARSAL ONLY. NOT AUTHORIZED FOR PRODUCTION.
begin;

alter function public.get_message_inbox()
  set search_path to '';
alter function public.get_unread_message_counts()
  set search_path to '';
alter function public.mark_conversation_read(uuid, uuid)
  set search_path to '';
alter function public.moderate_business(uuid, text, text)
  set search_path to '';
alter function public.moderate_event(uuid, text, text)
  set search_path to '';
alter function public.moderate_opportunity(uuid, text, text)
  set search_path to '';
alter function public.moderate_organization(uuid, text, text)
  set search_path to '';
alter function public.send_connection_request(uuid)
  set search_path to '';
alter function public.set_profile_role(uuid, public.user_role)
  set search_path to '';
alter function public.start_direct_conversation(uuid)
  set search_path to '';

commit;
```

## Required assertions

Before and after rehearsal, capture for each exact function OID/signature:

- `prosecdef` remains true;
- owner remains unchanged;
- function body (`prosrc`) remains unchanged;
- volatility/strict/parallel flags remain unchanged;
- EXECUTE ACL remains unchanged (`authenticated=true`, `anon=false` for these functions);
- only `proconfig` changes from `search_path=public` to an empty search path.

Then run controlled persona/behavior checks for:

- member inbox + unread counts;
- message read-state update;
- connection request and direct-conversation creation;
- ordinary member denied on all four moderation functions and `set_profile_role`;
- moderator allowed on intended moderation functions but denied admin role management;
- admin allowed on intended moderation and role-management paths.

No table grants, RLS policies, data, Auth settings, function EXECUTE grants, function bodies, or extension objects are changed in this phase.

## Production gate

Do not authorize production execution until the exact forward/rollback pair is checked against same-window production metadata and the applicable #120 member/moderator/admin acceptance paths are available. The existing 20-function Security Advisor warning will not necessarily disappear merely because an intentionally callable SECURITY DEFINER function has a safe search path; advisor disposition should be documented function-by-function rather than treated as a zero-warning objective.
