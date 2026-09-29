import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import * as ts from "typescript";

const source = fs.readFileSync(
  new URL("../src/lib/intent-discovery.ts", import.meta.url),
  "utf8",
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const moduleUrl =
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
const { rankIntentCandidates } = await import(moduleUrl);

test("find-work ranks explicit job and hiring signals without inventing others", () => {
  const ranked = rankIntentCandidates("find_work", [
    { id: "scholarship", entityType: "opportunity" },
    { id: "hiring-business", entityType: "business", isHiring: true },
    { id: "job", entityType: "opportunity", isWorkOpportunity: true },
  ]);

  assert.deepEqual(
    ranked.map((item) => [item.id, item.intentScore]),
    [["job", 12], ["hiring-business", 10], ["scholarship", 0]],
  );
});

test("equal scores preserve incoming relevance order", () => {
  const ranked = rankIntentCandidates("join_community", [
    { id: "first-org", entityType: "organization" },
    { id: "second-org", entityType: "organization" },
  ]);
  assert.deepEqual(ranked.map((item) => item.id), ["first-org", "second-org"]);
});
