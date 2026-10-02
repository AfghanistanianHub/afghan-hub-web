import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const route = fs.readFileSync(
  new URL("../src/app/api/assistant/analytics/route.ts", import.meta.url),
  "utf8",
);
const client = fs.readFileSync(
  new URL("../src/lib/assistant/analytics.ts", import.meta.url),
  "utf8",
);

test("assistant analytics never transmits raw query text or identity fields", () => {
  for (const source of [route, client]) {
    assert.doesNotMatch(
      source,
      /queryText\s*:|rawQuery\s*:|email\s*:|display_name\s*:|first_name\s*:|last_name\s*:/,
    );
  }

  assert.match(route, /no raw query text/);
  assert.match(route, /no user ID/);
});

test("assistant analytics is authenticated and schema bounded", () => {
  assert.match(route, /supabase\.auth\.getUser\(\)/);
  assert.match(route, /status:\s*401/);
  assert.match(route, /resultCount: z\.number\(\)\.int\(\)\.min\(0\)\.max\(12\)/);
});

test("assistant analytics only captures discovery KPI events", () => {
  for (const event of [
    "assistant_open",
    "assistant_language_change",
    "assistant_search",
    "assistant_result_click",
    "assistant_recovery_click",
  ]) {
    assert.match(route, new RegExp(event));
    assert.match(client, new RegExp(event));
  }

  assert.doesNotMatch(route, /insert\(|update\(|delete\(|upsert\(/);
});
