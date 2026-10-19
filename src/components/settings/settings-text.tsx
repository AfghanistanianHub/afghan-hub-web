"use client";

import { useSyncExternalStore } from "react";
import { Settings2 } from "lucide-react";
import { MemberPageHeader } from "@/components/catalog/member-page-header";
import { readSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";

const labels = {
  "en": {
    "heading": "Settings",
    "description": "Control how your profile appears, review your account identity, and access your data and support options.",
    "signedIn": "Signed in as",
    "directory": "Directory status",
    "visible": "Visible",
    "hidden": "Hidden",
    "saved": "Your settings have been saved.",
    "identity": "Identity",
    "account": "Account information",
    "name": "Name",
    "email": "Email",
    "edit": "Edit profile details",
    "privacy": "Privacy",
    "visibility": "Profile visibility",
    "visibilityHelp": "Public profiles can appear in the member directory and be viewed by other Afghan Hub members.",
    "show": "Show my profile in the community",
    "hideHelp": "Turn this off to hide your profile from the member directory.",
    "save": "Save settings",
    "data": "Your data",
    "take": "Take a copy with you",
    "downloadHelp": "Download your account details and profile as JSON. Messages, connections, contributions, saved items, RSVPs and uploaded files are outside this download.",
    "contact": "contact support",
    "help": "Need help?",
    "missing": "Not available",
    "member": "Afghan Hub member"
  },
  "fa": {
    "heading": "تنظیمات",
    "description": "نحوه نمایش پروفایل، اطلاعات حساب و گزینه‌های دریافت داده‌ها و پشتیبانی را مدیریت کنید.",
    "signedIn": "واردشده با حساب",
    "directory": "وضعیت نمایش در فهرست",
    "visible": "نمایان",
    "hidden": "پنهان",
    "saved": "تنظیمات شما ذخیره شد.",
    "identity": "هویت",
    "account": "اطلاعات حساب",
    "name": "نام",
    "email": "ایمیل",
    "edit": "ویرایش اطلاعات پروفایل",
    "privacy": "حریم خصوصی",
    "visibility": "نمایش پروفایل",
    "visibilityHelp": "پروفایل‌های عمومی ممکن است در فهرست اعضا نمایش داده شوند و سایر اعضای افغان هاب بتوانند آن‌ها را مشاهده کنند.",
    "show": "نمایش پروفایل من در جامعه",
    "hideHelp": "برای پنهان‌کردن پروفایل از فهرست اعضا، این گزینه را غیرفعال کنید.",
    "save": "ذخیره تنظیمات",
    "data": "داده‌های شما",
    "take": "یک نسخه از اطلاعات خود دریافت کنید",
    "downloadHelp": "اطلاعات حساب و پروفایل خود را در قالب JSON دریافت کنید. پیام‌ها، ارتباطات، مشارکت‌ها، موارد ذخیره‌شده، پاسخ‌های حضور در رویدادها و فایل‌های بارگذاری‌شده در این نسخه گنجانده نمی‌شوند.",
    "contact": "با پشتیبانی تماس بگیرید",
    "help": "به کمک نیاز دارید؟",
    "missing": "در دسترس نیست",
    "member": "عضو افغان هاب"
  },
  "ps": {
    "heading": "تنظیمات",
    "description": "د خپل پروفایل ښودنه، د حساب معلومات او د معلوماتو او ملاتړ لارې اداره کړئ.",
    "signedIn": "په دې حساب ننوتلي",
    "directory": "په نوملړ کې حالت",
    "visible": "ښکاره",
    "hidden": "پټ",
    "saved": "ستاسو تنظیمات خوندي شول.",
    "identity": "پېژندنه",
    "account": "د حساب معلومات",
    "name": "نوم",
    "email": "برېښنالیک",
    "edit": "د پروفایل معلومات سمول",
    "privacy": "محرمیت",
    "visibility": "د پروفایل ښودنه",
    "visibilityHelp": "عامه پروفایلونه د غړو په نوملړ کې ښکاره کېدای شي او د افغان هاب نور غړي یې لیدلای شي.",
    "show": "زما پروفایل په ټولنه کې ښکاره کړئ",
    "hideHelp": "له نوملړ څخه د خپل پروفایل پټولو لپاره دا غوراوی بند کړئ.",
    "save": "تنظیمات خوندي کړئ",
    "data": "ستاسو معلومات",
    "take": "د خپلو معلوماتو یوه کاپي واخلئ",
    "downloadHelp": "د خپل حساب او پروفایل معلومات د JSON په بڼه ښکته کړئ. پیغامونه، اړیکې، ونډې، خوندي شوي توکي، د ګډون ځوابونه او پورته شوي فایلونه پکې نه شاملېږي.",
    "contact": "له ملاتړ سره اړیکه ونیسئ",
    "help": "مرستې ته اړتیا لرئ؟",
    "missing": "شتون نه لري",
    "member": "د افغان هاب غړی"
  }
} as const satisfies Record<SiteLanguage, Record<string, string>>;
export type SettingsTextKey = keyof typeof labels.en;

export function SettingsText({ id }: { id: SettingsTextKey }) {
  const language = useSyncExternalStore(subscribeSiteLanguagePreference, readSiteLanguagePreference, (): SiteLanguage => "en");
  return <span lang={language} dir={language === "en" ? "ltr" : "rtl"}>{labels[language][id]}</span>;
}

export function SettingsPageHeader() {
  const language = useSyncExternalStore(subscribeSiteLanguagePreference, readSiteLanguagePreference, (): SiteLanguage => "en");
  return <div lang={language} dir={language === "en" ? "ltr" : "rtl"}><MemberPageHeader title={labels[language].heading} description={labels[language].description} icon={Settings2} /></div>;
}
