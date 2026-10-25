"use client";
import { useSyncExternalStore } from "react";
import { readSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";
import { networkCopy } from "./network-copy";
export function useNetworkCopy() {
  const language = useSyncExternalStore(subscribeSiteLanguagePreference,readSiteLanguagePreference,():SiteLanguage=>"en");
  return { language, copy: networkCopy[language] };
}
