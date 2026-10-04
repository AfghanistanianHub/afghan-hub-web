import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) =>
  fs.readFileSync(new URL(path, import.meta.url), "utf8");

const query = read("../src/lib/assistant/query.ts");
const search = read("../src/lib/assistant/search.ts");
const conversation = read("../src/lib/assistant/conversation.ts");

// The navigator resolves context on the client (conversation.ts) and mentor
// ranking runs on the server (search.ts). Both must derive the same qualifier
// so a refinement never means one thing in the drawer and another in ranking.
test("mentorship qualifier keeps a single shared definition", () => {
  const definitions = [query, search].filter((source) =>
    /function mentorshipQualifier/.test(source),
  );
  assert.equal(
    definitions.length,
    1,
    "mentorshipQualifier must be defined in exactly one module, never copied",
  );

  assert.match(query, /export function mentorshipQualifier/);
  assert.match(
    search,
    /import \{[^}]*\bmentorshipQualifier\b[^}]*\} from "@\/lib\/assistant\/query";/,
  );
  assert.match(
    conversation,
    /import \{[^}]*\bmentorshipQualifier\b[^}]*\} from "\.\/query";/,
  );
});
