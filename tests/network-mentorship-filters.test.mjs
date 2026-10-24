import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const page = fs.readFileSync(
  new URL("../src/app/(dashboard)/network/page.tsx", import.meta.url),
  "utf8",
);
const networkCopy = fs.readFileSync(new URL("../src/components/network/network-copy.ts", import.meta.url), "utf8");
const directory = fs.readFileSync(
  new URL("../src/components/network/member-directory.tsx", import.meta.url),
  "utf8",
);

test("network loads only explicit mentorship discovery signals", () => {
  assert.match(
    page,
    /skills,[\s\S]*open_to_mentoring,[\s\S]*looking_for_mentor,[\s\S]*mentorship_topics/,
  );
  assert.match(page, /\.eq\("is_public", true\)/);
  assert.match(page, /\.eq\("onboarding_completed", true\)/);
});

test("member directory exposes explicit mentorship availability filters", () => {
  assert.match(directory, /type MentorshipFilter = "all" \| "mentors" \| "mentees"/);
  assert.match(directory, /label: copy\.mentorFilter/);
  assert.match(networkCopy, /Open to mentoring/);
  assert.match(directory, /label: copy\.menteeFilter/);
  assert.match(networkCopy, /Looking for a mentor/);
  assert.match(directory, /aria-pressed=\{selected\}/);
  assert.match(directory, /member\.open_to_mentoring/);
  assert.match(directory, /member\.looking_for_mentor/);
});

test("text search includes mentorship topics without inferring availability", () => {
  assert.match(directory, /\.\.\.member\.mentorship_topics/);
  assert.doesNotMatch(directory, /open_to_mentoring\s*:\s*.*skills/);
  assert.doesNotMatch(directory, /looking_for_mentor\s*:\s*.*profession/);
});

test("empty state and reset account for both search and mentorship filters", () => {
  assert.match(directory, /hasSearchQuery \|\| hasMentorshipFilter/);
  assert.match(directory, /setMentorshipFilter\("all"\)/);
  assert.match(directory, /copy\.clear/);
  assert.match(networkCopy, /Clear filters/);
});
