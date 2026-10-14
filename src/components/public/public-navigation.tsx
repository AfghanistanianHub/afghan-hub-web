"use client";

import Link from "next/link";
import { useMessages } from "@/components/i18n/locale-provider";
import { usePathname, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { Menu, Search } from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Brand } from "./brand";
import { communityAreas } from "./community-areas";
import styles from "./public-navigation.module.css";

export function PublicNavigation() {
  const t = useMessages();
  const pathname = usePathname();
  const params = useSearchParams();
  const menu = useRef<HTMLDetailsElement>(null);
  const active = (key: string) => pathname === "/explore" && params.get("type") === key;
  const close = () => { if (menu.current) menu.current.open = false; };
  const links = communityAreas.map(area => <Link key={area.key} href={area.href} onClick={close} aria-current={active(area.key) ? "page" : undefined}>{t(area.label)}</Link>);

  return <header className={styles.header}>
    <div className={styles.bar}>
      <Brand />
      <nav className={styles.desktop} aria-label={t("Public navigation")}>{links}</nav>
      <div className={styles.account}><LanguageSwitcher />
        <Link href="/#ai-navigator" aria-label={t("Search with the Afghan Hub Navigator")} className={styles.search}><Search size={19} aria-hidden="true" /></Link>
        <Link href="/login" className={styles.signIn}>{t("Sign in")}</Link>
        <Link href="/login?mode=join" className={styles.join}>{t("Get started")}</Link>
      </div>
      <details ref={menu} className={styles.mobile} onKeyDown={event => {
        if (event.key === "Escape") { close(); menu.current?.querySelector("summary")?.focus(); }
      }}>
        <summary aria-label={t("Community navigation menu")}><Menu size={22} aria-hidden="true" /></summary>
        <nav aria-label={t("Mobile public navigation")}>{links}<Link href="/login" onClick={close}>{t("Sign in")}</Link><Link href="/login?mode=join" onClick={close}>{t("Get started")}</Link></nav>
      </details>
    </div>
  </header>;
}
