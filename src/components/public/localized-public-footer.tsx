"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Brand } from "@/components/public/brand";
import { communityAreas } from "@/components/public/community-areas";
import { readSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";
import { getSharedUiCopy } from "@/lib/i18n/shared-ui-copy";
import styles from "@/components/public/public-navigation.module.css";

export function LocalizedPublicFooter() {
  const language = useSyncExternalStore(subscribeSiteLanguagePreference, readSiteLanguagePreference, (): SiteLanguage => "en");
  const t = getSharedUiCopy(language);
  return <footer className={styles.footer} lang={language} dir={language === "en" ? "ltr" : "rtl"}>
    <div><Brand /><p>{language === "en" ? "A more connected Afghan future. A place for people, possibilities, and meaningful connections." : language === "fa" ? "آینده‌ای پیوسته‌تر برای جامعه افغانستان؛ جایی برای افراد، فرصت‌ها و ارتباط‌های معنادار." : "د افغان ټولنې لپاره لا تړلی راتلونکی؛ د خلکو، فرصتونو او ارزښتناکو اړیکو ځای."}</p></div>
    <nav aria-label={t.explore}><h2>{t.explore}</h2>{communityAreas.map(area => <Link key={area.key} href={area.href}>{t[area.key]}</Link>)}</nav>
    <nav aria-label={language === "en" ? "Platform" : language === "fa" ? "پلتفرم" : "پلېټفارم"}><h2>Afghan Hub</h2><Link href="/about">{t.about}</Link><Link href={`/${language}#how-it-works`}>{language === "en" ? "How it works" : language === "fa" ? "چگونه کار می‌کند" : "څنګه کار کوي"}</Link><Link href={`/${language}#ai-navigator`}>{language === "en" ? "AI Navigator" : language === "fa" ? "راهنمای هوشمند" : "ځیرک لارښود"}</Link><Link href="/login?mode=join">{t.getStarted}</Link><Link href="/login">{t.signIn}</Link></nav>
    <nav aria-label={t.support}><h2>{t.support}</h2><Link href="/support">{t.support}</Link><Link href="/privacy">{t.privacy}</Link><Link href="/terms">{t.terms}</Link></nav>
    <p className={styles.copyright}>© {new Date().getFullYear()} Afghan Hub. {language === "en" ? "All rights reserved." : language === "fa" ? "تمام حقوق محفوظ است." : "ټول حقونه خوندي دي."}</p>
  </footer>;
}
