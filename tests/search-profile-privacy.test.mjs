import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../src/app/(dashboard)/search/page.tsx", import.meta.url),
  "utf8",
);

test("member search rechecks public and onboarding eligibility", () => {
  assert.match(source, /\.from\("profiles"\)/);
  assert.match(
    source,
    /\.select\("id,open_to_mentoring,looking_for_mentor"\)/,
  );
  assert.match(source, /\.eq\("is_public", true\)/);
  assert.match(source, /\.eq\("onboarding_completed", true\)/);
  assert.match(source, /visibleMemberIds\.has\(result\.entity_id\)/);
  assert.doesNotMatch(
    source,
    /\.select\([^)]*(?:email|role|created_at|updated_at)[^)]*\)/,
  );
});

test("member search never renders an email-like title", () => {
  assert.match(source, /function getSafeResultTitle/);
  assert.match(source, /\/\\S\+@\\S\+\\\.\\S\+\//);
  assert.match(source, /return "Afghan Hub member"/);
  assert.match(source, /\{getSafeResultTitle\(result\)\}/);
  assert.doesNotMatch(source, /<h2[^>]*>\s*\{result\.title\}/);
});
