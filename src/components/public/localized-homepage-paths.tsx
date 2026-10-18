"use client";

import { useSyncExternalStore } from "react";
import { NavigatorJourneyLink } from "@/components/assistant/navigator-journey-link";
import { readSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";
import styles from "@/app/(public)/landing.module.css";

const copy = {
  en: { eyebrow: "START WITH YOUR GOAL", title: "Your next step starts here.", description: "There’s more than one way into the network. Let the Navigator help you find yours.", paths: ["Find my community", "Grow my business", "Discover opportunities", "Connect with organizations", "Explore arts and culture", "Attend or host events"] },
  fa: { eyebrow: "از هدف خود شروع کنید", title: "گام بعدی شما از اینجا آغاز می‌شود.", description: "برای پیوستن به این شبکه راه‌های گوناگونی وجود دارد. بگذارید راهنمای افغان هاب مسیر مناسب شما را پیدا کند.", paths: ["جامعه خود را پیدا کنم", "کسب‌وکارم را رشد بدهم", "فرصت‌ها را کشف کنم", "با سازمان‌ها ارتباط بگیرم", "هنر و فرهنگ را کاوش کنم", "در رویدادها شرکت یا آن‌ها را برگزار کنم"] },
  ps: { eyebrow: "له خپل هدفه پیل وکړئ", title: "ستاسو بل ګام له همدې ځایه پیلېږي.", description: "له دې شبکې سره د یوځای کېدو بېلابېلې لارې شته. پرېږدئ چې د افغان هب لارښود درسره مناسبه لاره ومومي.", paths: ["خپله ټولنه ومومم", "خپلې سوداګرۍ ته وده ورکړم", "فرصتونه ومومم", "له سازمانونو سره اړیکې جوړې کړم", "هنر او کلتور وپلټم", "په پېښو کې ګډون یا یې کوربتوب وکړم"] },
} as const satisfies Record<SiteLanguage, { eyebrow: string; title: string; description: string; paths: readonly string[] }>;

const queries = ["Meet people", "Grow my work or business", "Find opportunities", "Connect with organizations", "Artists & Creatives", "Explore events"] as const;

export function LocalizedHomepagePaths({ initialLanguage = "en" }: { initialLanguage?: SiteLanguage }) {
  const language = useSyncExternalStore(subscribeSiteLanguagePreference, readSiteLanguagePreference, (): SiteLanguage => initialLanguage);
  const t = copy[language];
  return <section className={styles.paths} aria-labelledby="paths-heading" lang={language} dir={language === "en" ? "ltr" : "rtl"}>
    <div><p className={styles.eyebrow}>{t.eyebrow}</p><h2 id="paths-heading">{t.title}</h2><p>{t.description}</p></div>
    <div className={styles.pathLinks}>{t.paths.map((title, index) => <NavigatorJourneyLink key={queries[index]} query={queries[index]} title={title} />)}</div>
  </section>;
}
