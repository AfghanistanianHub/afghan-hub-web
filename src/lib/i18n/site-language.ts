/** Shared, browser-side language preference for future localized route shells.
 * Does not claim that untranslated English content has been localized.
 */
export const siteLanguagePreferenceKey = "afghan-hub-site-language";
export const siteLanguageChangeEvent = "afghan-hub-site-language-change";
export const siteLocales = ["en", "fa", "ps"] as const;
let volatileLanguage: SiteLanguage | null = null;
export type SiteLanguage = (typeof siteLocales)[number];

export function normalizeSiteLanguage(value: unknown): SiteLanguage {
  if (value === "fa" || value === "fa-AF" || value === "fa-IR" || value === "prs") return "fa";
  if (value === "ps" || value === "ps-AF") return "ps";
  return "en";
}

export function readSiteLanguagePreference(): SiteLanguage {
  if (typeof window === "undefined") return "en";
  try {
    // Preserve language chosen in Navigator before site-wide preferences existed.
    const selected = window.localStorage.getItem(siteLanguagePreferenceKey);
    if (volatileLanguage !== null) return volatileLanguage;
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
    // Private browsing and storage restrictions must not block language choice.
  }
  window.dispatchEvent(new Event(siteLanguageChangeEvent));
  return language;
}

export function subscribeSiteLanguagePreference(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === siteLanguagePreferenceKey || event.key === null) {
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
