import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const attendees = fs.readFileSync(
  new URL("../src/app/(dashboard)/events/[slug]/attendees/page.tsx", import.meta.url),
  "utf8",
);
const member = fs.readFileSync(
  new URL("../src/app/(dashboard)/members/[id]/page.tsx", import.meta.url),
  "utf8",
);

test("production server logs keep route context without raw provider payloads", () => {
  assert.match(attendees, /provider details withheld/);
  assert.match(member, /provider details withheld/);

  assert.doesNotMatch(attendees, /console\.error\([^\n]*eventError/);
  assert.doesNotMatch(attendees, /console\.error\([^\n]*registrationError/);
  assert.doesNotMatch(attendees, /console\.error\([^\n]*profileError/);
  assert.doesNotMatch(member, /console\.error\([^\n]*,\s*error\)/);
});
