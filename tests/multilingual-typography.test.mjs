import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
const navigatorCss = readFileSync(new URL("../src/components/assistant/homepage-navigator.module.css", import.meta.url), "utf8");
const navigator = readFileSync(new URL("../src/components/assistant/homepage-navigator.tsx", import.meta.url), "utf8");
const preferences = readFileSync(new URL("../src/lib/assistant/navigator-language.ts", import.meta.url), "utf8");
const sitePreferences = readFileSync(new URL("../src/lib/i18n/site-language.ts", import.meta.url), "utf8");

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

test("regional language tags are normalized by the canonical site language module", () => {
  assert.match(sitePreferences, /normalizeSiteLanguage/);
  assert.match(sitePreferences, /replaceAll\("_", "-"\)/);
  assert.match(sitePreferences, /toLowerCase\(\)/);
  assert.match(sitePreferences, /locale\.startsWith\("fa-"\)/);
  assert.match(sitePreferences, /locale\.startsWith\("prs-"\)/);
  assert.match(sitePreferences, /locale\.startsWith\("ps-"\)/);
  // Concrete language-tag behavior is covered in site-language-runtime.test.mjs.
});

test("language-specific selectors retain specificity and inline-script isolation", () => {
  assert.match(css, /:is\(:lang\(fa\), :lang\(prs\), :lang\(ps\)\)/);
  assert.match(css, /unicode-bidi:\s*isolate/);
  assert.match(css, /\[lang="ps-AF"\]/);
  assert.doesNotMatch(css, /:where\(:lang\(fa\), :lang\(prs\), :lang\(ps\)\)/);
});

test("Navigator form controls inherit native-language type", () => {
  assert.match(navigatorCss, /:is\(input, select, button, textarea\)/);
  assert.match(navigatorCss, /font-family:\s*var\(--font-fa-body\)/);
});

const publicNavigation = readFileSync(new URL("../src/components/public/public-navigation.tsx", import.meta.url), "utf8");
const publicFooter = readFileSync(new URL("../src/components/public/localized-public-footer.tsx", import.meta.url), "utf8");
const sharedCopy = readFileSync(new URL("../src/lib/i18n/shared-ui-copy.ts", import.meta.url), "utf8");

test("public shell shares the same language preference and explicit RTL boundaries", () => {
  for (const component of [publicNavigation, publicFooter]) {
    assert.match(component, /subscribeSiteLanguagePreference/);
    assert.match(component, /readSiteLanguagePreference/);
    assert.match(component, /lang=\{language\}/);
    assert.match(component, /dir=\{language === "en" \? "ltr" : "rtl"\}/);
  }
  assert.match(publicNavigation, /saveSiteLanguagePreference/);
  assert.match(sitePreferences, /selected \?\? legacy/);
});

test("shared translations include all five community categories", () => {
  for (const key of ["people", "businesses", "organizations", "opportunities", "events"]) {
    assert.match(sharedCopy, new RegExp(key + ':'));
  }
});

test("language preference remains usable when localStorage is blocked", () => {
  assert.match(sitePreferences, /volatileLanguage = language/);
  assert.match(sitePreferences, /volatileLanguage \?\? "en"/);
  assert.match(preferences, /return readSiteLanguagePreference\(\)/);
});

test("animated category introduction uses localized content and RTL-safe geometry", () => {
  const component = readFileSync(new URL("../src/components/public/scroll-category-introduction.tsx", import.meta.url), "utf8");
  const categoryCss = readFileSync(new URL("../src/components/public/scroll-category-introduction.module.css", import.meta.url), "utf8");
  assert.match(component, /getSharedUiCopy\(language\)/);
  assert.match(component, /dir=\{language === "en" \? "ltr" : "rtl"\}/);
  assert.match(categoryCss, /\.section:dir\(rtl\) \.line/);
  assert.match(categoryCss, /\.section:dir\(rtl\) \.category::before/);
});

test("homepage sections share the site language without dropping interactive structure", () => {
  const page = readFileSync(new URL("../src/app/(public)/page.tsx", import.meta.url), "utf8");
  for (const name of ["LocalizedHomepageHero", "LocalizedHomepageSteps", "LocalizedHomepagePaths", "LocalizedHomepageValue", "LocalizedHomepageFinal", "ScrollCategoryIntroduction"]) {
    assert.ok(page.includes("<" + name), `missing homepage section ${name}`);
  }
  for (const filename of ["localized-homepage-hero", "localized-homepage-steps", "localized-homepage-paths", "localized-homepage-value", "localized-homepage-final"]) {
    const source = readFileSync(new URL(`../src/components/public/${filename}.tsx`, import.meta.url), "utf8");
    assert.match(source, /subscribeSiteLanguagePreference/);
    assert.match(source, /readSiteLanguagePreference/);
    assert.match(source, /lang=\{language\}/);
    assert.match(source, /dir=\{language === "en" \? "ltr" : "rtl"\}/);
  }
});

test("language updates propagate between browser tabs and Pashto uses its intended typeface", () => {
  const categoryCss = readFileSync(new URL("../src/components/public/scroll-category-introduction.module.css", import.meta.url), "utf8");
  assert.match(sitePreferences, /volatileLanguage = null;\s*onChange\(\)/);
  assert.match(sitePreferences, /event\.key === siteLanguagePreferenceKey/);
  assert.match(categoryCss, /\.section\[lang="ps"\] \.title/);
});

