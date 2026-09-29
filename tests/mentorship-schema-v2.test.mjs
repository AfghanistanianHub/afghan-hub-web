import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const migration = fs.readFileSync(
  new URL(
    "../supabase/migrations/20260929011000_add_mentorship_profile_signals.sql",
    import.meta.url,
  ),
  "utf8",
);

test("mentorship schema defaults are explicit opt-in", () => {
  assert.match(migration, /open_to_mentoring boolean NOT NULL DEFAULT false/i);
  assert.match(migration, /looking_for_mentor boolean NOT NULL DEFAULT false/i);
  assert.match(
    migration,
    /mentorship_topics text\[\] NOT NULL DEFAULT '\{\}'::text\[\]/i,
  );
});

test("mentorship topics are bounded and canonical at the database boundary", () => {
  assert.match(migration, /cardinality\(topics\) <= 12/i);
  assert.match(
    migration,
    /topic ~ '\^\[\[:space:\]\]\|\[\[:space:\]\]\$'/i,
  );
  assert.match(migration, /char_length\(topic\) > 60/i);
  assert.match(migration, /count\(DISTINCT lower\(topic\)\)/i);
});

test("validation helper is invoker-only with an explicit executable surface", () => {
  assert.match(migration, /SECURITY INVOKER/i);
  assert.match(migration, /SET search_path = ''/i);
  assert.doesNotMatch(migration, /SECURITY DEFINER/i);
  assert.match(
    migration,
    /REVOKE ALL ON FUNCTION public\.mentorship_topics_are_valid\(text\[\]\) FROM PUBLIC/i,
  );
  assert.match(
    migration,
    /REVOKE ALL ON FUNCTION public\.mentorship_topics_are_valid\(text\[\]\) FROM anon/i,
  );
  assert.match(
    migration,
    /GRANT EXECUTE ON FUNCTION public\.mentorship_topics_are_valid\(text\[\]\) TO authenticated/i,
  );
});

test("mentorship columns keep explicit Data API grants", () => {
  assert.match(
    migration,
    /GRANT SELECT \([\s\S]*open_to_mentoring[\s\S]*looking_for_mentor[\s\S]*mentorship_topics[\s\S]*\) ON public\.profiles TO authenticated/i,
  );
  assert.match(
    migration,
    /GRANT UPDATE \([\s\S]*open_to_mentoring[\s\S]*looking_for_mentor[\s\S]*mentorship_topics[\s\S]*\) ON public\.profiles TO authenticated/i,
  );
  assert.doesNotMatch(
    migration,
    /GRANT (?:SELECT|UPDATE) ON public\.profiles TO authenticated/i,
  );
});
