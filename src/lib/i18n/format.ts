import type { SiteLanguage } from "./site-language";

/** Gregorian calendar across all three languages; month names and digits follow the locale. */
export function siteLanguageLocale(language: SiteLanguage) {
  if (language === "fa") return "fa";
  if (language === "ps") return "ps";
  return "en-CA";
}

export function formatSiteDate(
  language: SiteLanguage,
  value: string | Date,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" },
) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(siteLanguageLocale(language), {
    calendar: "gregory",
    timeZone: "UTC",
    ...options,
  }).format(date);
}

export function formatSiteNumber(language: SiteLanguage, value: number) {
  return new Intl.NumberFormat(siteLanguageLocale(language)).format(value);
}
