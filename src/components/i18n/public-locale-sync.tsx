"use client";

import { useEffect } from "react";
import { saveSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";

/** Deep-linked locale homes synchronize the existing client-side public copy. */
export function PublicLocaleSync({ locale }: { locale: SiteLanguage }) {
  useEffect(() => {
    saveSiteLanguagePreference(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "en" ? "ltr" : "rtl";
  }, [locale]);
  return null;
}
