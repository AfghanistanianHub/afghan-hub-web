import type { SiteLanguage } from "@/lib/i18n/site-language";

export const authLanguageCookie = "afghan-hub-auth-language";

export function getAuthLanguage(value: unknown): SiteLanguage {
  return value === "fa" || value === "ps" ? value : "en";
}

// Only member routes, never arbitrary relative URLs, auth endpoints or origins.
export function getAuthDestination(value: unknown): string {
  if (typeof value !== "string" || value.length > 512) return "/dashboard";
  return /^\/(?:dashboard|network|messages|notifications|saved|settings|submissions|businesses|organizations|events|opportunities)(?:\/[A-Za-z0-9_-]+)*$/.test(value)
    ? value : "/dashboard";
}
