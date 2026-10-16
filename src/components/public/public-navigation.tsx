"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRef, useSyncExternalStore } from "react";
import { readSiteLanguagePreference, saveSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";
import { getSharedUiCopy } from "@/lib/i18n/shared-ui-copy";
import { Menu, Search } from "lucide-react";
import { Brand } from "./brand";
import { communityAreas } from "./community-areas";
import styles from "./public-navigation.module.css";

export function PublicNavigation() {
  const language = useSyncExternalStore(subscribeSiteLanguagePreference, readSiteLanguagePreference, (): SiteLanguage => "en");
  const copy = getSharedUiCopy(language);
  const pathname = usePathname();
  const params = useSearchParams();
  const menu = useRef<HTMLDetailsElement>(null);
  const active = (key: (typeof communityAreas)[number]["key"]) => pathname === "/explore" && params.get("type") === key;
  const close = () => { if (menu.current) menu.current.open = false; };
  const languageSelector = <label className={styles.languageControl}><span className="sr-only">{copy.language}</span><select aria-label={copy.language} value={language} onChange={event => saveSiteLanguagePreference(event.target.value)}><option value="en" lang="en">English</option><option value="fa" lang="fa">فارسی</option><option value="ps" lang="ps">پښتو</option></select></label>;
  const links = communityAreas.map(area => <Link key={area.key} href={area.href} onClick={close} aria-current={active(area.key) ? "page" : undefined}>{copy[area.key]}</Link>);

  return <header className={styles.header} lang={language} dir={language === "en" ? "ltr" : "rtl"}>
    <div className={styles.bar}>
      <Brand />
      <nav className={styles.desktop} aria-label={copy.navigation}>{links}</nav>
      <div className={styles.account}>
        {languageSelector}
        <Link href="/#ai-navigator" aria-label={language === "en" ? "Search with the Afghan Hub Navigator" : language === "fa" ? "جست‌وجو با راهنمای افغان هاب" : "د افغان هب له لارښود سره لټون"} className={styles.search}><Search size={19} aria-hidden="true" /></Link>
        <Link href="/login" className={styles.signIn}>{copy.signIn}</Link>
        <Link href="/login?mode=join" className={styles.join}>{copy.getStarted}</Link>
      </div>
      <details ref={menu} className={styles.mobile} onKeyDown={event => {
        if (event.key === "Escape") { close(); menu.current?.querySelector("summary")?.focus(); }
      }}>
        <summary aria-label={copy.navigation}><Menu size={22} aria-hidden="true" /></summary>
        <nav aria-label={copy.navigation}>{links}<Link href="/#ai-navigator" onClick={close}>{language === "en" ? "Search with Navigator" : language === "fa" ? "جست‌وجو با راهنما" : "د لارښود له لارې لټون"}</Link><Link href="/login" onClick={close}>{copy.signIn}</Link><Link href="/login?mode=join" onClick={close}>{copy.getStarted}</Link></nav>
      </details>
    </div>
  </header>;
}
