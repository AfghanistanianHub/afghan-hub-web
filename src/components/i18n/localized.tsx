"use client";

import { useEffect, useSyncExternalStore } from "react";

import {
  formatCopy,
  getUiCopy,
  type UiCopyKey,
} from "@/lib/i18n/ui-copy";
import {
  readSiteLanguagePreference,
  subscribeSiteLanguagePreference,
  type SiteLanguage,
} from "@/lib/i18n/site-language";

export function useSiteLanguage(): SiteLanguage {
  return useSyncExternalStore(
    subscribeSiteLanguagePreference,
    readSiteLanguagePreference,
    (): SiteLanguage => "en",
  );
}

/**
 * Applies the active language to the document element. The root layout's
 * bootstrap script normally does this before first paint, but a document that
 * is served from an error shell (404, error boundary) never runs it, leaving
 * Farsi and Pashto content in an LTR document and unmirrored RTL icons.
 */
export function DocumentLanguage() {
  const language = useSiteLanguage();
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "en" ? "ltr" : "rtl";
  }, [language]);
  return null;
}

/** Client components use this to localize attributes, dates and formatted text. */
export function useUiCopy() {
  const language = useSiteLanguage();
  const t = (key: UiCopyKey, values?: Record<string, string | number>) =>
    formatCopy(getUiCopy(language, key), values);
  return { language, t, copy: getUiCopy };
}

/**
 * Renders one catalog string with its own language and direction boundary.
 * Use it inside headings, paragraphs, labels and buttons; for an attribute such
 * as aria-label, give the localized text an id and reference it with
 * aria-labelledby instead.
 */
export function Localized({
  k,
  values,
  className,
}: {
  k: UiCopyKey;
  values?: Record<string, string | number>;
  className?: string;
}) {
  const language = useSiteLanguage();
  return (
    <span lang={language} dir={language === "en" ? "ltr" : "rtl"} className={className}>
      {formatCopy(getUiCopy(language, k), values)}
    </span>
  );
}
