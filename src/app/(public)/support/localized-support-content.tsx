"use client";

import { useSyncExternalStore } from "react";
import { InformationPage } from "@/components/public/information-page";
import { readSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";

const copy = {
  en: {
    title: "Support", description: "Help with your account, community listings and privacy questions.",
    labels: { contact: "Contact", operator: "Responsible operator", support: "Support and privacy questions", warning: "Do not send passwords, sign-in links, session tokens or sensitive identity documents by email.", navigation: { privacy: "Privacy", terms: "Terms", support: "Support", navigation: "Privacy, terms and support" } },
    sections: [
      { title: "Account and technical help", text: "For sign-in problems, try Forgot password on the sign-in page. For other issues, email the page address, what you tried and what happened. Remove private information from screenshots. Never send passwords or confirmation or recovery links." },
      { title: "Privacy, deletion and export requests", text: "Email support to ask about your information, request corrections, discuss account deletion or request a copy of your data. Use your account email where possible. Download your account details and profile from Settings as JSON. Messages, connections, contributions, saved items, RSVPs and uploaded files are outside that download. Contact support for wider requests or account deletion, and clarify scope and timing." },
      { title: "Report abuse or misleading content", text: "Send the relevant listing or profile link and a short description. Redact unrelated personal information and private messages. Reporting and member blocking are not currently available as dedicated in-app controls." },
      { title: "Response expectations", text: "Support is reached by email. A fixed response time has not been published. This address is not an emergency service; contact local emergency services for an immediate safety emergency." },
    ],
  },
  fa: {
    title: "پشتیبانی", description: "راهنمایی درباره حساب کاربری، آگهی‌های جامعه و پرسش‌های مربوط به حریم خصوصی.",
    labels: { contact: "تماس", operator: "مسئول اداره وب‌سایت", support: "پشتیبانی و پرسش‌های حریم خصوصی", warning: "رمز عبور، لینک ورود، توکن نشست یا اسناد هویتی حساس خود را از طریق ایمیل ارسال نکنید.", navigation: { privacy: "حریم خصوصی", terms: "شرایط استفاده", support: "پشتیبانی", navigation: "حریم خصوصی، شرایط استفاده و پشتیبانی" } },
    sections: [
      { title: "کمک برای حساب کاربری و مشکلات فنی", text: "اگر در ورود به حساب مشکل دارید، از گزینه «فراموشی رمز عبور» در صفحه ورود استفاده کنید. برای مشکلات دیگر، نشانی صفحه، کاری که انجام داده‌اید و نتیجه آن را از طریق ایمیل توضیح دهید. اطلاعات خصوصی را از تصاویر صفحه حذف کنید. هرگز رمز عبور یا لینک تأیید و بازیابی حساب را ارسال نکنید." },
      { title: "درخواست‌های حریم خصوصی، حذف و دریافت اطلاعات", text: "برای پرسش درباره اطلاعات شخصی، درخواست اصلاح، بررسی حذف حساب یا دریافت نسخه‌ای از داده‌های خود، ایمیل بفرستید. در صورت امکان از ایمیل مرتبط با حساب استفاده کنید. در تنظیمات می‌توانید جزئیات حساب و پروفایل خود را در قالب JSON دریافت کنید. پیام‌ها، ارتباطات، مشارکت‌ها، موارد ذخیره‌شده، ثبت‌نام رویدادها و فایل‌های بارگذاری‌شده در این دریافت گنجانده نمی‌شوند. برای درخواست گسترده‌تر یا حذف حساب، با پشتیبانی تماس بگیرید و محدوده و زمان‌بندی درخواست را روشن کنید." },
      { title: "گزارش سوءاستفاده یا محتوای گمراه‌کننده", text: "لینک آگهی یا پروفایل مربوط و توضیح کوتاهی ارسال کنید. اطلاعات شخصی نامرتبط و پیام‌های خصوصی را حذف کنید. در حال حاضر برای گزارش‌دهی و مسدودسازی اعضا، ابزار اختصاصی داخل برنامه وجود ندارد." },
      { title: "زمان پاسخ‌گویی", text: "ارتباط با پشتیبانی از طریق ایمیل است و زمان پاسخ‌گویی ثابتی اعلام نشده است. این نشانی خدمات اضطراری ارائه نمی‌کند؛ در وضعیت خطر فوری با خدمات اضطراری محل زندگی خود تماس بگیرید." },
    ],
  },
  ps: {
    title: "ملاتړ", description: "د حساب، د ټولنې د اعلانونو او د محرمیت د پوښتنو په اړه مرسته.",
    labels: { contact: "اړیکه", operator: "د وېبپاڼې مسؤل", support: "د ملاتړ او محرمیت پوښتنې", warning: "پټنومونه، د ننوتلو لینکونه، د ناستې ټوکنونه یا حساس هویتي اسناد د برېښنالیک له لارې مه لېږئ.", navigation: { privacy: "محرمیت", terms: "د کارولو شرطونه", support: "ملاتړ", navigation: "محرمیت، شرطونه او ملاتړ" } },
    sections: [
      { title: "د حساب او تخنیکي ستونزو مرسته", text: "که حساب ته په ننوتلو کې ستونزه لرئ، د ننوتلو په پاڼه کې د «هېر شوی پټنوم» لاره وکاروئ. د نورو ستونزو لپاره د پاڼې پته، خپل ترسره کړي ګامونه او پایله په برېښنالیک کې ولیکئ. له انځورونو شخصي معلومات لرې کړئ. هېڅکله پټنوم یا د حساب د تایید او بېرته ترلاسه کولو لینکونه مه لېږئ." },
      { title: "د محرمیت، ړنګولو او معلوماتو ترلاسه کولو غوښتنې", text: "د خپلو معلوماتو، سمون، حساب ړنګولو یا د معلوماتو د کاپي لپاره ملاتړ ته برېښنالیک واستوئ. که شونې وي، د خپل حساب برېښنالیک وکاروئ. له تنظیماتو څخه د حساب او پروفایل معلومات د JSON په بڼه ښکته کولای شئ. پیغامونه، اړیکې، ونډې، خوندي شوي توکي، د پېښو نوم‌لیکنې او پورته شوي فایلونه په دې کاپي کې نه شاملېږي. د پراخو غوښتنو یا حساب ړنګولو لپاره له ملاتړ سره اړیکه ونیسئ او د غوښتنې حدود او وخت روښانه کړئ." },
      { title: "د ناوړه ګټې یا ناسم محتوا راپور", text: "د اړوند اعلان یا پروفایل لینک او لنډ وضاحت واستوئ. نامربوط شخصي معلومات او شخصي پیغامونه لرې کړئ. اوس په اپلېکېشن کې د راپور ورکولو او غړو بندولو ځانګړي کنټرولونه نشته." },
      { title: "د ځواب تمه", text: "ملاتړ د برېښنالیک له لارې ترلاسه کېږي. د ځواب لپاره ټاکلی وخت نه دی اعلان شوی. دا پته بیړني خدمات نه وړاندې کوي؛ د سمدستي خطر پر مهال له خپلو سیمه‌ییزو بیړنیو خدماتو سره اړیکه ونیسئ." },
    ],
  },
} as const satisfies Record<SiteLanguage, {title: string; description: string; sections: readonly {title: string; text: string}[]; labels: {contact: string; operator: string; support: string; warning: string; navigation: {privacy: string; terms: string; support: string; navigation: string}}}>;

export function LocalizedSupportContent() {
  const language = useSyncExternalStore(subscribeSiteLanguagePreference, readSiteLanguagePreference, (): SiteLanguage => "en");
  const t = copy[language];
  return <div lang={language} dir={language === "en" ? "ltr" : "rtl"}><InformationPage title={t.title} description={t.description} sections={[...t.sections]} labels={t.labels} /></div>;
}
