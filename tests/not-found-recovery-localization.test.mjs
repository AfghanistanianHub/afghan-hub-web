import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { browseCopy, getBrowseCopy } from "../src/lib/i18n/browse-copy.ts";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const languages = ["en", "fa", "ps"];

const pages = {
  "src/app/not-found.tsx": [
    "notFound.eyebrow",
    "notFound.title",
    "notFound.body",
    "notFound.home",
    "notFound.explore",
    "notFound.signIn",
  ],
  "src/app/(dashboard)/businesses/[slug]/not-found.tsx": [
    "notFound.businessTitle",
    "notFound.businessBody",
    "notFound.viewBusinesses",
  ],
  "src/app/(dashboard)/organizations/[slug]/not-found.tsx": [
    "notFound.organizationTitle",
    "notFound.organizationBody",
    "notFound.viewOrganizations",
  ],
  "src/app/(dashboard)/members/[id]/not-found.tsx": [
    "notFound.memberTitle",
    "notFound.memberBody",
    "notFound.returnToNetwork",
  ],
  "src/app/(public)/explore/[kind]/[slug]/not-found.tsx": [
    "notFound.listingTitle",
    "notFound.listingBody",
    "notFound.exploreListings",
  ],
};

const recoveryPage = read("src/components/feedback/page-recovery.tsx");
const globalError = read("src/app/global-error.tsx");

test("every 404 screen renders its copy through the typed catalogue", () => {
  for (const [route, keys] of Object.entries(pages)) {
    const source = read(route);
    assert.match(source, /@\/components\/i18n\/browse/, `${route} must use the discovery catalogue`);
    assert.match(source, /<DocumentLanguage \/>/, `${route} must apply the active language to the document`);
    for (const key of keys) {
      assert.match(
        source,
        new RegExp(`<B k="${key.replace(/\./g, "\\.")}"`),
        `${route} does not render ${key} through <B>`,
      );
    }
  }
});

test("no 404 screen still ships the English copy it used to hardcode", () => {
  const banned = [
    "Page not found",
    "This page isn’t available.",
    "Go to homepage",
    "Explore community",
    "Business not found",
    "View businesses",
    "Organization not found",
    "View organizations",
    "Member not found",
    "Return to network",
    "This listing isn’t available.",
    "Explore community listings",
  ];
  for (const route of Object.keys(pages)) {
    const source = read(route);
    for (const phrase of banned) {
      assert.ok(!source.includes(phrase), `${route} still contains "${phrase}"`);
    }
  }
});

test("404 screens keep their destinations and mirror directional icons", () => {
  const destinations = {
    "src/app/not-found.tsx": ['href="/"', 'href="/explore"', 'href="/login"'],
    "src/app/(dashboard)/businesses/[slug]/not-found.tsx": ['href="/businesses"'],
    "src/app/(dashboard)/organizations/[slug]/not-found.tsx": ['href="/organizations"'],
    "src/app/(dashboard)/members/[id]/not-found.tsx": ['href="/network"', "rtl:rotate-180"],
    "src/app/(public)/explore/[kind]/[slug]/not-found.tsx": ['href="/explore"', "data-flip-rtl"],
  };
  for (const [route, fragments] of Object.entries(destinations)) {
    const source = read(route);
    for (const fragment of fragments) {
      assert.ok(source.includes(fragment), `${route} lost ${fragment}`);
    }
  }
});

test("every 404 call to action shows a keyboard focus ring", () => {
  const ring = /focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary/;
  const expectedLinks = {
    "src/app/not-found.tsx": 3,
    "src/app/(dashboard)/businesses/[slug]/not-found.tsx": 1,
    "src/app/(dashboard)/organizations/[slug]/not-found.tsx": 1,
    "src/app/(dashboard)/members/[id]/not-found.tsx": 1,
    "src/app/(public)/explore/[kind]/[slug]/not-found.tsx": 1,
  };
  for (const [route, expected] of Object.entries(expectedLinks)) {
    const links = read(route).match(/<Link[\s\S]*?>/g) ?? [];
    assert.equal(links.length, expected, `${route} has ${links.length} call-to-action links, expected ${expected}`);
    for (const link of links) {
      assert.match(link, ring, `${route} has a call to action without a visible focus ring`);
    }
  }
});

