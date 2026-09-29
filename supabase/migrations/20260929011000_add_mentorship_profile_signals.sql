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
        OR btrim(topic) <> topic
        OR char_length(topic) > 60
    )
    AND (
      SELECT count(*) = count(DISTINCT lower(topic))
      FROM unnest(topics) AS topic
    );
$;

REVOKE ALL ON FUNCTION public.mentorship_topics_are_valid(text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.mentorship_topics_are_valid(text[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.mentorship_topics_are_valid(text[]) TO authenticated;

ALTER TABLE public.profiles
  ADD COLUMN open_to_mentoring boolean NOT NULL DEFAULT false,
  ADD COLUMN looking_for_mentor boolean NOT NULL DEFAULT false,
  ADD COLUMN mentorship_topics text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_mentorship_topics_valid_check
    CHECK (public.mentorship_topics_are_valid(mentorship_topics));

GRANT SELECT (
  open_to_mentoring,
  looking_for_mentor,
  mentorship_topics
) ON public.profiles TO authenticated;

GRANT UPDATE (
  open_to_mentoring,
  looking_for_mentor,
  mentorship_topics
) ON public.profiles TO authenticated;
