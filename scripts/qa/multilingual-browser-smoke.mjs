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
    assert.equal(await page.locator('button[lang="en"], button[lang="fa"], button[lang="ps"]').count(), 3);
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
      if (new URL(page.url()).pathname !== `/${language}`) {
        await page.locator("header select").first().selectOption(language);
        await page.waitForURL(url => url.pathname === `/${language}`, { timeout: 45000 });
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
