/** Shared browser-side site language preference (not profile language). */
export const siteLanguagePreferenceKey = "afghan-hub-site-language";
export const siteLanguageChangeEvent = "afghan-hub-site-language-change";
export const siteLocales = ["en", "fa", "ps"] as const;
export type SiteLanguage = (typeof siteLocales)[number];
let volatileLanguage: SiteLanguage | null = null;

export function normalizeSiteLanguage(value: unknown): SiteLanguage {
  if (typeof value !== "string") return "en";
  const locale = value.trim().replaceAll("_", "-").toLowerCase();
  if (locale === "fa" || locale.startsWith("fa-") || locale === "prs" || locale.startsWith("prs-")) return "fa";
  if (locale === "ps" || locale.startsWith("ps-")) return "ps";
  return "en";
}

export function readSiteLanguagePreference(): SiteLanguage {
  if (typeof window === "undefined") return "en";
  if (volatileLanguage !== null) return volatileLanguage;
  const routeLocale = window.location.pathname.match(/^\\/(en|fa|ps)\\/?$/)?.[1];
  if (routeLocale === "en" || routeLocale === "fa" || routeLocale === "ps") {
    volatileLanguage = routeLocale;
    return routeLocale;
  }
  try {
    const selected = window.localStorage.getItem(siteLanguagePreferenceKey);
    const legacy = window.localStorage.getItem("afghan-hub-navigator-language");
    return normalizeSiteLanguage(selected ?? legacy);
  } catch {
    return volatileLanguage ?? "en";
  }
}

export function saveSiteLanguagePreference(value: unknown): SiteLanguage {
  const language = normalizeSiteLanguage(value);
  if (typeof window === "undefined") return language;
  volatileLanguage = language;
  try {
    window.localStorage.setItem(siteLanguagePreferenceKey, language);
  } catch {
    // Storage may be unavailable; keep the in-page selection.
  }
  window.dispatchEvent(new Event(siteLanguageChangeEvent));
  return language;
}

export function subscribeSiteLanguagePreference(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === siteLanguagePreferenceKey || event.key === "afghan-hub-navigator-language" || event.key === null) {
      volatileLanguage = null;
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(siteLanguageChangeEvent, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(siteLanguageChangeEvent, onChange);
  };
}
