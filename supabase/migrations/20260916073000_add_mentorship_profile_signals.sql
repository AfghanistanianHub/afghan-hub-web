ALTER TABLE public.profiles
  ADD COLUMN open_to_mentoring boolean NOT NULL DEFAULT false,
  ADD COLUMN looking_for_mentor boolean NOT NULL DEFAULT false,
  ADD COLUMN mentorship_topics text[] NOT NULL DEFAULT '{}'::text[];

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_mentorship_topics_count_check
    CHECK (cardinality(mentorship_topics) <= 12),
  ADD CONSTRAINT profiles_mentorship_topics_length_check
    CHECK (char_length(array_to_string(mentorship_topics, ',')) <= 720);

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
