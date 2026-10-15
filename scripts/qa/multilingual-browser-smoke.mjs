import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const base = process.env.BROWSER_BASE_URL ?? "http://127.0.0.1:3000";
const output = "artifacts/multilingual-browser";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
let failures = [];
try {
  for (const viewport of [{ name: "desktop", width: 1440, height: 900 }, { name: "mobile", width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(base, { waitUntil: "domcontentloaded", timeout: 45000 });
    // A brand-new browser sees exactly the language entrance before homepage controls.
    await page.getByRole("button", {name: /English/}).waitFor();
    assert.equal(await page.locator("header select").count(), 0, "Public navigation must stay hidden until language selection");
    assert.equal(await page.locator('button[lang="en"], button[lang="fa"], button[lang="ps"]').count(), 3);
    await page.getByRole("button", {name: /English/}).click();
    await page.locator("header select").first().waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem("afghan-hub-site-language")), "en");
    await page.reload({waitUntil:"domcontentloaded"});
    await page.locator("header select").first().waitFor();
    assert.equal(await page.locator('button[lang="en"]').count(), 0, "Returning visitors bypass entrance");
    // An internal deep link remains accessible without any prior language preference.
    const direct = await browser.newContext({viewport, reducedMotion:"reduce"});
    try {
      const linked = await direct.newPage();
      await linked.goto(base + "/about", {waitUntil:"domcontentloaded"});
      await linked.locator("main").first().waitFor();
      assert.equal(await linked.locator('button[lang="en"]').count(), 0, "Deep links bypass entrance");
    } finally {
      await direct.close();
    }
    for (const language of ["en", "fa", "ps"]) {
      await page.locator("header select").first().selectOption(language);
      const hero = page.locator("section[aria-labelledby='landing-title']");
      await hero.locator("h1[data-hero-headline]").waitFor();
      await page.waitForFunction(lang => document.querySelector("section[aria-labelledby='landing-title']")?.getAttribute("lang") === lang, language);
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
