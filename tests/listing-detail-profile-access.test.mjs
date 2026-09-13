import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pages = [
  "../src/app/(dashboard)/businesses/[slug]/page.tsx",
  "../src/app/(dashboard)/organizations/[slug]/page.tsx",
];

test("listing detail admin checks use the access-context RPC adapter", async () => {
  for (const path of pages) {
    const source = await readFile(new URL(path, import.meta.url), "utf8");
    assert.match(source, /getMyAccessContext\(supabase,user\.id\)/);
    assert.doesNotMatch(source, /from\(["'`]profiles["'`]\)\.select\(["'`]role["'`]\)/);
  }
});
