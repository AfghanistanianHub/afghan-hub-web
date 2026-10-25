import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

// `outline-none` also sets --tw-outline-style, which disables every outline
// width utility on the same element, so a field carrying it can never draw the
// shared ring no matter which outline classes it also lists.
const fields = {
  "src/app/login/localized-login-content.tsx": /focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/,
  "src/app/forgot-password/localized-forgot-password-content.tsx": /focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/,
  "src/app/update-password/localized-update-password-content.tsx": /focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/,
  "src/app/(dashboard)/search/page.tsx": /focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/,
  "src/app/(dashboard)/moderation/page.tsx": /focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive/,
};

test("form fields draw the shared focus ring and never suppress it", () => {
  for (const [file, ring] of Object.entries(fields)) {
    const source = read(file);
    assert.match(source, ring, `${file} lost the 2px focus ring`);
    assert.doesNotMatch(source, /outline-none/, `${file} still suppresses the outline`);
    assert.doesNotMatch(
      source,
      /focus:ring-(primary|ring|destructive)\/\d+/,
      `${file} still relies on a translucent ring instead of the outline`,
    );
  }
});

test("the shared search field draws the ring instead of suppressing the outline", () => {
  const css = read("src/components/network/network-surfaces.module.css");
  const focusRule = css.match(/\.search:focus\s*{([^}]*)}/);
  assert.ok(focusRule, "the .search:focus rule is missing");
  assert.doesNotMatch(focusRule[1], /outline:\s*none/, ".search:focus still removes the outline");
  assert.match(css, /\.search:focus-visible\s*{[^}]*outline: 2px solid var\(--primary\)/, "the search field has no focus-visible ring");
});
