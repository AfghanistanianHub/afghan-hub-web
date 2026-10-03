import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import ts from "typescript";

const attendees = fs.readFileSync(
  new URL("../src/app/(dashboard)/events/[slug]/attendees/page.tsx", import.meta.url),
  "utf8",
);
const member = fs.readFileSync(
  new URL("../src/app/(dashboard)/members/[id]/page.tsx", import.meta.url),
  "utf8",
);

function consoleErrorArgumentIdentifiers(source, fileName) {
  const file = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const calls = [];

  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === "console" &&
      node.expression.name.text === "error"
    ) {
      const identifiers = new Set();

      for (const argument of node.arguments) {
        function collect(child) {
          if (ts.isIdentifier(child)) identifiers.add(child.text);
          ts.forEachChild(child, collect);
        }
        collect(argument);
      }

      calls.push([...identifiers]);
    }

    ts.forEachChild(node, visit);
  }

  visit(file);
  return calls;
}

test("production server logs keep route context without raw provider payloads", () => {
  assert.match(attendees, /provider details withheld/);
  assert.match(member, /provider details withheld/);

  const attendeeCalls = consoleErrorArgumentIdentifiers(
    attendees,
    "event-attendees-page.tsx",
  );
  const memberCalls = consoleErrorArgumentIdentifiers(
    member,
    "member-profile-page.tsx",
  );

  assert.ok(attendeeCalls.length >= 3);
  assert.ok(memberCalls.length >= 1);

  const forbiddenAttendeePayloads = new Set([
    "eventError",
    "registrationError",
    "profileError",
  ]);

  for (const identifiers of attendeeCalls) {
    assert.equal(
      identifiers.some((identifier) => forbiddenAttendeePayloads.has(identifier)),
      false,
    );
  }

  for (const identifiers of memberCalls) {
    assert.equal(identifiers.includes("error"), false);
  }
});
