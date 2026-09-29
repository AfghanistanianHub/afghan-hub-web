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

test("mentorship schema remains explicit opt-in", () => {
  assert.match(migration, /open_to_mentoring boolean NOT NULL DEFAULT false/i);
  assert.match(migration, /looking_for_mentor boolean NOT NULL DEFAULT false/i);
  assert.match(
    migration,
    /mentorship_topics text\[\] NOT NULL DEFAULT '\{\}'::text\[\]/i,
  );
});

test("database validation matches the app contract", () => {
  assert.match(
    migration,
    /CREATE OR REPLACE FUNCTION public\.mentorship_topics_are_valid/i,
  );
  assert.match(migration, /SECURITY INVOKER/i);
  assert.match(migration, /cardinality\(topics\) <= 12/i);
  assert.match(
    migration,
    /topic ~ '\^\[\[:space:\]\]\|\[\[:space:\]\]\$'/i,
  );
  assert.match(migration, /char_length\(topic\) > 60/i);
  assert.match(migration, /count\(DISTINCT lower\(topic\)\)/i);
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

test("profile save NFC-normalizes, deduplicates, and bounds mentorship topics", () => {
  const normalizeIndex = profileAction.indexOf('rawTopic.trim().normalize("NFC")');
  const dedupeIndex = profileAction.indexOf("const normalized = topic.toLowerCase()");
  assert.ok(normalizeIndex >= 0 && dedupeIndex > normalizeIndex);
  assert.match(profileAction, /rawTopic\.trim\(\)\.normalize\("NFC"\)/);
  assert.match(profileAction, /const normalized = topic\.toLowerCase\(\)/);
  assert.match(profileAction, /seen\.has\(normalized\)/);
  assert.match(profileAction, /mentorshipTopics\.length > 12/);
  assert.match(profileAction, /\[\.\.\.topic\]\.length > 60/);
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
  assert.match(
    memberPage,
    /member-selected preferences, not a credential or endorsement by Afghan Hub/i,
  );
  assert.match(memberPage, /\.eq\("is_public",true\)/);
  assert.match(memberPage, /\.eq\("onboarding_completed",true\)/);
  assert.match(memberPage, /RecommendedMembers/);
  assert.match(memberPage, /rankMemberRecommendations/);
});


const exportRoute = fs.readFileSync(
  new URL("../src/app/api/account/export/route.ts", import.meta.url),
  "utf8",
);

test("profile export includes persisted mentorship data", () => {
  assert.match(exportRoute, /open_to_mentoring/);
  assert.match(exportRoute, /looking_for_mentor/);
  assert.match(exportRoute, /mentorship_topics/);
});
