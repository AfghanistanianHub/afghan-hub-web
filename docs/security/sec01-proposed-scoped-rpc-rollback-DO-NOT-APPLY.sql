-- REVIEW ONLY: exact rollback for this new-function-only candidate.
-- Precondition: function was absent before the forward step. Confirm with pg_proc.
begin;
drop function public.get_listing_moderation_feedback(text,uuid);
commit;
