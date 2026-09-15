revoke all on function public.can_moderate() from anon;
revoke all on function public.moderate_event(uuid, text, text) from anon;
revoke all on function public.moderate_opportunity(uuid, text, text) from anon;
revoke all on function public.enforce_event_moderation() from anon, authenticated;
revoke all on function public.enforce_opportunity_moderation() from anon, authenticated;

grant execute on function public.can_moderate() to authenticated;
grant execute on function public.moderate_event(uuid, text, text) to authenticated;
grant execute on function public.moderate_opportunity(uuid, text, text) to authenticated;

notify pgrst, 'reload schema';
