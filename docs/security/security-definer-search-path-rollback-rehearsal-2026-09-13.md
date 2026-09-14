# SECURITY DEFINER search-path rollback rehearsal — 2026-09-13

Status: **review/rehearsal only — DO NOT APPLY TO PRODUCTION FROM THIS DOCUMENT**

Related: #134 and the paired forward rehearsal.

The current production baseline for the 10 scoped functions is `search_path=public`. If the forward hardening must be reverted in the same controlled window, restore only that function setting; do not replace function bodies or ACLs.

## Candidate rollback SQL

```sql
-- REHEARSAL ONLY. NOT AUTHORIZED FOR PRODUCTION.
begin;

alter function public.get_message_inbox()
  set search_path to public;
alter function public.get_unread_message_counts()
  set search_path to public;
alter function public.mark_conversation_read(uuid, uuid)
  set search_path to public;
alter function public.moderate_business(uuid, text, text)
  set search_path to public;
alter function public.moderate_event(uuid, text, text)
  set search_path to public;
alter function public.moderate_opportunity(uuid, text, text)
  set search_path to public;
alter function public.moderate_organization(uuid, text, text)
  set search_path to public;
alter function public.send_connection_request(uuid)
  set search_path to public;
alter function public.set_profile_role(uuid, public.user_role)
  set search_path to public;
alter function public.start_direct_conversation(uuid)
  set search_path to public;

commit;
```

## Rollback verification

After rollback, verify:

- each exact function returns to `proconfig = {search_path=public}`;
- owner, SECURITY DEFINER flag, body, attributes and EXECUTE ACLs exactly match the pre-forward snapshot;
- member connection/messaging paths still behave as before;
- moderator/admin deny and allow boundaries remain unchanged.

Regenerate this rollback from same-window production metadata if any signature, owner, body or ACL changes before an authorized rollout. Do not use historical migration replay as the rollback mechanism.
