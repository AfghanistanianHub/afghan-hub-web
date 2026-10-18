import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const detail = read("src/app/(dashboard)/businesses/[slug]/page.tsx");
const directory = read("src/components/businesses/business-directory.tsx");

test("business detail filters placeholder short description and about text", () => {
  assert.match(detail, /import \{ cleanPublicText \} from "@\/lib\/public-content";/);
  assert.match(detail, /const shortDescription=cleanPublicText\(business\.short_description\)/);
  assert.match(detail, /const aboutText=cleanPublicText\(business\.description\)/);
  assert.doesNotMatch(detail, /\{business\.short_description\}/);
  assert.doesNotMatch(detail, /\{business\.description\}/);
});

test("business directory card filters placeholder short description", () => {
  assert.match(directory, /import \{ cleanPublicText \} from "@\/lib\/public-content";/);
  assert.match(directory, /cleanPublicText\(business\.short_description\)/);
  assert.doesNotMatch(directory, /\{business\.short_description\}/);
});
