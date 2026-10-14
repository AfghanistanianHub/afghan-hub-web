import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const navigatorCss = readFileSync(new URL("../src/components/assistant/homepage-navigator.module.css", import.meta.url), "utf8");
const navigator = readFileSync(new URL("../src/components/assistant/homepage-navigator.tsx", import.meta.url), "utf8");
const preferences = readFileSync(new URL("../src/lib/assistant/navigator-language.ts", import.meta.url), "utf8");

test("native-script font families are declared and language scoped", () => {
  assert.match(css, /family=Estedad/);
  assert.match(css, /family=Vazirmatn/);
  assert.match(css, /:lang\(fa\)/);
  assert.match(css, /:lang\(prs\)/);
  assert.match(css, /:lang\(ps\)/);
  assert.match(css, /--font-fa-heading/);
  assert.match(css, /--font-fa-body/);
});

test("Navigator provides its own language and direction boundary", () => {
  assert.match(navigator, /lang=\{language\}/);
  assert.match(navigator, /dir=\{language === "en" \? "ltr" : "rtl"\}/);
  assert.match(navigatorCss, /\.navigator:is\(\[lang="fa"\]/);
  assert.match(navigatorCss, /\.navigator\[lang="ps"\]/);
  assert.match(navigatorCss, /\.identity h2/);
});

test("regional language tags map to existing Navigator languages", () => {
  for (const code of ["fa-AF", "fa-IR", "prs", "ps-AF"]) {
    assert.ok(preferences.includes(code), `missing regional language tag ${code}`);
  }
});
