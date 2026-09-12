import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pagePath = new URL(
  "../src/app/(dashboard)/messages/page.tsx",
  import.meta.url,
);

test("message inbox announces load failures", async () => {
  const source = await readFile(pagePath, "utf8");

  assert.match(source, /role="alert"/);
  assert.match(source, /aria-live="assertive"/);
  assert.match(source, /We could not load your conversations/);
});

test("message inbox navigation exposes visible keyboard focus", async () => {
  const source = await readFile(pagePath, "utf8");

  assert.match(source, /href="\/network"[\s\S]{0,500}focus-visible:outline/);
  assert.match(source, /focus-visible:relative focus-visible:z-10 focus-visible:outline-2/);
});
