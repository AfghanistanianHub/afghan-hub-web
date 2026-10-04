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

function consoleErrorCalls(source, fileName) {
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
      calls.push(node);
    }

    ts.forEachChild(node, visit);
  }

  visit(file);
  return calls;
}

function assertStaticSingleArgumentErrors(source, fileName, minimumCount) {
  const calls = consoleErrorCalls(source, fileName);
  assert.ok(calls.length >= minimumCount);

  for (const call of calls) {
    assert.equal(
      call.arguments.length,
      1,
      `${fileName}: console.error must not include provider payload arguments`,
    );
    assert.equal(
      ts.isStringLiteralLike(call.arguments[0]),
      true,
      `${fileName}: console.error must use a static redacted message`,
    );
    assert.match(call.arguments[0].text, /provider details withheld/i);
  }
}

test("production server logs keep route context without raw provider payloads", () => {
  assertStaticSingleArgumentErrors(
    attendees,
    "event-attendees-page.tsx",
    3,
  );
  assertStaticSingleArgumentErrors(
    member,
    "member-profile-page.tsx",
    1,
  );
});
