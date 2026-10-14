"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { readSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";
import styles from "@/app/(public)/landing.module.css";

const copy = {
  en: { title: "Be part of what's next.", description: "Join Afghan Hub and help build a more connected, supportive, and vibrant community.", join: "Get started", explore: "Explore the platform" },
  fa: { title: "در ساختن آینده سهم بگیرید.", description: "به افغان هاب بپیوندید و در ساختن جامعه‌ای پیوسته‌تر، پشتیبان‌تر و پویاتر سهم داشته باشید.", join: "شروع کنید", explore: "پلتفرم را کاوش کنید" },
  ps: { title: "د راتلونکي په جوړولو کې برخه واخلئ.", description: "له افغان هب سره یوځای شئ او د یوې تړلې، ملاتړې او خوځنده ټولنې په جوړولو کې ونډه واخلئ.", join: "پیل وکړئ", explore: "پلېټفارم وپلټئ" },
} as const satisfies Record<SiteLanguage, Record<string, string>>;

export function LocalizedHomepageFinal() {
  const language = useSyncExternalStore(subscribeSiteLanguagePreference, readSiteLanguagePreference, (): SiteLanguage => "en");
  const t = copy[language];
  const Arrow = language === "en" ? ArrowRight : ArrowLeft;
  return <section className={styles.final} data-home-finale aria-labelledby="join-heading" lang={language} dir={language === "en" ? "ltr" : "rtl"}>
    <div><h2 data-home-reveal id="join-heading">{t.title}</h2><p data-home-reveal>{t.description}</p></div>
    <div className={styles.actions} data-home-reveal>
      <Link href="/login?mode=join" className={styles.primary}>{t.join} <Arrow size={17} aria-hidden="true" /></Link>
      <Link href="/explore" className={styles.secondary}>{t.explore} <Arrow size={17} aria-hidden="true" /></Link>
    </div>
  </section>;
}
