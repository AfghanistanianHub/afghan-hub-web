import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { uiCopy } from "../src/lib/i18n/ui-copy.ts";

const pagePath = new URL(
  "../src/app/(dashboard)/messages/page.tsx",
  import.meta.url,
);

test("message inbox announces load failures", async () => {
  const source = await readFile(new URL("../src/components/messages/conversation-navigation.tsx", import.meta.url), "utf8");

  assert.match(source, /role="alert"/);
  assert.match(source, /aria-live="assertive"/);
  assert.match(source, /<Localized k="messages\.loadError" \/>/);
  assert.equal(uiCopy.en.messages.loadError, 'We could not load your conversations. Please try again.');
});

test("message inbox navigation exposes visible keyboard focus", async () => {
  const source = await readFile(pagePath, "utf8");

  assert.match(source, /href="\/network"[\s\S]{0,500}focus-visible:outline/);
  const rows = await readFile(new URL("../src/components/messages/conversation-list.tsx", import.meta.url), "utf8");
  assert.match(rows, /focus-visible:relative focus-visible:outline-2/);
  assert.match(rows, /aria-current=\{activeId === item.id/);
  assert.match(rows, /t\("messages\.searchConversations"\)/);
  assert.equal(uiCopy.en.messages.searchConversations, 'Search conversations');
  assert.match(rows, /rounded-full object-cover/);
});
