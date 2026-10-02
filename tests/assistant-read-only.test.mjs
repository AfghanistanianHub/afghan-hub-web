import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const route = fs.readFileSync(
  new URL("../src/app/api/assistant/search/route.ts", import.meta.url),
  "utf8",
);

const search = fs.readFileSync(
  new URL("../src/lib/assistant/search.ts", import.meta.url),
  "utf8",
);

test("assistant V1 requires authentication", () => {
  assert.match(route, /supabase\.auth\.getUser\(\)/);
  assert.match(route, /status:\s*401/);
});

test("assistant V1 is read-only and does not use privileged credentials", () => {
  for (const source of [route, search]) {
    assert.doesNotMatch(source, /service[_-]?role/i);
    assert.doesNotMatch(source, /\.insert\(/);
    assert.doesNotMatch(source, /\.update\(/);
    assert.doesNotMatch(source, /\.delete\(/);
    assert.doesNotMatch(source, /\.upsert\(/);
  }

  assert.match(search, /search_afghan_hub/);
  assert.match(route, /mode:\s*"read-only"/);
});

test("assistant search has bounded query and result limits", () => {
  assert.match(route, /max\(120\)/);
  assert.match(route, /max\(12\)/);
  assert.match(search, /ASSISTANT_RESULT_LIMIT = 12/);
});
