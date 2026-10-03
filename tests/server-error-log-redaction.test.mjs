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

function consoleErrorCalls(source) {
  const calls = [];
  const marker = "console.error(";
  let offset = 0;

  while (true) {
    const start = source.indexOf(marker, offset);
    if (start < 0) break;

    let depth = 1;
    let index = start + marker.length;
    for (; index < source.length && depth > 0; index++) {
      if (source[index] === "(") depth++;
      if (source[index] === ")") depth--;
    }

    calls.push(source.slice(start, index));
    offset = index;
  }

  return calls;
}

test("production server logs keep route context without raw provider payloads", () => {
  assert.match(attendees, /provider details withheld/);
  assert.match(member, /provider details withheld/);

  const attendeeCalls = consoleErrorCalls(attendees);
  const memberCalls = consoleErrorCalls(member);

  assert.ok(attendeeCalls.length >= 3);
  assert.ok(memberCalls.length >= 1);

  for (const call of attendeeCalls) {
    assert.doesNotMatch(call, /\beventError\b|\bregistrationError\b|\bprofileError\b/);
  }

  for (const call of memberCalls) {
    assert.doesNotMatch(call, /,\s*error\b/);
  }
});
