import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  browseCopy,
  browseCopyKeys,
  getBrowseCopy,
  opportunityTypeKey,
} from "../src/lib/i18n/browse-copy.ts";
import { formatCopy } from "../src/lib/i18n/ui-copy.ts";

const languages = ["en", "fa", "ps"];
const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("the discovery catalogue has key parity across the three languages", () => {
  const english = Object.keys(browseCopy.en).sort();
  assert.deepEqual(english, [...browseCopyKeys].sort());
  for (const language of ["fa", "ps"]) {
    assert.deepEqual(Object.keys(browseCopy[language]).sort(), english, `key parity for ${language}`);
  }
});

test("no discovery string is empty", () => {
  for (const language of languages) {
    for (const key of browseCopyKeys) {
      assert.ok(browseCopy[language][key].trim().length > 0, `${language} ${key} is empty`);
    }
  }
});

test("Farsi and Pashto discovery copy does not fall back to English", () => {
  // Brand names and technical tokens keep their Latin spelling by design.
  const allowed = /Google Calendar|URL|Afghan Hub/g;
  for (const language of ["fa", "ps"]) {
    for (const key of browseCopyKeys) {
      const withoutPlaceholders = browseCopy[language][key]
        .replace(/\{\w+\}/g, "")
        .replace(allowed, "");
      assert.doesNotMatch(withoutPlaceholders, /[A-Za-z]/, `${language} ${key} contains Latin text: ${browseCopy[language][key]}`);
    }
  }
});

test("interpolation keeps values and leaves unknown placeholders intact", () => {
  assert.equal(formatCopy(getBrowseCopy("en", "opportunities.countMany"), { count: 4 }), "4 opportunities found");
  assert.equal(formatCopy(getBrowseCopy("fa", "opportunityDetail.rejectedReason"), { reason: "ناقص" }), "این فرصت تأیید نشد. دلیل: ناقص برای ارسال دوباره آن را ویرایش کنید.");
  assert.equal(formatCopy(getBrowseCopy("ps", "eventDetail.spots"), { count: 2 }), "2 ځایونه پاتې دي");
});

test("opportunity type tokens map to catalogue copy without leaking user data", () => {
  assert.equal(opportunityTypeKey("volunteer"), "opportunityType.volunteer");
  assert.equal(opportunityTypeKey("education"), "opportunityType.education");
  assert.equal(opportunityTypeKey("apprenticeship"), null);
  assert.equal(opportunityTypeKey(null), null);
});

const localizedRoutes = [
  "src/app/(dashboard)/search/page.tsx",
  "src/app/(dashboard)/opportunities/page.tsx",
  "src/app/(dashboard)/opportunities/[slug]/page.tsx",
  "src/app/(dashboard)/businesses/page.tsx",
  "src/app/(dashboard)/businesses/[slug]/page.tsx",
  "src/app/(dashboard)/organizations/page.tsx",
  "src/app/(dashboard)/organizations/[slug]/page.tsx",
  "src/app/(dashboard)/events/page.tsx",
  "src/app/(dashboard)/events/[slug]/page.tsx",
];

test("every listing and detail route reads its chrome from the shared catalogue", () => {
  for (const route of localizedRoutes) {
    const source = read(`../${route}`);
    assert.match(source, /@\/components\/i18n\/browse/, `${route} must use the discovery catalogue`);
  }
});

test("listing and detail routes no longer hardcode English UI copy", () => {
  const bannedCopy = [
    "Search with purpose",
    "Post opportunity",
    "Create event",
    "Discover businesses",
    "Discover organizations",
    "Back to opportunities",
    "Back to events",
    "Back to businesses",
    "Back to organizations",
    "No results found",
    "Add to calendar",
    "Register for this event",
    "Applications closed",
    "Verified listing",
  ];
  for (const route of localizedRoutes) {
    const source = read(`../${route}`);
    for (const phrase of bannedCopy) {
      assert.ok(!source.includes(phrase), `${route} still contains "${phrase}"`);
    }
  }
});

test("directory rows and verification badges use the catalogue", () => {
  assert.match(read("../src/components/businesses/business-directory.tsx"), /common\.hiringNow/);
  assert.match(read("../src/components/organizations/organization-directory.tsx"), /common\.acceptingVolunteers/);
  const verification = read("../src/components/ui/verification-badge.tsx");
  assert.match(verification, /verification\.explanation/);
  assert.match(verification, /useBrowseCopy/);
});

test("catalogue dates and numbers follow the active language", () => {
  const browse = read("../src/components/i18n/browse.tsx");
  assert.match(browse, /formatSiteDate/);
  assert.match(browse, /formatSiteNumber/);
  assert.match(browse, /dir=\{language === "en" \? "ltr" : "rtl"\}/);
});
