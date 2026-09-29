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
const { phaseOneSearchIntents, getPhaseOneSearchIntent } = await import(moduleUrl);

test("phase-one intent vocabulary exposes only structured supported intents", () => {
  assert.deepEqual(
    phaseOneSearchIntents.map((option) => option.value),
    ["find_work", "hire_talent", "volunteer", "find_services", "join_community"],
  );
});

test("unsupported future intents stay hidden in phase one", () => {
  assert.equal(getPhaseOneSearchIntent("find_mentor"), null);
  assert.equal(getPhaseOneSearchIntent("find_funding"), null);
  assert.equal(getPhaseOneSearchIntent("collaborate"), null);
  assert.equal(getPhaseOneSearchIntent("find_work"), "find_work");
});
