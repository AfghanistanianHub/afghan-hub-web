import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pagePath = new URL(
  "../src/app/(dashboard)/submissions/page.tsx",
  import.meta.url,
);

test("submissions page announces partial load failures", async () => {
  const source = await readFile(pagePath, "utf8");

  assert.match(source, /role="alert"/);
  assert.match(source, /aria-live="assertive"/);
  assert.match(source, /We could not load all of your submissions/);
});

test("submission links expose visible keyboard focus", async () => {
  const source = await readFile(pagePath, "utf8");

  assert.match(source, /const focusClass =/);
  assert.match(source, /focus-visible:outline-2/);
  assert.match(source, /focus-within:shadow-md/);
});
