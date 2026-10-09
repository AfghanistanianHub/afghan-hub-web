export const navigatorLocales = [
  { value: "en", label: "English" },
  { value: "fa", label: "فارسی / Persian" },
  { value: "ps", label: "پښتو / Pashto" },
] as const;

export type NavigatorLanguage = (typeof navigatorLocales)[number]["value"];

export function normalizeNavigatorLanguage(value: unknown): NavigatorLanguage {
  if (value === "fa-AF" || value === "fa") return "fa";
  return value === "ps" ? "ps" : "en";
}

// Navigator-only preference: never read or mutate a member's profile languages.
export const navigatorLanguagePreferenceKey = "afghan-hub-navigator-language";

export function readNavigatorLanguagePreference(): NavigatorLanguage {
  try {
    const saved = localStorage.getItem(navigatorLanguagePreferenceKey);
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
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("navigator-language-change", onChange);
  };
}

export function serverNavigatorLanguagePreference(): NavigatorLanguage {
  return "en";
}

export function saveNavigatorLanguagePreference(value: unknown): NavigatorLanguage {
  const language = normalizeNavigatorLanguage(value);
  try {
    localStorage.setItem(navigatorLanguagePreferenceKey, language);
  } catch {
    // Storage may be unavailable; the in-page selection still works.
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event("navigator-language-change"));
  return language;
}
