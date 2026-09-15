revoke execute on function public.can_moderate() from PUBLIC;
revoke execute on function public.moderate_event(uuid, text, text) from PUBLIC;
revoke execute on function public.moderate_opportunity(uuid, text, text) from PUBLIC;
revoke execute on function public.enforce_event_moderation() from PUBLIC;
revoke execute on function public.enforce_opportunity_moderation() from PUBLIC;

grant execute on function public.can_moderate() to authenticated;
grant execute on function public.moderate_event(uuid, text, text) to authenticated;
grant execute on function public.moderate_opportunity(uuid, text, text) to authenticated;

notify pgrst, 'reload schema';
