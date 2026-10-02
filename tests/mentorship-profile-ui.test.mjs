import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const action = fs.readFileSync(
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
const databaseTypes = fs.readFileSync(
  new URL("../src/types/database.ts", import.meta.url),
  "utf8",
);

test("profile editor exposes explicit opt-in mentorship fields", () => {
  assert.match(profilePage, /name="open_to_mentoring"/);
  assert.match(profilePage, /name="looking_for_mentor"/);
  assert.match(profilePage, /name="mentorship_topics"/);
  assert.match(profilePage, /up to 12 topics, 60 characters each/i);
  assert.match(profilePage, /not credentials or endorsements by Afghan Hub/i);
});

test("profile action keeps mentorship topics bounded before database write", () => {
  assert.match(action, /mentorshipTopics\.length > 12/);
  assert.match(action, /topic\.length > 60/);
  assert.match(action, /new Set<string>\(\)/);
  assert.match(action, /rawTopic\.trim\(\)/);
});

test("new profile creation does not require mentorship INSERT grants", () => {
  const insertBlock = action.match(
    /\.insert\(\{ id: user\.id, email: user\.email \?\? null, \.\.\.editableProfile \}\)[\s\S]*?\.single\(\)/,
  );
  assert.ok(insertBlock);
  assert.doesNotMatch(insertBlock[0], /mentorshipUpdate/);
  assert.match(
    action,
    /if \(!updatedProfile\)[\s\S]*?\.insert\([\s\S]*?\.update\(mentorshipUpdate\)/,
  );
});

test("member profile only renders explicit mentorship signals", () => {
  assert.match(
    memberPage,
    /open_to_mentoring,looking_for_mentor,mentorship_topics/,
  );
  assert.match(memberPage, /const hasMentorshipSignals=/);
  assert.match(memberPage, /\{hasMentorshipSignals\?<section/);
  assert.match(memberPage, /Open to mentoring/);
  assert.match(memberPage, /Looking for a mentor/);
  assert.match(
    memberPage,
    /member-selected preferences, not a credential or endorsement by Afghan Hub/i,
  );
});

test("generated database shape includes mentorship columns in Row Insert and Update", () => {
  for (const field of [
    "open_to_mentoring",
    "looking_for_mentor",
    "mentorship_topics",
  ]) {
    const matches = databaseTypes.match(new RegExp(field, "g")) ?? [];
    assert.equal(matches.length, 3);
  }
});
