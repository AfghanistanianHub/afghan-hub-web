import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  getWorkspaceCopy,
  workspaceCopy,
} from "../src/lib/i18n/workspace-copy.ts";

const languages = ["en", "fa", "ps"];

test("every supported language exposes exactly the same workspace copy keys", () => {
  const english = Object.keys(workspaceCopy.en).sort();
  for (const language of ["fa", "ps"]) {
    assert.deepEqual(Object.keys(workspaceCopy[language]).sort(), english, `key parity for ${language}`);
  }
});

test("no workspace copy value is empty or only whitespace", () => {
  for (const language of languages) {
    for (const [key, value] of Object.entries(workspaceCopy[language])) {
      assert.equal(typeof value, "string");
      assert.ok(value.trim().length > 0, `${language} ${key} is empty`);
    }
  }
});

test("Farsi and Pashto workspace copy does not silently fall back to English", () => {
  for (const language of ["fa", "ps"]) {
    for (const [key, value] of Object.entries(workspaceCopy[language])) {
      const withoutPlaceholders = value.replace(/\{name\}/g, "");
      assert.doesNotMatch(withoutPlaceholders, /[A-Za-z]/, `${language} ${key} contains Latin text: ${value}`);
    }
  }
});

test("workspace copy lookup falls back to the key for an unknown entry", () => {
  assert.equal(getWorkspaceCopy("ps", "profile.save"), "پروفایل خوندي کړئ");
  assert.equal(getWorkspaceCopy("en", "organization.volunteers"), "Accepting volunteers");
});

test("organization type options keep canonical English values", () => {
  const source = fs.readFileSync(
    new URL("../src/components/organizations/organization-type-options.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /value: "Nonprofit"/);
  assert.match(source, /value: "Community organization"/);
  assert.doesNotMatch(source, /option value="Nonprofit"/);
});

test("profile onboarding and CRUD forms render from the workspace catalog", () => {
  const pages = [
    "src/app/profile/page.tsx",
    "src/app/(dashboard)/businesses/new/page.tsx",
    "src/app/(dashboard)/businesses/[slug]/edit/page.tsx",
    "src/app/(dashboard)/organizations/new/page.tsx",
    "src/app/(dashboard)/organizations/[slug]/edit/page.tsx",
  ];
  for (const page of pages) {
    const source = fs.readFileSync(new URL(`../${page}`, import.meta.url), "utf8");
    assert.match(source, /@\/components\/i18n\/workspace/, `${page} imports the workspace primitives`);
    assert.doesNotMatch(source, />\s*Back to /, `${page} has no hardcoded English back link`);
    assert.doesNotMatch(source, /pendingLabel="[A-Z]/, `${page} has no hardcoded pending label`);
  }
});

test("localized fields keep technical values left-to-right", () => {
  const source = fs.readFileSync(
    new URL("../src/components/i18n/workspace.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /const latinValueTypes = new Set\(\["url", "email", "tel"\]\)/);
  assert.match(source, /name\.endsWith\("_url"\)/);
  assert.match(source, /dir: "ltr" as const/);
});
