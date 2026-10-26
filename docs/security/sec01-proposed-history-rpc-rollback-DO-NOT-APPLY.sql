-- REVIEW ONLY. Execute only in isolated rehearsal or after explicit rollout approval.
-- Precondition: list_moderation_history() did not exist before SEC-01 installation.
begin;
drop function public.list_moderation_history();
commit;
