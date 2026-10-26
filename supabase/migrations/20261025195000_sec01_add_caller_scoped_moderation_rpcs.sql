-- SEC-01 Phase A: additive, caller-scoped moderation RPCs.
-- Must be tested in isolated Supabase before any production authorization.
-- Intentionally DOES NOT change existing table-level SELECT grants.
-- Deployment change control: do not push to production without explicit sign-off.
BEGIN;

CREATE OR REPLACE FUNCTION public.get_owned_listing_moderation_note(
  target_entity_type text, target_entity_id uuid
) RETURNS text
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  caller uuid := (SELECT auth.uid());
  note text;
BEGIN
  IF caller IS NULL OR target_entity_id IS NULL
     OR target_entity_type NOT IN ('business','organization','event','opportunity') THEN
    RETURN NULL;
  END IF;
  CASE target_entity_type
    WHEN 'business' THEN
      SELECT b.moderation_note INTO note FROM public.businesses b
       WHERE b.id = target_entity_id AND b.owner_id = caller;
    WHEN 'organization' THEN
      SELECT o.moderation_note INTO note FROM public.organizations o
       WHERE o.id = target_entity_id AND o.owner_id = caller;
    WHEN 'event' THEN
      SELECT e.moderation_note INTO note FROM public.events e
       WHERE e.id = target_entity_id AND e.creator_id = caller;
    WHEN 'opportunity' THEN
      SELECT o.moderation_note INTO note FROM public.opportunities o
       WHERE o.id = target_entity_id AND o.author_id = caller;
  END CASE;
  RETURN note;
END;
$$;
REVOKE ALL ON FUNCTION public.get_owned_listing_moderation_note(text,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_owned_listing_moderation_note(text,uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_moderation_history(
  target_limit integer DEFAULT 40
) RETURNS TABLE (
  entity_type text, entity_id uuid, title text, entity_slug text,
  status text, moderation_note text, moderated_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.can_moderate() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
    SELECT h.entity_type, h.entity_id, h.title, h.entity_slug,
           h.status, h.moderation_note, h.moderated_at
    FROM (
      SELECT 'business'::text entity_type,b.id entity_id,b.name title,
             b.slug entity_slug,b.status::text status,b.moderation_note,b.moderated_at
        FROM public.businesses b WHERE b.moderated_at IS NOT NULL
      UNION ALL
      SELECT 'organization',o.id,o.name,o.slug,o.status::text,o.moderation_note,o.moderated_at
        FROM public.organizations o WHERE o.moderated_at IS NOT NULL
      UNION ALL
      SELECT 'event',e.id,e.title,e.slug,e.status::text,e.moderation_note,e.moderated_at
        FROM public.events e WHERE e.moderated_at IS NOT NULL
      UNION ALL
      SELECT 'opportunity',o.id,o.title,o.slug,o.status::text,o.moderation_note,o.moderated_at
        FROM public.opportunities o WHERE o.moderated_at IS NOT NULL
    ) AS h
    ORDER BY h.moderated_at DESC, h.entity_type, h.entity_id
    LIMIT LEAST(GREATEST(COALESCE(target_limit, 40),1), 100);
END;
$$;
REVOKE ALL ON FUNCTION public.get_moderation_history(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_moderation_history(integer) TO authenticated;
COMMIT;
