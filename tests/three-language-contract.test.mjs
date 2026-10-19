import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

function walk(dir) {
  return readdirSync(new URL(dir, root)).flatMap((name) => {
    const path = join(dir, name);
    return statSync(new URL(path, root)).isDirectory() ? walk(path) : [path];
  });
}

test("root layout sets document language and direction before first paint", () => {
  const layout = read("src/app/layout.tsx");
  assert.match(layout, /suppressHydrationWarning/);
  assert.match(layout, /<script dangerouslySetInnerHTML=\{\{ __html: languageBootstrap \}\} \/>/);
  assert.match(layout, /localStorage\.getItem\('afghan-hub-site-language'\)/);
  assert.match(layout, /document\.documentElement\.dir=l==='en'\?'ltr':'rtl'/);
});

test("the bootstrap normalizes Dari-style storage values to Farsi, never to a separate locale", () => {
  const layout = read("src/app/layout.tsx");
  assert.match(layout, /s==='prs'/);
  assert.doesNotMatch(layout, /'(dari|fa-AF)'\s*\?/);
});

test("app UI does not expose a separate Dari label or locale", () => {
  const offenders = [];
  for (const file of [...walk("src/app"), ...walk("src/components")]) {
    if (!/\.(tsx|ts)$/.test(file)) continue;
    const source = read(file);
    if (/>\s*Dari\s*</.test(source) || /(placeholder|label|title|aria-label)\s*=\s*"[^"]*\bDari\b/.test(source)) {
      offenders.push(file);
    }
  }
  assert.deepEqual(offenders, []);
});

test("site locales remain exactly English, Farsi and Pashto", () => {
  const language = read("src/lib/i18n/site-language.ts");
  assert.match(language, /siteLocales = \["en", "fa", "ps"\] as const/);
});
