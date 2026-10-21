"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { readSiteLanguagePreference, saveSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";
import { getSharedUiCopy } from "@/lib/i18n/shared-ui-copy";

export function AuthBrand() {
  const language = useSyncExternalStore(subscribeSiteLanguagePreference, readSiteLanguagePreference, (): SiteLanguage => "en");
  const copy = getSharedUiCopy(language);

  return (
    <header className="auth-brand flex items-center justify-between py-4">
      <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold uppercase tracking-[0.22em] text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
        <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-[var(--radius-control)] bg-secondary text-primary">A</span>
        Afghan Hub
      </Link>
      <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="sr-only">{copy.language}</span>
        <select
          aria-label={copy.language}
          value={language}
          onChange={(e) => saveSiteLanguagePreference(e.target.value)}
          className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus-visible:outline-2 focus-visible:outline-primary"
        >
          <option value="en" lang="en">English</option>
          <option value="fa" lang="fa">فارسی</option>
          <option value="ps" lang="ps">پښتو</option>
        </select>
      </label>
    </header>
  );
}
