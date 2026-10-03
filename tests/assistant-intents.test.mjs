import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import * as ts from "typescript";

const source = fs.readFileSync(
  new URL("../src/lib/assistant/intents.ts", import.meta.url),
  "utf8",
);

test("assistant intent layer includes English, Dari and Pashto prompt support", () => {
  assert.match(source, /assistantSuggestedPrompts/);
  assert.match(source, /en:/);
  assert.match(source, /fa:/);
  assert.match(source, /ps:/);
  assert.match(source, /فرصت‌های داوطلبی/);
  assert.match(source, /د رضاکارۍ فرصتونه/);
});

test("assistant intent layer only maps to read-only discovery entity types", () => {
  for (const entity of ["profile", "organization", "business", "opportunity", "event"]) {
    assert.match(source, new RegExp(`entityType: "${entity}"`));
  }

  assert.doesNotMatch(source, /send_message|connection_request|rsvp|save_opportunity/);
});


test("assistant mentorship routing stays read-only and signal-based", () => {
  assert.match(source, /AssistantMemberSignal/);
  assert.match(source, /"open_to_mentoring"/);
  assert.match(source, /"looking_for_mentor"/);
  assert.match(source, /intent: "find_people"/);
  assert.match(source, /entityType: "profile"/);
  assert.match(source, /mentorPatterns/);
  assert.match(source, /menteePatterns/);
});


test("explicit non-person entity intent wins over mentor audience wording", async () => {
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const moduleUrl =
    `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
  const { inferAssistantIntent } = await import(moduleUrl);

  assert.deepEqual(inferAssistantIntent("Find a mentor"), {
    intent: "find_people",
    entityType: "profile",
    memberSignal: "open_to_mentoring",
  });
  assert.deepEqual(inferAssistantIntent("Find events for mentors"), {
    intent: "find_events",
    entityType: "event",
  });
  assert.deepEqual(inferAssistantIntent("Find organizations for mentors"), {
    intent: "find_organizations",
    entityType: "organization",
  });
});
