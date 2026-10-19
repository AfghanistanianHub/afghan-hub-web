import type { SiteLanguage } from "@/lib/i18n/site-language";

const text = {
  en: {
    "/dashboard": "Home", "/network": "Network", "/search": "Search", "/opportunities": "Opportunities", "/saved": "Saved", "/submissions": "My submissions", "/businesses": "Businesses", "/organizations": "Organizations", "/events": "Events", "/messages": "Messages", "/moderation": "Moderation",
    workspace: "Workspace", account: "Account", editProfile: "Edit profile", settings: "Settings", navigation: "Main navigation", open: "Open navigation", close: "Close navigation",
    community: "Community & opportunity", communityWorkspace: "Community workspace",
    unreadMessages: "unread messages", pendingModeration: "submissions pending moderation",
  },
  fa: {
    "/dashboard": "خانه", "/network": "شبکه", "/search": "جستجو", "/opportunities": "فرصت‌ها", "/saved": "ذخیره‌شده‌ها", "/submissions": "درخواست‌های من", "/businesses": "کسب‌وکارها", "/organizations": "سازمان‌ها", "/events": "رویدادها", "/messages": "پیام‌ها", "/moderation": "مدیریت محتوا",
    workspace: "محیط کار", account: "حساب کاربری", editProfile: "ویرایش پروفایل", settings: "تنظیمات", navigation: "ناوبری اصلی", open: "باز کردن منو", close: "بستن منو",
    community: "جامعه و فرصت‌ها", communityWorkspace: "محیط کار جامعه",
    unreadMessages: "پیام خوانده‌نشده", pendingModeration: "مورد در انتظار بررسی",
  },
  ps: {
    "/dashboard": "کور", "/network": "شبکه", "/search": "لټون", "/opportunities": "فرصتونه", "/saved": "خوندي شوي", "/submissions": "زما غوښتنلیکونه", "/businesses": "سوداګرۍ", "/organizations": "سازمانونه", "/events": "پېښې", "/messages": "پیغامونه", "/moderation": "د منځپانګې څارنه",
    workspace: "کاري ځای", account: "حساب", editProfile: "پروفایل سمول", settings: "تنظیمات", navigation: "اصلي لارښود", open: "مېنو پرانیزئ", close: "مېنو وتړئ",
    community: "ټولنه او فرصتونه", communityWorkspace: "د ټولنې کاري ځای",
    unreadMessages: "نالوستل شوي پیغامونه", pendingModeration: "د ارزونې په تمه موارد",
  },
} as const satisfies Record<SiteLanguage, Record<string, string>>;

export function memberNavigationText(language: SiteLanguage) {
  return text[language];
}

export function memberNavigationLabel(language: SiteLanguage, href: string, fallback: string): string {
  const entry = text[language];
  return href in entry ? entry[href as keyof typeof entry] : fallback;
}
