import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function loadEligibility() {
  const exports = {};
  const source = fs.readFileSync(
    new URL("../src/lib/public-listing-eligibility.ts", import.meta.url),
    "utf8",
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  vm.runInNewContext(compiled, { exports });
  return exports;
}

const eligibility = loadEligibility();

test("current opportunities include no-deadline and non-expired records", () => {
  assert.equal(
    eligibility.currentOpportunityFilter("2026-10-03"),
    "deadline.is.null,deadline.gte.2026-10-03",
  );
});

test("current events include ongoing events and future events", () => {
  const now = "2026-10-03T20:00:00.000Z";
  assert.equal(
    eligibility.currentEventFilter(now),
    `ends_at.gte.${now},and(ends_at.is.null,starts_at.gte.${now})`,
  );
});

test("placeholder public listing titles are rejected consistently", () => {
  for (const value of [null, "", "  ", "n/a", "NA", "test", " Testing "]) {
    assert.equal(eligibility.hasPublicListingTitle(value), false);
  }
  for (const value of ["Community event", "Afghan Business Network"]) {
    assert.equal(eligibility.hasPublicListingTitle(value), true);
  }
});

test("public catalog and sitemap use the same current-listing helpers", () => {
  const publicContent = fs.readFileSync(
    new URL("../src/lib/public-content.ts", import.meta.url),
    "utf8",
  );
  const sitemap = fs.readFileSync(
    new URL("../src/lib/public-sitemap.ts", import.meta.url),
    "utf8",
  );

  for (const source of [publicContent, sitemap]) {
    assert.match(source, /currentOpportunityFilter\(/);
    assert.match(source, /currentEventFilter\(/);
  }
  assert.match(sitemap, /hasPublicListingTitle\(/);
});
