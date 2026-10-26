import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const base = process.env.BROWSER_BASE_URL ?? "http://127.0.0.1:3000";
const output = "artifacts/multilingual-browser";
await mkdir(output, { recursive: true });
for (const locale of ["en", "fa", "ps"]) {
  const response = await fetch(`${base}/${locale}`);
  assert.equal(response.status, 200, `locale homepage HTTP status: ${locale}`);
  const html = await response.text();
  const heroStart = html.lastIndexOf("<section", html.indexOf('aria-labelledby="landing-title"'));
  const heroEnd = html.indexOf("</section>", heroStart);
  const hero = html.slice(heroStart, heroEnd);
  const expected = locale === "en" ? "One network." : locale === "fa" ? "یک شبکه." : "یوه شبکه.";
  assert.ok(hero.includes(expected), `homepage hero must be server-rendered in ${locale}`);
  assert.ok(hero.includes(`lang="${locale}"`), `homepage hero language attribute: ${locale}`);
  assert.ok(hero.includes(`dir="${locale === "en" ? "ltr" : "rtl"}"`), `homepage hero direction: ${locale}`);
}
const browser = await chromium.launch({ headless: true });

/**
 * The header is server-rendered in the default language and only follows the
 * stored preference once hydrated. A change dispatched before that reaches no
 * React listener and is discarded, so re-select until a navigation is observed.
 */
async function switchLanguage(page, language) {
  const target = `/${language}`;
  const select = page.locator("header select").first();
  await select.waitFor();
  for (let attempt = 0; attempt < 10; attempt++) {
    await select.selectOption(language);
    try {
      await page.waitForURL(url => url.pathname === target, { timeout: 5000 });
      return;
    } catch {
      // Not hydrated yet; try again once the page finishes loading.
      await page.waitForFunction(() => document.readyState === "complete", null, { timeout: 15000 }).catch(() => {});
    }
  }
  throw new Error(`language switch to ${target} never navigated (still ${page.url()})`);
}

