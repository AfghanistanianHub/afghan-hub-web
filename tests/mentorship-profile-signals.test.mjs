import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const migration = fs.readFileSync(
  new URL("../supabase/migrations/20260916073000_add_mentorship_profile_signals.sql", import.meta.url),
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

test("mentorship profile fields default to opt-in safe values", () => {
  assert.match(migration, /open_to_mentoring boolean NOT NULL DEFAULT false/i);
  assert.match(migration, /looking_for_mentor boolean NOT NULL DEFAULT false/i);
  assert.match(migration, /mentorship_topics text\[\] NOT NULL DEFAULT '\{\}'::text\[\]/i);
  assert.match(migration, /cardinality\(mentorship_topics\) <= 12/i);
});

test("mentorship columns use explicit column-level grants", () => {
  assert.match(migration, /GRANT SELECT \([\s\S]*open_to_mentoring[\s\S]*looking_for_mentor[\s\S]*mentorship_topics[\s\S]*\) ON public\.profiles TO authenticated/i);
  assert.match(migration, /GRANT UPDATE \([\s\S]*open_to_mentoring[\s\S]*looking_for_mentor[\s\S]*mentorship_topics[\s\S]*\) ON public\.profiles TO authenticated/i);
  assert.doesNotMatch(migration, /GRANT (?:SELECT|UPDATE) ON public\.profiles TO authenticated/i);
});

test("profile save normalizes and bounds mentorship preferences", () => {
  assert.match(profileAction, /formData\.get\("open_to_mentoring"\) === "on"/);
  assert.match(profileAction, /formData\.get\("looking_for_mentor"\) === "on"/);
  assert.match(profileAction, /mentorshipTopics\.length > 12/);
  assert.match(profileAction, /topic\.length > 60/);
});

test("mentorship UI is explicitly optional and not an endorsement", () => {
  assert.match(profilePage, /Mentorship is optional/i);
  assert.match(memberPage, /member-selected preferences, not a credential or endorsement by Afghan Hub/i);
});
