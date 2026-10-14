export const locales = ["en", "fa", "ps"] as const;
export type Locale = typeof locales[number];
export const localeCookie = "afghan-hub-language";
export function parseLocale(value: unknown): Locale | null {
  if (value === "fa-AF") return "fa";
  return value === "en" || value === "fa" || value === "ps" ? value : null;
}
export function languageDirection(locale: Locale) { return locale === "en" ? "ltr" : "rtl"; }
export function switchDestination(value: string, locale: Locale): string {
  // Only same-origin path references; never return protocol-relative or encoded redirects.
  if (!value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f]/.test(value)) return `/${locale}`;
  const url = new URL(value, "https://app.apnbc.ca");
  if (url.origin !== "https://app.apnbc.ca" || /^\/(?:api|auth|language|_next)(?:\/|$)/.test(url.pathname)) return `/${locale}`;
  if (url.pathname === "/" || /^\/(en|fa|ps)\/?$/.test(url.pathname)) {
    url.pathname = `/${locale}`;
    url.searchParams.delete("lang");
  } else url.searchParams.set("lang", locale);
  return url.pathname + url.search + url.hash;
}