test("the recovery screen reads every visible string from the catalogue", () => {
  assert.match(recoveryPage, /useBrowseCopy/);
  assert.match(recoveryPage, /<DocumentLanguage \/>/);
  assert.match(recoveryPage, /getBrowseCopy\(language, "recovery.documentTitle"\)/);
  assert.match(recoveryPage, /dir=\{language === "en" \? "ltr" : "rtl"\}/);
  assert.match(recoveryPage, /lang=\{language\}/);

  for (const key of ["recovery.eyebrow", "recovery.title", "recovery.body", "recovery.retry", "recovery.home", "recovery.privacyNote"]) {
    assert.match(
      recoveryPage,
      new RegExp(`t\\("${key.replace(/\./g, "\\.")}"\\)`),
      `${key} is not rendered from the catalogue`,
    );
  }
  assert.match(recoveryPage, /\{pending \? t\("recovery\.retrying"\) : t\("recovery\.retry"\)\}/);

  for (const phrase of [
    "Page unavailable",
    "We couldn’t load this page.",
    "Something went wrong.",
    "Trying again…",
    "Go to home",
    "For privacy, Afghan Hub does not show internal error details",
  ]) {
    assert.ok(!recoveryPage.includes(phrase), `recovery screen still contains "${phrase}"`);
  }
});

test("the global error document follows the stored language instead of forcing English", () => {
  assert.match(globalError, /RecoveryDocumentTitle/);
  assert.match(globalError, /suppressHydrationWarning/);
  assert.match(globalError, /afghan-hub-auth-language=\(en\|fa\|ps\)/);
  assert.match(globalError, /localStorage\.getItem\('afghan-hub-site-language'\)/);
  assert.match(globalError, /document\.documentElement\.dir=l==='en'\?'ltr':'rtl'/);
  assert.ok(
    !globalError.includes("<title>Page unavailable | Afghan Hub</title>"),
    "the global error title is still the hardcoded English one",
  );
});

test("every not-found and recovery key has Farsi and Pashto copy with no Latin fallback", () => {
  const keys = Object.keys(browseCopy.en).filter(
    (key) => key.startsWith("notFound.") || key.startsWith("recovery."),
  );
  assert.ok(keys.length >= 18, `expected the full 404/recovery group, saw ${keys.length} keys`);

  for (const key of keys) {
    for (const language of languages) {
      const copy = getBrowseCopy(language, key);
      assert.equal(copy, browseCopy[language][key], `${language} ${key} is missing`);
      assert.ok(copy.trim().length > 0, `${language} ${key} is empty`);
      if (language !== "en") {
        assert.doesNotMatch(copy, /[A-Za-z]/, `${language} ${key} leaks English: ${copy}`);
      }
    }
  }
});

test("the 404 marker uses local digits in Farsi and Pashto", () => {
  assert.equal(getBrowseCopy("en", "notFound.eyebrow"), "404 · Page not found");
  for (const language of ["fa", "ps"]) {
    assert.match(getBrowseCopy(language, "notFound.eyebrow"), /^۴۰۴ · /);
  }
});

test("no 404 or recovery key is unused by the screens that should render it", () => {
  const sources = [...Object.keys(pages).map(read), recoveryPage].join("\n");
  for (const key of Object.keys(browseCopy.en).filter(
    (entry) => entry.startsWith("notFound.") || entry.startsWith("recovery."),
  )) {
    assert.ok(sources.includes(key), `${key} is defined but never rendered`);
  }
});
