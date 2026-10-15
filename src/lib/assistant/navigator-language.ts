import { normalizeSiteLanguage, readSiteLanguagePreference, saveSiteLanguagePreference } from "@/lib/i18n/site-language";
import { normalizeSiteLanguage, saveSiteLanguagePreference, siteLanguagePreferenceKey } from "@/lib/i18n/site-language";

export const navigatorLocales = [
  { value: "en", label: "English" },
  { value: "fa", label: "فارسی / Persian" },
  { value: "ps", label: "پښتو / Pashto" },
] as const;

export type NavigatorLanguage = (typeof navigatorLocales)[number]["value"];

export function normalizeNavigatorLanguage(value: unknown): NavigatorLanguage {
  return normalizeSiteLanguage(value);
}

// Navigator-only preference: never read or mutate a member's profile languages.
export const navigatorLanguagePreferenceKey = "afghan-hub-navigator-language";

export function readNavigatorLanguagePreference(): NavigatorLanguage {
  // The shared store is authoritative, including when storage is blocked.
  // It also supports the legacy Navigator key and synchronizes across tabs.
  return readSiteLanguagePreference();
  try {
    const saved = localStorage.getItem(siteLanguagePreferenceKey) ?? localStorage.getItem(navigatorLanguagePreferenceKey);
    const language = normalizeNavigatorLanguage(saved);
    if (saved === "fa-AF") localStorage.setItem(navigatorLanguagePreferenceKey, language);
    return language;
  } catch {
    return "en";
  }
}

export function subscribeNavigatorLanguagePreference(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("navigator-language-change", onChange);
  window.addEventListener("afghan-hub-site-language-change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("navigator-language-change", onChange);
    window.removeEventListener("afghan-hub-site-language-change", onChange);
  };
}

export function serverNavigatorLanguagePreference(): NavigatorLanguage {
  return "en";
}

export function saveNavigatorLanguagePreference(value: unknown): NavigatorLanguage {
  const language = normalizeNavigatorLanguage(value);
  saveSiteLanguagePreference(language);
  try {
    localStorage.setItem(navigatorLanguagePreferenceKey, language);
  } catch {
    // Storage may be unavailable; the in-page selection still works.
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event("navigator-language-change"));
  return language;
}
