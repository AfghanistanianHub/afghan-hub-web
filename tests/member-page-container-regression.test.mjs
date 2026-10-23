import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const containerPages = [
  "src/app/(dashboard)/events/page.tsx",
  "src/app/(dashboard)/opportunities/page.tsx",
  "src/app/(dashboard)/organizations/page.tsx",
  "src/app/(dashboard)/businesses/page.tsx",
  "src/app/(dashboard)/submissions/page.tsx",
  "src/app/(dashboard)/network/page.tsx",
  "src/app/(dashboard)/members/[id]/page.tsx",
];

test("shared container class is defined once with the standard width and gutters", () => {
  const styles = read("src/components/catalog/catalog-filter-styles.ts");
  assert.match(
    styles,
    /export const catalogPageContainerClass =\s*"mx-auto w-full max-w-\[88rem\] px-4 py-8 sm:px-6 md:px-8 lg:px-10 xl:px-12";/,
  );
});

test("every member list and profile page uses the shared container", () => {
  for (const path of containerPages) {
    const source = read(path);
    assert.match(source, /catalogPageContainerClass/, `${path} must import the shared container`);
    assert.doesNotMatch(source, /max-w-\[(1320|1500|1200)px\]/, `${path} must not hard-code a page width`);
  }
});

test("opportunities keeps the bordered card only around actual results", () => {
  const source = read("src/app/(dashboard)/opportunities/page.tsx");
  assert.match(source, /opportunities\?\.length \? "mt-4 divide-y divide-border border-y border-border bg-card" : "mt-4"/);
});

test("global spacing scale has stable values and does not override the approved container", () => {
  const css = read("src/app/globals.css");
  const expected = {
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    6: "1.5rem",
    8: "2rem",
    12: "3rem",
    16: "4rem",
    24: "6rem",
  };
  for (const [step, value] of Object.entries(expected)) {
    assert.match(css, new RegExp(`--space-${step}:\\\\s*${value.replace(".", "\\\\.")};`));
  }
  assert.match(css, /\\.member-shell main \\{ width:100%; max-width:88rem; margin-inline:auto; \\}/);
});