test("mobile navigation actions and accessibility names use localized labels", () => {
  assert.match(publicNavigation, /onClick=\{close\}>\{copy\.signIn\}<\/Link>/);
  assert.match(publicNavigation, /onClick=\{close\}>\{copy\.getStarted\}<\/Link>/);
  assert.match(publicNavigation, /<summary aria-label=\{copy\.navigation\}>/);
  assert.match(publicNavigation, /aria-label=\{language === "en" \?/);
});

test("footer localizes platform navigation, Navigator label and rights notice", () => {
  assert.match(publicFooter, /aria-label=\{language === "en" \? "Platform"/);
  assert.match(publicFooter, /"راهنمای هوشمند"/);
  assert.match(publicFooter, /"ځیرک لارښود"/);
  assert.match(publicFooter, /"تمام حقوق محفوظ است\."/);
  assert.match(publicFooter, /"ټول حقونه خوندي دي\."/);
});

test("homepage primary and final CTAs mirror arrow direction for RTL", () => {
  for (const filename of ["localized-homepage-hero", "localized-homepage-final"]) {
    const source = readFileSync(new URL(`../src/components/public/${filename}.tsx`, import.meta.url), "utf8");
    assert.match(source, /ArrowLeft, ArrowRight/);
    assert.match(source, /language === "en" \? ArrowRight : ArrowLeft/);
    assert.match(source, /<Arrow size=\{17\}/);
  }
});

test("Navigator journey links mirror arrows without changing canonical queries", () => {
  const journey = readFileSync(new URL("../src/components/assistant/navigator-journey-link.tsx", import.meta.url), "utf8");
  assert.match(journey, /language === "en" \? ArrowRight : ArrowLeft/);
  assert.match(journey, /subscribeSiteLanguagePreference/);
  assert.match(journey, /detail: query/);
});

test("Pashto footer headings and RTL mobile controls use native typography and alignment", () => {
  const shellCss = readFileSync(new URL("../src/components/public/public-navigation.module.css", import.meta.url), "utf8");
  assert.match(shellCss, /\.footer\[lang="ps"\] h2 \{ font-family:var\(--font-fa-body\)/);
  assert.match(shellCss, /\.header:dir\(rtl\) \.account/);
  assert.match(shellCss, /margin-right:auto/);
});

test("Navigator reads the shared site language snapshot as its single source of truth", () => {
  assert.match(preferences, /export function readNavigatorLanguagePreference\(\): NavigatorLanguage \{\s*\/\//);
  assert.match(preferences, /return readSiteLanguagePreference\(\)/);
  assert.doesNotMatch(preferences, /const saved = localStorage\.getItem\(siteLanguagePreferenceKey\)/);
});

test("site language subscription observes legacy Navigator key changes", () => {
  assert.ok(sitePreferences.includes('event.key === "afghan-hub-navigator-language"'));
  assert.match(sitePreferences, /volatileLanguage = null;\s*onChange\(\)/);
});

test("public RTL navigation aligns menu and footer links to logical start", () => {
  const shellCss = readFileSync(new URL("../src/components/public/public-navigation.module.css", import.meta.url), "utf8");
  assert.ok(shellCss.includes(".header:dir(rtl) .bar { direction:rtl; }"));
  assert.ok(shellCss.includes(".header:dir(rtl) .mobile nav { text-align:start; }"));
  assert.ok(shellCss.includes(".footer:dir(rtl) nav a { text-align:start; }"));
});

test("accessible public skip link follows selected site language", () => {
  const layout = readFileSync(new URL("../src/app/(public)/layout.tsx", import.meta.url), "utf8");
  const skip = readFileSync(new URL("../src/components/public/localized-skip-link.tsx", import.meta.url), "utf8");
  assert.ok(layout.includes("<LocalizedSkipLink />"));
  assert.ok(skip.includes('href="#main-content"'));
  assert.ok(skip.includes("subscribeSiteLanguagePreference"));
  assert.ok(skip.includes("getSharedUiCopy(language).skipToContent"));
  for (const locale of ["en", "fa", "ps"]) {
    assert.ok(sharedCopy.includes("skipToContent:"));
  }
});

test("localized homepage uses native-script headings and mirrored step progress", () => {
  const landingCss = readFileSync(new URL("../src/app/(public)/landing.module.css", import.meta.url), "utf8");
  assert.ok(landingCss.includes(".hero:dir(rtl) .statement h1"));
  assert.ok(landingCss.includes('.hero[lang="ps"] .statement h1'));
  assert.ok(landingCss.includes(".orientation:dir(rtl) .steps h3"));
  assert.ok(landingCss.includes("transform-origin:right;"));
  assert.ok(landingCss.includes("right:21px;"));
});

test("all localized homepage sections use native-script typography and RTL hover origins", () => {
  const css = readFileSync(new URL("../src/app/(public)/landing.module.css", import.meta.url), "utf8");
  for (const selector of [".paths:dir(rtl) h2", ".value:dir(rtl) h2", ".value:dir(rtl) h3", ".final:dir(rtl) h2", '.paths[lang="ps"] h2', '.final[lang="ps"] h2']) {
    assert.ok(css.includes(selector), "missing localized type selector: " + selector);
  }
  assert.ok(css.includes(".paths:dir(rtl) .pathLinks a::after"));
  assert.ok(css.includes("right:calc(100% - 5px);"));
});
