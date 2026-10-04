import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const component = fs.readFileSync(
  new URL("../src/components/assistant/community-navigator.tsx", import.meta.url),
  "utf8",
);
const layout = fs.readFileSync(
  new URL("../src/components/dashboard/header.tsx", import.meta.url),
  "utf8",
);

test("member header mounts the Afghan Hub assistant", () => {
  assert.match(layout, /CommunityNavigator/);
  assert.match(component, /Community Navigator/);
  assert.match(component, /aria-modal="true"/);
});

test("assistant requests have bounded loading and explicit retry", () => {
  assert.match(component, /setTimeout\(\(\) => controller\.abort\("timeout"\), 20000\)/);
  assert.match(component, /clearTimeout\(timeout\)/);
  assert.match(component, /runSearch\(turn\.query, turn\.context\)/);
  assert.match(component, /labels\.privacy/);
});

test("assistant supports keyboard open and escape close", () => {
  assert.match(component, /event\.metaKey \|\| event\.ctrlKey/);
  assert.match(component, /event\.key\.toLowerCase\(\) === "k"/);
  assert.match(component, /event\.key === "Escape"/);
});

test("assistant interface exposes English, Dari and Pashto", () => {
  assert.match(component, /English/);
  assert.match(component, /دری/);
  assert.match(component, /پښتو/);
});

test("assistant UI only calls the read-only assistant endpoint", () => {
  assert.match(component, /\/api\/assistant\/search/);
  assert.doesNotMatch(component, /insert|update|delete|upsert|send_connection_request|rsvp_to_event/);
});
