import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(
  new URL("../src/lib/public-sitemap.ts", import.meta.url),
  "utf8",
);

test("public sitemap excludes expired opportunities", () => {
  assert.match(source, /getUtcDateKey/);
  assert.match(source, /deadline\.is\.null,deadline\.gte\.\$\{getUtcDateKey\(\)\}/);
});

test("public sitemap only includes upcoming events", () => {
  assert.match(source, /\.gte\("starts_at", new Date\(\)\.toISOString\(\)\)/);
});

test("public sitemap keeps published-status eligibility for every listing kind", () => {
  assert.equal((source.match(/\.eq\("status", "published"\)/g) ?? []).length, 4);
});
