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
const databaseTypes = fs.readFileSync(
  new URL("../src/types/database.ts", import.meta.url),
  "utf8",
);
const profileAction = fs.readFileSync(
  new URL("../src/app/profile/actions.ts", import.meta.url),
  "utf8",
);
const profilePage = fs.readFileSync(
  new URL("../src/app/profile/page.tsx", import.meta.url),
  "utf8",
);
const memberPage = fs.readFileSync(
  new URL("../src/app/(dashboard)/members/[id]/page.tsx", import.meta.url),
  "utf8",
);

test("mentorship profile fields default to explicit opt-in values", () => {
  assert.match(migration, /open_to_mentoring boolean NOT NULL DEFAULT false/i);
  assert.match(migration, /looking_for_mentor boolean NOT NULL DEFAULT false/i);
  assert.match(
    migration,
    /mentorship_topics text\[\] NOT NULL DEFAULT '\{\}'::text\[\]/i,
  );
});

test("database validates canonical mentorship topics without a privileged helper", () => {
  assert.match(
    migration,
    /CREATE OR REPLACE FUNCTION public\.mentorship_topics_are_valid/i,
  );
  assert.match(migration, /SECURITY INVOKER/i);
  assert.match(migration, /IMMUTABLE/i);
  assert.match(migration, /SET search_path = ''/i);
  assert.doesNotMatch(migration, /SECURITY DEFINER/i);
  assert.match(migration, /cardinality\(topics\) <= 12/i);
  assert.match(migration, /btrim\(topic\) <> topic/i);
  assert.match(migration, /char_length\(topic\) > 60/i);
  assert.match(migration, /count\(DISTINCT lower\(topic\)\)/i);
  assert.match(
    migration,
    /CHECK \(public\.mentorship_topics_are_valid\(mentorship_topics\)\)/i,
  );
});

test("mentorship validation helper has a bounded executable surface", () => {
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

test("mentorship columns use explicit column-level grants", () => {
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

test("generated database types include mentorship fields for row, insert, and update", () => {
  assert.ok(
    (databaseTypes.match(/open_to_mentoring/g) ?? []).length >= 3,
    "open_to_mentoring should exist in Row, Insert, and Update",
  );
  assert.ok(
    (databaseTypes.match(/looking_for_mentor/g) ?? []).length >= 3,
    "looking_for_mentor should exist in Row, Insert, and Update",
  );
  assert.ok(
    (databaseTypes.match(/mentorship_topics/g) ?? []).length >= 3,
    "mentorship_topics should exist in Row, Insert, and Update",
  );
});

test("profile save normalizes, deduplicates, and bounds mentorship topics", () => {
  assert.match(profileAction, /const normalized = topic\.toLowerCase\(\)/);
  assert.match(profileAction, /seen\.has\(normalized\)/);
  assert.match(profileAction, /mentorshipTopics\.length > 12/);
  assert.match(profileAction, /topic\.length > 60/);
  assert.match(
    profileAction,
    /formData\.get\("open_to_mentoring"\) === "on"/,
  );
  assert.match(
    profileAction,
    /formData\.get\("looking_for_mentor"\) === "on"/,
  );
});

test("mentorship UI remains optional and non-credentialed", () => {
  assert.match(profilePage, /Mentorship is optional/i);
  assert.match(profilePage, /not credentials or endorsements from Afghan Hub/i);
  assert.match(memberPage, /member-selected preferences, not a credential or endorsement by Afghan Hub/i);
  assert.match(memberPage, /\.eq\("is_public",true\)/);
  assert.match(memberPage, /\.eq\("onboarding_completed",true\)/);
  assert.match(memberPage, /RecommendedMembers/);
  assert.match(memberPage, /rankMemberRecommendations/);
});
