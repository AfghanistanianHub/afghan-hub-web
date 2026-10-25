import test from "node:test";
import assert from "node:assert/strict";

async function setup({ blocked = false, initial = {} } = {}) {
  const store = new Map(Object.entries(initial));
  const listeners = new Map();
  const window = {
    // Browser windows always expose location; route-locale detection reads its pathname.
    location: { pathname: "/" },
    localStorage: {
      getItem(key) {
        if (blocked) throw new Error("Storage blocked");
        return store.get(key) ?? null;
      },
      setItem(key, value) {
        if (blocked) throw new Error("Storage blocked");
        store.set(key, String(value));
      },
    },
    addEventListener(type, callback) {
      const callbacks = listeners.get(type) ?? new Set();
      callbacks.add(callback);
      listeners.set(type, callbacks);
    },
    removeEventListener(type, callback) {
      listeners.get(type)?.delete(callback);
    },
    dispatchEvent(event) {
      for (const callback of listeners.get(event.type) ?? []) callback(event);
      return true;
    },
  };
  globalThis.window = window;
  const language = await import(`../src/lib/i18n/site-language.ts?case=${Math.random()}`);
  return { window, store, language };
}

test("regional language tags normalize to supported site locales", async () => {
  const { language } = await setup();
  for (const code of ["fa-AF", "fa-IR", "prs"]) assert.equal(language.normalizeSiteLanguage(code), "fa");
  assert.equal(language.normalizeSiteLanguage("ps-AF"), "ps");
  assert.equal(language.normalizeSiteLanguage("unexpected"), "en");
});

test("legacy preference is read when site preference is absent", async () => {
  const { language } = await setup({ initial: { "afghan-hub-navigator-language": "ps-AF" } });
  assert.equal(language.readSiteLanguagePreference(), "ps");
});

test("site preference wins over legacy Navigator preference", async () => {
  const { language } = await setup({ initial: { "afghan-hub-site-language": "fa", "afghan-hub-navigator-language": "ps" } });
  assert.equal(language.readSiteLanguagePreference(), "fa");
});

test("language updates remain usable when storage access is blocked", async () => {
  const { language } = await setup({ blocked: true });
  assert.equal(language.saveSiteLanguagePreference("ps"), "ps");
  assert.equal(language.readSiteLanguagePreference(), "ps");
});

test("same-tab subscribers receive changes and unsubscribe cleanly", async () => {
  const { language } = await setup();
  let updates = 0;
  const unsubscribe = language.subscribeSiteLanguagePreference(() => updates++);
  language.saveSiteLanguagePreference("fa");
  assert.equal(updates, 1);
  unsubscribe();
  language.saveSiteLanguagePreference("ps");
  assert.equal(updates, 1);
});

test("cross-tab storage event invalidates volatile language snapshot", async () => {
  const { language, store, window } = await setup();
  const unsubscribe = language.subscribeSiteLanguagePreference(() => {});
  language.saveSiteLanguagePreference("fa");
  store.set("afghan-hub-site-language", "ps");
  const event = new Event("storage");
  Object.defineProperty(event, "key", { value: "afghan-hub-site-language" });
  window.dispatchEvent(event);
  assert.equal(language.readSiteLanguagePreference(), "ps");
  unsubscribe();
});

test("clearing site storage invalidates cached preference and restores default", async () => {
  const { language, store, window } = await setup();
  const unsubscribe = language.subscribeSiteLanguagePreference(() => {});
  language.saveSiteLanguagePreference("fa");
  store.clear();
  const event = new Event("storage");
  Object.defineProperty(event, "key", { value: null });
  window.dispatchEvent(event);
  assert.equal(language.readSiteLanguagePreference(), "en");
  unsubscribe();
});

test("legacy Navigator changes also notify subscribers across tabs", async () => {
  const { language, window } = await setup();
  let updates = 0;
  const unsubscribe = language.subscribeSiteLanguagePreference(() => updates++);
  const event = new Event("storage");
  Object.defineProperty(event, "key", { value: "afghan-hub-navigator-language" });
  window.dispatchEvent(event);
  assert.equal(updates, 1);
  unsubscribe();
});

test("unrelated localStorage events do not notify language subscribers", async () => {
  const { language, window } = await setup();
  let updates = 0;
  const unsubscribe = language.subscribeSiteLanguagePreference(() => updates++);
  const event = new Event("storage");
  Object.defineProperty(event, "key", { value: "unrelated-preference" });
  window.dispatchEvent(event);
  assert.equal(updates, 0);
  unsubscribe();
});

test("locale parsing accepts mixed case and underscore separators", async () => {
  const { language } = await setup();
  for (const value of ["FA_af", "fa-IR", "PRS_AF", " Fa-CA "]) {
    assert.equal(language.normalizeSiteLanguage(value), "fa");
  }
  for (const value of ["PS_af", "Ps-PK", " ps "]) {
    assert.equal(language.normalizeSiteLanguage(value), "ps");
  }
  for (const value of [null, 123, {}, "farsi", "pseudolocale"]) {
    assert.equal(language.normalizeSiteLanguage(value), "en");
  }
});

test("root layout language bootstrap stays aligned with callback language and blocked storage", async () => {
  const { readFile } = await import("node:fs/promises");
  const { runInNewContext } = await import("node:vm");
  const layout = await readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
  const match = layout.match(/const languageBootstrap = `([\s\S]*?)`;/);
  assert.ok(match, "pre-paint language bootstrap exists");
  // Evaluate JavaScript template escapes just as TypeScript does; no interpolation is expected.
  const bootstrap = runInNewContext("`" + match[1] + "`");
  const run = ({ pathname = "/", search = "", cookie = "", stored = {}, blocked = false }) => {
    const document = { cookie, documentElement: { lang: "en", dir: "ltr" } };
    const location = { pathname, search };
    const localStorage = {
      getItem(key) {
        if (blocked) throw new Error("Storage blocked");
        return stored[key] ?? null;
      },
    };
    runInNewContext(bootstrap, { document, location, localStorage, URLSearchParams });
    return document.documentElement;
  };
  assert.equal(run({ pathname: "/fa", stored: { "afghan-hub-site-language": "en" } }).dir, "rtl");
  assert.equal(run({ pathname: "/ps" }).lang, "ps");
  assert.equal(run({ search: "?lang=ps", cookie: "afghan-hub-auth-language=fa" }).lang, "ps");
  assert.equal(run({ cookie: "afghan-hub-auth-language=fa", blocked: true }).lang, "fa");
  assert.equal(run({ cookie: "afghan-hub-auth-language=ps", stored: { "afghan-hub-site-language": "en" } }).lang, "ps");
  assert.equal(run({ stored: { "afghan-hub-site-language": "prs-AF" } }).lang, "fa");
  assert.equal(run({ blocked: true }).dir, "ltr");
});
