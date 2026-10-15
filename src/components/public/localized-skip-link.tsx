"use client";

import { useSyncExternalStore } from "react";
import { getSharedUiCopy } from "@/lib/i18n/shared-ui-copy";
import { readSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";

export function LocalizedSkipLink() {
  const language = useSyncExternalStore(
    subscribeSiteLanguagePreference,
    readSiteLanguagePreference,
    (): SiteLanguage => "en",
  );
  return <a
    href="#main-content"
    lang={language}
    dir={language === "en" ? "ltr" : "rtl"}
    className="sr-only fixed left-4 top-4 z-50 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground focus:not-sr-only focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
  >{getSharedUiCopy(language).skipToContent}</a>;
}