const exploreHeadings = {
  en: "Find your next connection.",
  fa: "پیوند بعدی خود را پیدا کنید.",
  ps: "خپله راتلونکې اړیکه ومومئ.",
};
let failures = [];
try {
  for (const viewport of [{ name: "desktop", width: 1440, height: 900 }, { name: "mobile", width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(base, { waitUntil: "domcontentloaded", timeout: 45000 });
    // A brand-new browser sees exactly the language entrance before homepage controls.
    await page.getByRole("link", {name: /English/}).waitFor();
    assert.equal(await page.locator("header select").count(), 0, "Public navigation must stay hidden until language selection");
    assert.equal(await page.locator('a[hreflang="en"], a[hreflang="fa"], a[hreflang="ps"]').count(), 3);
    // Exercise the entrance for all three languages in isolated first-visit contexts.
    // This also captures the design before navigation, not only the homepage.
    await page.screenshot({ path: `${output}/${viewport.name}-language-entrance.png`, fullPage: true });
    for (const selected of ["fa", "ps"]) {
      const visitor = await browser.newContext({ viewport, reducedMotion: "reduce" });
      try {
        const languagePage = await visitor.newPage();
        await languagePage.goto(base, { waitUntil: "domcontentloaded", timeout: 45000 });
        const link = languagePage.locator(`main a[hreflang="${selected}"]`);
        await link.waitFor();
        await link.click();
        await languagePage.waitForURL(url => url.pathname === `/${selected}`, { timeout: 45000 });
        await languagePage.waitForFunction(lang => localStorage.getItem("afghan-hub-site-language") === lang, selected, {timeout:15000});
      } finally {
        await visitor.close();
      }
    }
    await page.getByRole("link", {name: /English/}).click();
    await page.waitForURL(url => url.pathname === "/en", { timeout: 45000 });
    const entryState = await page.evaluate(() => ({
      url: location.href,
      title: document.title,
      htmlLang: document.documentElement.lang,
      headerCount: document.querySelectorAll("header").length,
      selectCount: document.querySelectorAll("header select").length,
      bodyText: document.body.innerText.slice(0, 700),
    }));
    console.log(JSON.stringify({ viewport: viewport.name, localeEntry: entryState }));
    await page.screenshot({ path: `${output}/${viewport.name}-locale-entry.png`, fullPage: true });
    await page.locator("header select").first().waitFor();
    await page.waitForFunction(() => localStorage.getItem("afghan-hub-site-language") === "en", null, {timeout:15000});
    await page.reload({waitUntil:"domcontentloaded"});
    await page.locator("header select").first().waitFor();
    assert.equal(await page.locator('main a[hreflang="en"]').count(), 0, "Localized homepage bypasses entrance");
    await page.goto(base, {waitUntil:"domcontentloaded"});
    await page.locator('main a[hreflang="en"]').waitFor();
    assert.equal(await page.locator('main a[hreflang="en"], main a[hreflang="fa"], main a[hreflang="ps"]').count(), 3, "Root always shows entrance after selection");
    await page.goto(base + "/en", {waitUntil:"domcontentloaded"});
    await page.locator("header select").first().waitFor();
    // An internal deep link remains accessible without any prior language preference.
    const direct = await browser.newContext({viewport, reducedMotion:"reduce"});
    try {
      const linked = await direct.newPage();
      await linked.goto(base + "/about", {waitUntil:"domcontentloaded"});
      await linked.locator("main").first().waitFor();
      assert.equal(await linked.locator('a[hreflang="en"]').count(), 0, "Deep links bypass entrance");
    } finally {
      await direct.close();
    }
    for (const language of ["en", "fa", "ps"]) {
      if (new URL(page.url()).pathname !== `/${language}`) {
        await switchLanguage(page, language);
      }
      const hero = page.locator("section[aria-labelledby='landing-title']");
      await hero.locator("h1[data-hero-headline]").waitFor();
      await page.waitForFunction(lang => document.querySelector("section[aria-labelledby='landing-title']")?.getAttribute("lang") === lang, language);
      await page.waitForFunction(lang => document.documentElement.lang === lang && document.documentElement.dir === (lang === "en" ? "ltr" : "rtl"), language);
      await page.evaluate(() => document.fonts.ready);
      const state = await hero.evaluate(element => {
        const headline = element.querySelector("h1[data-hero-headline]");
        const computed = getComputedStyle(headline);
        return {
          lang: element.lang,
          dir: element.dir,
          font: computed.fontFamily,
          fontLoaded: document.fonts.check(`600 24px "${element.lang === "fa" ? "Estedad" : element.lang === "ps" ? "Vazirmatn" : "Geist"}"`),
          headline: headline.textContent,
          width: headline.getBoundingClientRect().width,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        };
      });
      assert.equal(state.lang, language);
      assert.equal(state.dir, language === "en" ? "ltr" : "rtl");
      assert.ok(state.headline.length > 12);
      if (language === "fa") { assert.match(state.font, /Estedad/i); assert.equal(state.fontLoaded, true); }
      if (language === "ps") { assert.match(state.font, /Vazirmatn/i); assert.equal(state.fontLoaded, true); }
      assert.ok(state.scrollWidth <= state.clientWidth + 3, `horizontal overflow ${viewport.name}/${language}: ${JSON.stringify(state)}`);
      await page.screenshot({ path: `${output}/${viewport.name}-${language}.png`, fullPage: true });
      console.log(JSON.stringify({ viewport: viewport.name, ...state }));

      // Explore is a shared public surface outside the homepage shell. Its localized
      // headings, empty/unavailable states and filters must render at large text too.
      await page.goto(`${base}/explore`, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.locator(`main [lang="${language}"]`).first().waitFor({ timeout: 45000 });
      await page.evaluate(() => document.fonts.ready);
      const exploreState = await page.evaluate(() => {
        const heading = document.querySelector("main h1");
        const doc = document.documentElement;
        doc.style.fontSize = "200%";
        const zoomed = doc.scrollWidth > doc.clientWidth + 2;
        const clipped = [...document.querySelectorAll("main h1, main h2, main h3, main p, main button, main a")]
          .filter(element => element.scrollWidth > element.clientWidth + 2).length;
        doc.style.fontSize = "";
        return {
          h1: heading?.textContent?.trim(),
          lang: doc.lang,
          dir: doc.dir,
          overflow: doc.scrollWidth > doc.clientWidth + 2,
          zoomed,
          clipped,
          font: heading ? getComputedStyle(heading).fontFamily : "",
        };
      });
      assert.equal(exploreState.lang, language, `explore document language: ${language}`);
      assert.equal(exploreState.dir, language === "en" ? "ltr" : "rtl", `explore direction: ${language}`);
      assert.equal(exploreState.h1, exploreHeadings[language], `explore heading: ${language}`);
      assert.equal(exploreState.overflow, false, `explore overflow: ${viewport.name}/${language}`);
      assert.equal(exploreState.zoomed, false, `explore overflow at 200% text: ${viewport.name}/${language}`);
      assert.equal(exploreState.clipped, 0, `explore clipped controls at 200% text: ${viewport.name}/${language}`);
      if (language === "fa") assert.match(exploreState.font, /Estedad/i);
      if (language === "ps") assert.match(exploreState.font, /Vazirmatn/i);
      await page.screenshot({ path: `${output}/${viewport.name}-${language}-explore.png`, fullPage: true });
      console.log(JSON.stringify({ viewport: viewport.name, language, explore: exploreState }));

      // Return to the localized home so the next iteration still exercises the selector.
      await page.goto(`${base}/${language}`, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.locator("section[aria-labelledby='landing-title'] h1[data-hero-headline]").waitFor();
    }
    assert.deepEqual(errors, [], `client-side errors at ${viewport.name}`);
    await context.close();
  }
} catch (error) {
  failures.push(String(error.stack ?? error));
} finally {
  await browser.close();
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
}
