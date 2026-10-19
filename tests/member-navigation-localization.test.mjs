import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (name) => fs.readFileSync(new URL(name, import.meta.url), "utf8");

test("member navigation uses one shared three-language dictionary on desktop and mobile", () => {
  const dictionary = read("../src/components/dashboard/member-navigation-i18n.ts");
  const desktop = read("../src/components/dashboard/sidebar.tsx");
  const mobile = read("../src/components/dashboard/mobile-navigation.tsx");
  for (const locale of ["en", "fa", "ps"]) assert.match(dictionary, new RegExp("^  " + locale + ":", "m"));
  for (const href of ["/dashboard", "/network", "/search", "/opportunities", "/saved", "/submissions", "/businesses", "/organizations", "/events", "/messages", "/moderation"]) {
    assert.equal((dictionary.match(new RegExp('"' + href + '"', "g")) ?? []).length, 3);
  }
  for (const component of [desktop, mobile]) {
    assert.match(component, /subscribeSiteLanguagePreference/);
    assert.match(component, /memberNavigationLabel\(language, item\.href, item\.label\)/);
    assert.match(component, /aria-label=\{t\.navigation\}/);
    assert.match(component, /t\.unreadMessages/);
    assert.match(component, /t\.pendingModeration/);
  }
  assert.match(mobile, /dir=\{language === "en" \? "ltr" : "rtl"\}/);
  assert.match(mobile, /inset-y-0 start-0/);
});
