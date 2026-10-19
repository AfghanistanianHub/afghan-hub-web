import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("dashboard next-step translations cover all profile completeness keys", () => {
  const page = read("../src/app/(dashboard)/dashboard/page.tsx");
  const labels = read("../src/components/dashboard/dashboard-text.tsx");
  for (const key of ["identity", "avatar", "headline", "bio", "professional", "skills", "location", "discovery"]) {
    assert.match(page, new RegExp(key + ': "step_' + key + '"'));
    assert.equal((labels.match(new RegExp("step_" + key + ":", "g")) ?? []).length, 3);
  }
  assert.match(page, /<DashboardText id="nextStep" \/>/);
  assert.match(page, /<DashboardText id=\{nextStep\.titleId\} \/>/);
  assert.match(page, /href: "\/network"/);
  assert.match(page, /href: "\/profile"/);
  assert.doesNotMatch(page, /profileStrength\.missing\[0\]\?\.label/);
});
