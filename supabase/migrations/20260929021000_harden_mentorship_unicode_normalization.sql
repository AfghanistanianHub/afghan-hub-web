CREATE OR REPLACE FUNCTION public.mentorship_topics_are_valid(topics text[])
RETURNS boolean
LANGUAGE sql
SECURITY INVOKER
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $$
  SELECT
    topics IS NOT NULL
    AND cardinality(topics) <= 12
    AND NOT EXISTS (
      SELECT 1
      FROM unnest(topics) AS topic
      WHERE topic IS NULL
        OR topic = ''
        OR topic <> normalize(topic, NFC)
        OR topic ~ '^[[:space:]]|[[:space:]]$'
        OR char_length(topic) > 60
    )
    AND (
      SELECT count(*) = count(DISTINCT lower(topic))
      FROM unnest(topics) AS topic
    );
$$;

REVOKE ALL ON FUNCTION public.mentorship_topics_are_valid(text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mentorship_topics_are_valid(text[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.mentorship_topics_are_valid(text[]) TO authenticated;
