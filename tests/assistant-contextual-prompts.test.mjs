import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const launcher = fs.readFileSync(
  new URL("../src/components/assistant/contextual-assistant-prompt.tsx", import.meta.url),
  "utf8",
);
const navigator = fs.readFileSync(
  new URL("../src/components/assistant/community-navigator.tsx", import.meta.url),
  "utf8",
);
const opportunity = fs.readFileSync(
  new URL("../src/app/(dashboard)/opportunities/[slug]/page.tsx", import.meta.url),
  "utf8",
);
const eventPage = fs.readFileSync(
  new URL("../src/app/(dashboard)/events/[slug]/page.tsx", import.meta.url),
  "utf8",
);
const network = fs.readFileSync(new URL("../src/components/network/network-overview.tsx", import.meta.url), "utf8");
const networkCopy = fs.readFileSync(new URL("../src/components/network/network-copy.ts", import.meta.url), "utf8");

test("contextual prompt launcher uses a shared non-navigation event contract", () => {
  assert.match(launcher, /afghan-hub:assistant-open/);
  assert.match(launcher, /CustomEvent/);
  assert.match(navigator, /ASSISTANT_OPEN_EVENT/);
  assert.match(navigator, /setOpen\(true\)/);
});

test("contextual prompts are available on opportunity, event and network surfaces", () => {
  assert.match(opportunity, /Find similar opportunities/);
  assert.match(opportunity, /Find people in this field/);
  assert.match(eventPage, /Find similar events/);
  assert.match(eventPage, /Find related organizations/);
  assert.match(network, /label=\{copy\.tech\}/);
  assert.match(networkCopy, /Find tech professionals/);
  assert.match(network, /label=\{copy\.artists\}/);
  assert.match(networkCopy, /Find artists/);
  assert.match(network, /Find artists working in arts and culture/);
  assert.match(network, /label=\{copy\.mentors\}/);
  assert.match(networkCopy, /Find mentors/);
});

test("contextual prompt contract does not add write actions", () => {
  for (const source of [launcher, navigator]) {
    assert.doesNotMatch(source, /insert\(|update\(|delete\(|upsert\(/);
    assert.doesNotMatch(source, /send_connection_request|rsvpEvent|toggleSavedOpportunity/);
  }
});
