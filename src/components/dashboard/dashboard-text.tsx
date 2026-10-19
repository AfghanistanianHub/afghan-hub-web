"use client";

import { useSyncExternalStore } from "react";
import {
  readSiteLanguagePreference,
  subscribeSiteLanguagePreference,
  type SiteLanguage,
} from "@/lib/i18n/site-language";

const labels = {
  en: {
    eyebrow: "Your community, connected",
    welcome: "Welcome back,",
    description: "See what is moving, meet people relevant to you, and keep your next step close.",
    opportunities: "relevant opportunities",
    events: "events for you",
    nextStep: "Next best step",
    network: "Grow your network",
    complete: "Complete your profile",
  },
  fa: {
    eyebrow: "جامعه شما، در ارتباط با یکدیگر",
    welcome: "خوش آمدید،",
    description: "از تازه‌ترین فعالیت‌ها آگاه شوید، با افراد مرتبط آشنا شوید و برای گام بعدی خود برنامه‌ریزی کنید.",
    opportunities: "فرصت مرتبط",
    events: "رویداد برای شما",
    nextStep: "گام پیشنهادی بعدی",
    network: "شبکه ارتباطی خود را گسترش دهید",
    complete: "پروفایل خود را تکمیل کنید",
  },
  ps: {
    eyebrow: "ستاسو ټولنه، له یو بل سره تړلې",
    welcome: "بېرته ښه راغلاست،",
    description: "له تازه فعالیتونو خبر شئ، له اړوندو خلکو سره وپېژنئ او د خپل راتلونکي ګام لپاره چمتو اوسئ.",
    opportunities: "اړوند فرصتونه",
    events: "ستاسو لپاره غونډې",
    nextStep: "راتلونکی غوره ګام",
    network: "خپلې اړیکې پراخې کړئ",
    complete: "خپل پروفایل بشپړ کړئ",
  },
} as const satisfies Record<SiteLanguage, Record<string, string>>;

export type DashboardTextKey = keyof typeof labels.en;

export function DashboardText({ id }: { id: DashboardTextKey }) {
  const language = useSyncExternalStore(
    subscribeSiteLanguagePreference,
    readSiteLanguagePreference,
    (): SiteLanguage => "en",
  );
  return <span lang={language} dir={language === "en" ? "ltr" : "rtl"}>{labels[language][id]}</span>;
}
