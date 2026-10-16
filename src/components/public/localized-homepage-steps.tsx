"use client";

import { useSyncExternalStore } from "react";
import { CalendarDays, ChartNoAxesColumnIncreasing, Search, Share2 } from "lucide-react";
import { readSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";
import styles from "@/app/(public)/landing.module.css";

const content = {
  en: { title: "How Afghan Hub works", subtitle: "A simple path to meaningful connections.", steps: [
    ["Discover", "Find people, businesses, organizations, opportunities, and events."],
    ["Connect", "Build meaningful relationships across communities."],
    ["Participate", "Join events, pursue opportunities, and collaborate."],
    ["Grow", "Create visibility, strengthen relationships, and increase impact."],
  ] },
  fa: { title: "افغان هاب چگونه کار می‌کند", subtitle: "راهی ساده برای ایجاد ارتباط‌های معنادار.", steps: [
    ["کشف کنید", "افراد، کسب‌وکارها، سازمان‌ها، فرصت‌ها و رویدادها را پیدا کنید."],
    ["ارتباط برقرار کنید", "با اعضای جامعه ارتباط‌های ارزشمند و پایدار بسازید."],
    ["مشارکت کنید", "در رویدادها شرکت کنید، فرصت‌ها را دنبال کنید و همکاری کنید."],
    ["رشد کنید", "بیشتر دیده شوید، ارتباط‌ها را تقویت کنید و تأثیر بیشتری بگذارید."],
  ] },
  ps: { title: "افغان هب څنګه کار کوي", subtitle: "د ارزښتناکو اړیکو جوړولو لپاره یوه ساده لاره.", steps: [
    ["ومومئ", "خلک، سوداګرۍ، سازمانونه، فرصتونه او پېښې ومومئ."],
    ["اړیکې جوړې کړئ", "له ټولنو سره ارزښتناکې اړیکې ټینګې کړئ."],
    ["ګډون وکړئ", "په پېښو کې برخه واخلئ، فرصتونه وپلټئ او همکاري وکړئ."],
    ["وده وکړئ", "خپل کار څرګند کړئ، اړیکې پیاوړې کړئ او اغېز زیات کړئ."],
  ] },
} as const satisfies Record<SiteLanguage, { title: string; subtitle: string; steps: readonly (readonly [string, string])[] }>;

const icons = [Search, Share2, CalendarDays, ChartNoAxesColumnIncreasing] as const;

export function LocalizedHomepageSteps({ initialLanguage = "en" }: { initialLanguage?: SiteLanguage }) {
  const language = useSyncExternalStore(subscribeSiteLanguagePreference, readSiteLanguagePreference, (): SiteLanguage => initialLanguage);
  const copy = content[language];
  return <section id="how-it-works" className={styles.orientation} aria-labelledby="how-heading" lang={language} dir={language === "en" ? "ltr" : "rtl"}>
    <div><h2 id="how-heading">{copy.title}</h2><p>{copy.subtitle}</p></div>
    <ol className={styles.steps}>{copy.steps.map(([title, description], index) => {
      const Icon = icons[index];
      return <li key={index} data-home-step><span className={styles.stepIcon}><Icon size={21} strokeWidth={1.6} aria-hidden="true" /></span><div><h3>{title}</h3><p>{description}</p></div></li>;
    })}</ol>
  </section>;
}
