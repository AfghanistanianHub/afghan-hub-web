"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useRef, useSyncExternalStore } from "react";
import { readSiteLanguagePreference, subscribeSiteLanguagePreference } from "@/lib/i18n/site-language";
import { getSharedUiCopy } from "@/lib/i18n/shared-ui-copy";
import { Menu, Search } from "lucide-react";
import { Brand } from "./brand";
import { communityAreas } from "./community-areas";
import styles from "./public-navigation.module.css";

export function PublicNavigation() {
  const language = useSyncExternalStore(subscribeSiteLanguagePreference, readSiteLanguagePreference, () => "en");
  const copy = getSharedUiCopy(language);
  const pathname = usePathname();
  const params = useSearchParams();
  const menu = useRef<HTMLDetailsElement>(null);
  const active = (key: string) => pathname === "/explore" && params.get("type") === key;
  const close = () => { if (menu.current) menu.current.open = false; };
  const links = communityAreas.map(area => <Link key={area.key} href={area.href} onClick={close} aria-current={active(area.key) ? "page" : undefined}>{copy[area.key]}</Link>);

  return <header className={styles.header} lang={language} dir={language === "en" ? "ltr" : "rtl"}>
    <div className={styles.bar}>
      <Brand />
      <nav className={styles.desktop} aria-label={copy.navigation}>{links}</nav>
      <div className={styles.account}>
        <Link href="/#ai-navigator" aria-label="Search with the Afghan Hub Navigator" className={styles.search}><Search size={19} aria-hidden="true" /></Link>
        <Link href="/login" className={styles.signIn}>{copy.signIn}</Link>
        <Link href="/login?mode=join" className={styles.join}>{copy.getStarted}</Link>
      </div>
      <details ref={menu} className={styles.mobile} onKeyDown={event => {
        if (event.key === "Escape") { close(); menu.current?.querySelector("summary")?.focus(); }
      }}>
        <summary aria-label="Community navigation menu"><Menu size={22} aria-hidden="true" /></summary>
        <nav aria-label={copy.navigation}>{links}<Link href="/login" onClick={close}>Sign in</Link><Link href="/login?mode=join" onClick={close}>Get started</Link></nav>
      </details>
    </div>
  </header>;
}
