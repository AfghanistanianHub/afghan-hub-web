"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { readSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";
import { getSharedUiCopy } from "@/lib/i18n/shared-ui-copy";
import { BriefcaseBusiness, CalendarDays, Landmark, Rocket, UsersRound } from "lucide-react";
import { communityAreas } from "./community-areas";
import styles from "./living-network.module.css";

export const communityIcons = { people: UsersRound, businesses: BriefcaseBusiness, organizations: Landmark, opportunities: Rocket, events: CalendarDays };

const descriptions = {
  en: ["Connect and grow together.", "Build and create opportunities.", "Amplify impact collectively.", "Find and share what\u0027s next.", "Meet, learn, and take part."],
  fa: ["ارتباط بگیرید و با هم رشد کنید.", "کسب‌وکار بسازید و فرصت بیافرینید.", "با همکاری، تأثیر بیشتری بگذارید.", "فرصت‌های تازه را پیدا کنید و به اشتراک بگذارید.", "دیدار کنید، بیاموزید و مشارکت کنید."],
  ps: ["اړیکې جوړې کړئ او یوځای وده وکړئ.", "سوداګرۍ او نوي فرصتونه رامنځته کړئ.", "په ګډه خپل اغېز زیات کړئ.", "نوي فرصتونه ومومئ او شریک یې کړئ.", "سره ووینئ، زده کړه وکړئ او ګډون وکړئ."],
} as const satisfies Record<SiteLanguage, readonly string[]>;

export function LivingNetwork() {
  const language = useSyncExternalStore(subscribeSiteLanguagePreference, readSiteLanguagePreference, (): SiteLanguage => "en");
  const copy = getSharedUiCopy(language);
  return <nav className={styles.network} aria-label={language === "en" ? "Explore the five community areas" : language === "fa" ? "کاوش در پنج بخش جامعه" : "د ټولنې پنځه برخې وپلټئ"} lang={language} dir={language === "en" ? "ltr" : "rtl"} data-hero-region>
    <svg viewBox="0 0 640 430" className={styles.geometry} fill="none" aria-hidden="true">
      {/* One quiet structural arc; the five interactive routes provide the network detail. */}
      <path d="M75 334C105 34 535 34 574 334" stroke="#e5d9ee" strokeWidth="1" />
      <path d="M98 355Q325 309 556 355" stroke="#ece3f0" strokeWidth="1" />
      <g className={`${styles.branch} ${styles.people}`}><path d="M323 56V335" /><circle cx="323" cy="193" r="2.8" /></g>
      <g className={`${styles.branch} ${styles.businesses}`}><path d="M139 140Q224 171 281 335" /><circle cx="224" cy="240" r="2.6" /></g>
      <g className={`${styles.branch} ${styles.organizations}`}><path d="M532 134Q461 178 404 335" /><circle cx="472" cy="220" r="2.6" /></g>
      <g className={`${styles.branch} ${styles.opportunities}`}><path d="M78 266Q159 245 226 335" /><circle cx="153" cy="273" r="2.8" /></g>
      <g className={`${styles.branch} ${styles.events}`}><path d="M588 267Q514 247 464 335" /><circle cx="514" cy="272" r="2.8" /></g>
    </svg>
    {communityAreas.map(area => { const Icon = communityIcons[area.key]; return <Link key={area.key} href={area.href} data-community-node={area.key} aria-label={copy[area.key]} aria-describedby={`network-${area.key}-description`} className={`${styles.node} ${styles[area.key]}`}>
      <span className={styles.icon}><Icon size={25} strokeWidth={1.5} aria-hidden="true" /></span>
      <span className={styles.label}>{copy[area.key]}</span>
      <span id={`network-${area.key}-description`} className={styles.description}>{descriptions[language][communityAreas.findIndex(item => item.key === area.key)]}</span>
    </Link>; })}
  </nav>;
}
