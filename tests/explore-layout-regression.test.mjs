import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(
  new URL("../src/app/(public)/explore/page.tsx", import.meta.url),
  "utf8",
);

test("Explore listing grid sizes cards from available container width", () => {
  assert.match(
    source,
    /\[grid-template-columns:repeat\(auto-fit,minmax\(min\(100%,18rem\),1fr\)\)\]/,
  );
  assert.doesNotMatch(source, /md:grid-cols-2 xl:grid-cols-3/);
});

test("Explore result and sidebar grid children may shrink without overflowing", () => {
  assert.match(source, /<div className="min-w-0">/);
  assert.match(source, /<aside className="min-w-0 lg:sticky lg:top-24">/);
});
