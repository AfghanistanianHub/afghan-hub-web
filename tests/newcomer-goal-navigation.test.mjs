import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const goalPaths = fs.readFileSync(
  new URL("../src/components/discovery/goal-paths.tsx", import.meta.url),
  "utf8",
);
const dashboard = fs.readFileSync(
  new URL("../src/app/(dashboard)/dashboard/page.tsx", import.meta.url),
  "utf8",
);
const search = fs.readFileSync(
  new URL("../src/app/(dashboard)/search/page.tsx", import.meta.url),
  "utf8",
);

test("dashboard exposes goal-based newcomer-friendly navigation", () => {
  for (const label of [
    "Find work",
    "Find newcomer services",
    "Meet people in my field",
    "Join the community",
    "Volunteer and help",
    "Grow my business",
  ]) {
    assert.ok(goalPaths.includes(label), `Missing goal: ${label}`);
  }
  assert.match(dashboard, /<GoalPaths \/>/);
});

test("goal cards route to explicit discovery intents where available", () => {
  assert.match(goalPaths, /\/search\?intent=find_work/);
  assert.match(goalPaths, /\/search\?intent=find_services/);
  assert.match(goalPaths, /\/search\?intent=join_community/);
  assert.match(goalPaths, /\/search\?intent=volunteer/);
});

test("search empty state offers visual goal navigation instead of a dead end", () => {
  assert.match(search, /Tell us what you are trying to do\./);
  assert.match(search, /discoveryIntentCards\.map/);
  assert.match(search, /Search anything/);
});
