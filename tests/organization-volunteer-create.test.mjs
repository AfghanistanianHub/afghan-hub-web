import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const newPage = fs.readFileSync(
  new URL("../src/app/(dashboard)/organizations/new/page.tsx", import.meta.url),
  "utf8",
);
const actions = fs.readFileSync(
  new URL("../src/app/(dashboard)/organizations/actions.ts", import.meta.url),
  "utf8",
);

test("organization creation exposes and persists volunteer availability", () => {
  assert.match(newPage, /name="is_accepting_volunteers"/);
  assert.match(newPage, /Accepting volunteers/);
  assert.match(actions, /formData\.get\("is_accepting_volunteers"\) === "on"/);
  assert.match(actions, /is_accepting_volunteers:\s*isAcceptingVolunteers/);
});
