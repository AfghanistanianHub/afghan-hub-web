"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowRight } from "lucide-react";
import { LivingNetwork } from "@/components/public/living-network";
import { readSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";
import styles from "@/app/(public)/landing.module.css";

const heroCopy = {
  en: {
    eyebrow: "A MORE CONNECTED AFGHAN FUTURE",
    first: "One network.",
    second: "Many ways to",
    emphasis: "belong.",
    description: "Afghan Hub connects people, businesses, organizations, opportunities, and events — creating space for meaningful connections, collaboration, and shared progress.",
    join: "Join the community",
    explore: "Explore the network",
  },
  fa: {
    eyebrow: "آینده‌ای پیوسته‌تر برای جامعه افغانستان",
    first: "یک شبکه.",
    second: "راه‌های بی‌شمار برای",
    emphasis: "همراه شدن.",
    description: "افغان هاب افراد، کسب‌وکارها، سازمان‌ها، فرصت‌ها و رویدادها را به هم پیوند می‌دهد تا فضایی برای ارتباط‌های معنادار، همکاری و پیشرفت مشترک فراهم شود.",
    join: "به جامعه بپیوندید",
    explore: "شبکه را کاوش کنید",
  },
  ps: {
    eyebrow: "د افغان ټولنې لپاره لا تړلی راتلونکی",
    first: "یوه شبکه.",
    second: "د یوځای کېدو",
    emphasis: "بېلابېلې لارې.",
    description: "افغان هب خلک، سوداګرۍ، سازمانونه، فرصتونه او پېښې سره نښلوي، څو د ارزښتناکو اړیکو، همکارۍ او ګډ پرمختګ لپاره ځای برابر شي.",
    join: "له ټولنې سره یوځای شئ",
    explore: "شبکه وپلټئ",
  },
} as const satisfies Record<SiteLanguage, Record<string, string>>;

export function LocalizedHomepageHero() {
  const language = useSyncExternalStore(subscribeSiteLanguagePreference, readSiteLanguagePreference, (): SiteLanguage => "en");
  const copy = heroCopy[language];
  return <section className={styles.hero} aria-labelledby="landing-title" lang={language} dir={language === "en" ? "ltr" : "rtl"}>
    <div className={styles.statement}>
      <p className={styles.eyebrow}>{copy.eyebrow}</p>
      <h1 id="landing-title">{copy.first}<br />{copy.second} <em>{copy.emphasis}</em></h1>
      <p className={styles.intro}>{copy.description}</p>
      <div className={styles.actions}>
        <Link href="/login?mode=join" data-landing-cta="join" className={styles.primary}>{copy.join} <ArrowRight size={17} aria-hidden="true" /></Link>
        <Link href="/explore" data-landing-cta="explore" className={styles.secondary}>{copy.explore} <ArrowRight size={17} aria-hidden="true" /></Link>
      </div>
    </div>
    <LivingNetwork />
  </section>;
}
