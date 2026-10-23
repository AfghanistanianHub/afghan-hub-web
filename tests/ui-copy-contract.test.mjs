import test from "node:test";
import assert from "node:assert/strict";
import {
  formatCopy,
  getUiCopy,
  localizeListingValue,
  uiCopy,
} from "../src/lib/i18n/ui-copy.ts";

const languages = ["en", "fa", "ps"];

function flatten(value, prefix = "", out = {}) {
  for (const [key, entry] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof entry === "string") out[path] = entry;
    else flatten(entry, path, out);
  }
  return out;
}

const flattened = Object.fromEntries(languages.map((language) => [language, flatten(uiCopy[language])]));

test("every supported language exposes exactly the same UI copy keys", () => {
  const english = Object.keys(flattened.en).sort();
  for (const language of ["fa", "ps"]) {
    assert.deepEqual(Object.keys(flattened[language]).sort(), english, `key parity for ${language}`);
  }
});

test("no UI copy value is empty or only whitespace", () => {
  for (const language of languages) {
    for (const [key, value] of Object.entries(flattened[language])) {
      assert.equal(typeof value, "string");
      assert.ok(value.trim().length > 0, `${language} ${key} is empty`);
    }
  }
});

test("Farsi and Pashto copy does not silently fall back to English", () => {
  for (const language of ["fa", "ps"]) {
    for (const [key, value] of Object.entries(flattened[language])) {
      const withoutPlaceholders = value
        .replace(/\{\w+\}/g, "")
        // Physical keyboard key names and technical tokens stay Latin by design.
        .replace(/Shift\+Enter|Enter/g, "");
      assert.doesNotMatch(withoutPlaceholders, /[A-Za-z]/, `${language} ${key} contains Latin text: ${value}`);
    }
  }
});

test("interpolation replaces known values and preserves unknown placeholders", () => {
  assert.equal(formatCopy("Page {page}", { page: 4 }), "Page 4");
  assert.equal(formatCopy("{missing} value", {}), "{missing} value");
  assert.equal(
    formatCopy(getUiCopy("fa", "listing.applyBy"), { date: "۲۳ اکتبر ۲۰۲۶" }),
    "درخواست تا ۲۳ اکتبر ۲۰۲۶",
  );
});

test("catalog lookup falls back to the key instead of throwing on unknown paths", () => {
  assert.equal(getUiCopy("ps", "saved.title"), "خوندي شوي فرصتونه");
  assert.equal(getUiCopy("en", "saved.title"), "Saved opportunities");
});

test("UI-generated listing values localize while user-authored values stay untouched", () => {
  assert.equal(localizeListingValue("fa", "Remote"), "دورکاری");
  assert.equal(localizeListingValue("ps", "Online event"), "آنلاین پېښه");
  assert.equal(localizeListingValue("en", "Online event"), "Online event");
  assert.equal(localizeListingValue("fa", "Kabul, Afghanistan"), "Kabul, Afghanistan");
  assert.equal(localizeListingValue("ps", null), "");
});
