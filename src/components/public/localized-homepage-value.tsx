"use client";

import { useSyncExternalStore } from "react";
import { Globe2, Share2, UsersRound } from "lucide-react";
import { readSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";
import styles from "@/app/(public)/landing.module.css";

const copy = {
  en: { title: "A stronger, more connected Afghan community", description: "A shared space to make community work visible, exchange knowledge, and build relationships that open new possibilities.", benefits: [
    ["Greater visibility", "Give your work a place to be discovered."],
    ["Stronger connections", "Find common ground and move forward together."],
    ["More possibilities", "Share opportunities and collaborate across communities."],
  ] },
  fa: { title: "جامعه‌ای نیرومندتر و پیوسته‌تر برای افغانستانی‌ها", description: "فضایی مشترک برای دیده‌شدن فعالیت‌های جامعه، تبادل دانش و ایجاد ارتباط‌هایی که فرصت‌های تازه می‌آفرینند.", benefits: [
    ["دیده‌شدن بیشتر", "فضایی برای معرفی و کشف فعالیت‌های شما."],
    ["ارتباط‌های استوارتر", "زمینه‌های مشترک پیدا کنید و با هم پیش بروید."],
    ["امکان‌های بیشتر", "فرصت‌ها را شریک سازید و با جوامع مختلف همکاری کنید."],
  ] },
  ps: { title: "د افغانانو لپاره پیاوړې او لا تړلې ټولنه", description: "یو ګډ ځای چې د ټولنې فعالیتونه پکې څرګند شي، پوهه شریکه شي او داسې اړیکې جوړې شي چې نوي فرصتونه رامنځته کړي.", benefits: [
    ["لا ډېر څرګندوالی", "خپل کار نورو ته ور وپېژنئ."],
    ["پیاوړې اړیکې", "ګډې موخې ومومئ او یوځای پرمختګ وکړئ."],
    ["لا ډېر فرصتونه", "فرصتونه شریک کړئ او له بېلابېلو ټولنو سره همکاري وکړئ."],
  ] },
} as const satisfies Record<SiteLanguage, { title: string; description: string; benefits: readonly (readonly [string, string])[] }>;

const icons = [UsersRound, Share2, Globe2] as const;

export function LocalizedHomepageValue() {
  const language = useSyncExternalStore(subscribeSiteLanguagePreference, readSiteLanguagePreference, (): SiteLanguage => "en");
  const t = copy[language];
  return <section className={styles.value} aria-labelledby="value-heading" lang={language} dir={language === "en" ? "ltr" : "rtl"}>
    <div><h2 id="value-heading">{t.title}</h2><p>{t.description}</p></div>
    <div className={styles.valuePoints}>{t.benefits.map(([title, description], index) => {
      const Icon = icons[index];
      return <div key={index} data-home-benefit><Icon size={24} strokeWidth={1.5} aria-hidden="true" /><h3>{title}</h3><p>{description}</p></div>;
    })}</div>
  </section>;
}
