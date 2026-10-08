import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const localeResources = fs.readFileSync(new URL("../src/lib/assistant/member-navigator-copy.ts", import.meta.url), "utf8");
const component = fs.readFileSync(
  new URL("../src/components/assistant/community-navigator.tsx", import.meta.url),
  "utf8",
);
const analytics = fs.readFileSync(
  new URL("../src/lib/assistant/analytics.ts", import.meta.url),
  "utf8",
);

test("zero-result state provides direct recovery destinations", () => {
  for (const href of ["/network", "/organizations", "/opportunities", "/events"]) {
    assert.match(component, new RegExp(href.replace("/", "\\/")));
  }

  assert.match(component, /assistant_recovery_click/);
});

test("zero-result state remains multilingual", () => {
  assert.match(localeResources, /Browse people/);
  assert.match(localeResources, /مرور افراد/);
  assert.match(localeResources, /خلک وګورئ/);
});

test("recovery analytics stores only broad destination categories", () => {
  assert.match(analytics, /assistant_recovery_click/);
  assert.match(analytics, /"network" \| "organizations" \| "opportunities" \| "events"/);
  assert.doesNotMatch(analytics, /resultId|resultSlug|queryText|rawQuery/);
});
