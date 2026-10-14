import type { SiteLanguage } from "./site-language";

/** UI copy only. User-generated content must remain in its original language. */
export const sharedUiCopy = {
  en: {
    navigation: "Navigation",
    skipToContent: "Skip to content",
    explore: "Explore",
    people: "People",
    businesses: "Businesses",
    organizations: "Organizations",
    opportunities: "Opportunities",
    events: "Events",
    signIn: "Sign in",
    getStarted: "Get started",
    about: "About",
    support: "Support",
    privacy: "Privacy",
    terms: "Terms",
    language: "Language",
  },
  fa: {
    navigation: "ناوبری",
    skipToContent: "رفتن به محتوای اصلی",
    explore: "کاوش",
    people: "افراد",
    businesses: "کسب‌وکارها",
    organizations: "سازمان‌ها",
    opportunities: "فرصت‌ها",
    events: "رویدادها",
    signIn: "ورود",
    getStarted: "شروع کنید",
    about: "درباره ما",
    support: "پشتیبانی",
    privacy: "حریم خصوصی",
    terms: "شرایط استفاده",
    language: "زبان",
  },
  ps: {
    navigation: "لارښود",
    skipToContent: "اصلي منځپانګې ته تګ",
    explore: "پلټنه",
    people: "خلک",
    businesses: "سوداګرۍ",
    organizations: "سازمانونه",
    opportunities: "فرصتونه",
    events: "پېښې",
    signIn: "ننوتل",
    getStarted: "پیل وکړئ",
    about: "زموږ په اړه",
    support: "ملاتړ",
    privacy: "محرمیت",
    terms: "د کارونې شرایط",
    language: "ژبه",
  },
} as const satisfies Record<SiteLanguage, Record<string, string>>;

export type SharedUiCopyKey = keyof (typeof sharedUiCopy)["en"];
export function getSharedUiCopy(language: SiteLanguage) {
  return sharedUiCopy[language];
}
