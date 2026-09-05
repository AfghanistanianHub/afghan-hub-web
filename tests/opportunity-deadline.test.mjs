import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadOpportunityHelpers() {
  const source = fs.readFileSync(
    path.join(__dirname, "../src/lib/opportunities.ts"),
    "utf8",
  );
  const exports = {};

  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    { exports },
  );

  return exports;
}

test("opportunity deadlines normalize to a stable UTC calendar date", () => {
  const { normalizeOpportunityDeadline } = loadOpportunityHelpers();

  assert.equal(
    normalizeOpportunityDeadline("2026-09-05"),
    "2026-09-05T12:00:00.000Z",
  );
  assert.equal(normalizeOpportunityDeadline("2026-02-30"), null);
  assert.equal(normalizeOpportunityDeadline("09/05/2026"), null);
});

test("create and update use the same deadline normalizer", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "../src/app/(dashboard)/opportunities/actions.ts"),
    "utf8",
  );

  const matches = source.match(/normalizeOpportunityDeadline\(deadlineValue\)/g);
  assert.equal(matches?.length, 2);
});

test("deadline picker restores the stored date without timezone drift", () => {
  const source = fs.readFileSync(
    path.join(__dirname, "../src/components/ui/deadline-picker.tsx"),
    "utf8",
  );

  assert.match(source, /parseISO\(defaultValue\.slice\(0, 10\)\)/);
});
