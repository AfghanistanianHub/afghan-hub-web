"use client";

import { useSyncExternalStore } from "react";
import {
  readSiteLanguagePreference,
  subscribeSiteLanguagePreference,
  type SiteLanguage,
} from "@/lib/i18n/site-language";

const labels = {
  en: {
    recommended: "Recommended for you",
    suggested: "Suggested opportunities",
    viewAll: "View all",
    noActive: "No active opportunities yet",
    newAppear: "New opportunities will appear here when they are published.",
    eyebrow: "Your community, connected",
    welcome: "Welcome back,",
    description: "See what is moving, meet people relevant to you, and keep your next step close.",
    opportunities: "relevant opportunities",
    events: "events for you",
    nextStep: "Next best step",
    network: "Grow your network",
    complete: "Complete your profile",
    step_identity: "Add your full name",
    step_avatar: "Add a profile photo",
    step_headline: "Write a clear headline",
    step_bio: "Introduce yourself",
    step_professional: "Add your work",
    step_skills: "Add skills",
    step_location: "Add your location",
    step_discovery: "Add languages or a professional link",
  },
  fa: {
    recommended: "پیشنهادشده برای شما",
    suggested: "فرصت‌های پیشنهادی",
    viewAll: "مشاهده همه",
    noActive: "هنوز فرصت فعالی وجود ندارد",
    newAppear: "فرصت‌های جدید پس از انتشار در اینجا نمایش داده می‌شوند.",
    eyebrow: "جامعه شما، در ارتباط با یکدیگر",
    welcome: "خوش آمدید،",
    description: "از تازه‌ترین فعالیت‌ها آگاه شوید، با افراد مرتبط آشنا شوید و برای گام بعدی خود برنامه‌ریزی کنید.",
    opportunities: "فرصت مرتبط",
    events: "رویداد برای شما",
    nextStep: "گام پیشنهادی بعدی",
    network: "شبکه ارتباطی خود را گسترش دهید",
    complete: "پروفایل خود را تکمیل کنید",
    step_identity: "نام و نام خانوادگی خود را اضافه کنید",
    step_avatar: "عکس پروفایل اضافه کنید",
    step_headline: "عنوان حرفه‌ای روشنی بنویسید",
    step_bio: "خود را معرفی کنید",
    step_professional: "اطلاعات شغلی خود را اضافه کنید",
    step_skills: "مهارت‌های خود را اضافه کنید",
    step_location: "موقعیت مکانی خود را اضافه کنید",
    step_discovery: "زبان‌ها یا لینک حرفه‌ای خود را اضافه کنید",
  },
  ps: {
    recommended: "ستاسو لپاره وړاندیز شوي",
    suggested: "وړاندیز شوي فرصتونه",
    viewAll: "ټول وګورئ",
    noActive: "تر اوسه فعال فرصتونه نشته",
    newAppear: "نوي فرصتونه به له خپرېدو وروسته دلته ښکاره شي.",
    eyebrow: "ستاسو ټولنه، له یو بل سره تړلې",
    welcome: "بېرته ښه راغلاست،",
    description: "له تازه فعالیتونو خبر شئ، له اړوندو خلکو سره وپېژنئ او د خپل راتلونکي ګام لپاره چمتو اوسئ.",
    opportunities: "اړوند فرصتونه",
    events: "ستاسو لپاره غونډې",
    nextStep: "راتلونکی غوره ګام",
    network: "خپلې اړیکې پراخې کړئ",
    complete: "خپل پروفایل بشپړ کړئ",
    step_identity: "خپل بشپړ نوم ورزیات کړئ",
    step_avatar: "د پروفایل انځور ورزیات کړئ",
    step_headline: "روښانه مسلکي سرلیک ولیکئ",
    step_bio: "ځان معرفي کړئ",
    step_professional: "خپل کاري معلومات ورزیات کړئ",
    step_skills: "خپل مهارتونه ورزیات کړئ",
    step_location: "خپل ځای ورزیات کړئ",
    step_discovery: "ژبې یا مسلکي لینک ورزیات کړئ",
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
