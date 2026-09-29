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
const { rankIntentCandidates, limitIntentBrowseCandidates } =
  await import(moduleUrl);

test("join-community browse preserves both organizations and events", () => {
  const candidates = [
    ...Array.from({ length: 24 }, (_, index) => ({
      id: `org-${index}`,
      entityType: "organization",
    })),
    ...Array.from({ length: 8 }, (_, index) => ({
      id: `event-${index}`,
      entityType: "event",
    })),
  ];
  const ranked = rankIntentCandidates("join_community", candidates);
  const limited = limitIntentBrowseCandidates("join_community", ranked, 24);

  assert.equal(limited.length, 24);
  assert.ok(limited.some((item) => item.entityType === "organization"));
  assert.ok(limited.some((item) => item.entityType === "event"));
  assert.equal(
    limited.filter((item) => item.entityType === "event").length,
    8,
  );
});

test("find-work browse reserves capacity for hiring businesses", () => {
  const candidates = [
    ...Array.from({ length: 30 }, (_, index) => ({
      id: `job-${index}`,
      entityType: "opportunity",
      isWorkOpportunity: true,
    })),
    ...Array.from({ length: 6 }, (_, index) => ({
      id: `business-${index}`,
      entityType: "business",
      isHiring: true,
    })),
  ];
  const ranked = rankIntentCandidates("find_work", candidates);
  const limited = limitIntentBrowseCandidates("find_work", ranked, 24);

  assert.equal(limited.length, 24);
  assert.equal(
    limited.filter((item) => item.entityType === "business").length,
    6,
  );
});

test("single-source intents keep normal ranking order", () => {
  const candidates = Array.from({ length: 30 }, (_, index) => ({
    id: `member-${index}`,
    entityType: "member",
  }));
  const ranked = rankIntentCandidates("hire_talent", candidates);
  const limited = limitIntentBrowseCandidates("hire_talent", ranked, 24);

  assert.deepEqual(
    limited.map((item) => item.id),
    candidates.slice(0, 24).map((item) => item.id),
  );
});
