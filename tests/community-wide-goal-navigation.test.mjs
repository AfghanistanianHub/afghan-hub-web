import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const goalPaths = fs.readFileSync(
  new URL("../src/components/discovery/goal-paths.tsx", import.meta.url),
  "utf8",
);
const goalData = fs.readFileSync(
  new URL("../src/components/discovery/goal-path-data.ts", import.meta.url),
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
const publicHome = fs.readFileSync(
  new URL("../src/app/(public)/page.tsx", import.meta.url),
  "utf8",
);
// The homepage body moved into PublicHomeContent; the route page only supplies metadata.
const publicHomeContent = fs.readFileSync(
  new URL("../src/components/public/public-home-content.tsx", import.meta.url),
  "utf8",
);

test("dashboard exposes community-wide goal-based navigation", () => {
  for (const label of [
    "Find work",
    "Find services & businesses",
    "Meet people in my field",
    "Join the community",
    "Volunteer and help",
    "Grow my business",
  ]) {
    assert.ok(goalData.includes(label), `Missing goal: ${label}`);
  }
  assert.match(dashboard, /<GoalPaths \/>/);
});

test("goal cards route to explicit discovery intents where available", () => {
  assert.match(goalData, /\/search\?intent=find_work/);
  assert.match(goalData, /\/search\?intent=find_services/);
  assert.match(goalPaths, /\{goal\.number\}/);
  assert.match(goalData, /\/search\?intent=join_community/);
  assert.match(goalData, /\/search\?intent=volunteer/);
});

test("search empty state offers visual goal navigation instead of a dead end", () => {
  const catalog = fs.readFileSync(
    new URL("../src/lib/i18n/browse-copy.ts", import.meta.url),
    "utf8",
  );
  assert.match(search, /search\.startTitle/);
  assert.match(search, /discoveryIntentCards\.map/);
  assert.match(search, /goalCopyKeys\[goal\.href\]/);
  assert.match(search, /search\.anythingTitle/);
  assert.match(catalog, /"search\.startTitle": "Tell us what you are trying to do\."/);
  assert.match(catalog, /"search\.anythingTitle": "Search anything"/);
});


test("public landing exposes all five community areas and discovery paths", () => {
  assert.match(publicHome, /One network/);
  assert.match(publicHome, /Many ways to/);
  assert.match(publicHomeContent, /<ScrollCategoryIntroduction\b/);
  const introduction = fs.readFileSync(new URL("../src/components/public/scroll-category-introduction.tsx", import.meta.url), "utf8");
  assert.match(introduction, /communityAreas/);
  assert.match(introduction, /href=\{area.href\}/);
  assert.match(introduction, /category-icons/);
  const publicNavigation = fs.readFileSync(new URL("../src/components/public/public-navigation.tsx", import.meta.url), "utf8");
  assert.match(publicNavigation, /\/login\?mode=join/);
  const finale = fs.readFileSync(new URL("../src/components/public/localized-homepage-final.tsx", import.meta.url), "utf8");
  assert.match(finale, /\/login\?mode=join/);
  assert.doesNotMatch(goalData, /label: "Settle"/);
});
