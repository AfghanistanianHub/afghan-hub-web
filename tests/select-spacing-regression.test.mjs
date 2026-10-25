import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("native selects reserve logical arrow space without overriding purpose-specific styles", () => {
  const css = read("src/app/globals.css");
  assert.match(css, /:where\(select:not\(\[multiple\]\):not\(\[size\]\):not\(\[data-custom-chevron\]\)\)/);
  assert.match(css, /padding-inline-end:/);
  assert.match(css, /:dir\(rtl\)/);
  assert.match(css, /background-position: left/);
});

test("dashboard select uses exactly one decorative chevron", () => {
  const header = read("src/components/dashboard/header.tsx");
  assert.match(header, /data-custom-chevron/);
  assert.match(header, /<ChevronDown/);
  assert.match(header, /pointer-events-none absolute end-/);
});

test("public locale selector preserves arrow placement in compact RTL layouts", () => {
  const css = read("src/components/public/public-navigation.module.css");
  assert.match(css, /max-width:82px; padding-inline:6px 22px/);
  assert.match(css, /select:dir\(rtl\) \{ padding-inline:6px 22px; background-position:left 5px center/);
  assert.match(css, /select:dir\(rtl\) \{ padding-inline:9px 27px; background-position:left 8px center/);
});
