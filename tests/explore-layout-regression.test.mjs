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

test("Explore search and results stay in normal document flow", () => {
  assert.doesNotMatch(source, /lg:sticky/);
  assert.doesNotMatch(source, /lg:grid-cols-\[minmax\(0,1fr\)_20rem\] lg:items-start/);
  assert.match(source, /<div className="min-w-0">/);
  assert.ok(
    source.indexOf('<CatalogResultsHeading') < source.indexOf('<form action="/explore"') && source.indexOf('<form action="/explore"') < source.indexOf('result.items.map'),
    "category heading and search should precede result cards",
  );
});

test("Explore search controls remain responsive without squeezing result cards", () => {
  assert.match(source, /sm:grid-cols-\[minmax\(0,1fr\)_auto\]/);
  assert.match(source, /styles.searchForm/);
  assert.doesNotMatch(source, /lg:grid-cols-\[minmax\(0,1fr\)_20rem\]/);
});

