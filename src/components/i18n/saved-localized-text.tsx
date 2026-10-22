"use client";
import { useSyncExternalStore } from "react";
import { readSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";

const copy = {
 en: {title:"Saved opportunities",description:"Keep useful jobs, scholarships, volunteer roles, and programs in one place.",error:"We could not load your saved opportunities. Please try again.",unavailable:"No saved opportunities are currently available",empty:"No saved opportunities yet",expired:"Some opportunities you saved may have expired or are no longer published. Browse current opportunities to find something new.",hint:"Save opportunities you want to review or apply for later.",browse:"Browse opportunities"},
 fa: {title:"فرصت‌های ذخیره‌شده",description:"فرصت‌های شغلی، بورسیه‌ها، فعالیت‌های داوطلبانه و برنامه‌های سودمند را در یک جا نگه دارید.",error:"بارگذاری فرصت‌های ذخیره‌شده ممکن نشد. لطفاً دوباره تلاش کنید.",unavailable:"در حال حاضر هیچ‌یک از فرصت‌های ذخیره‌شده در دسترس نیست.",empty:"هنوز فرصتی ذخیره نکرده‌اید.",expired:"ممکن است مهلت برخی فرصت‌های ذخیره‌شده پایان یافته یا دیگر منتشر نباشند. فرصت‌های موجود را بررسی کنید.",hint:"فرصت‌هایی را که می‌خواهید بعداً بررسی کنید یا برای آن‌ها درخواست دهید، ذخیره کنید.",browse:"مشاهده فرصت‌ها"},
 ps: {title:"خوندي شوي فرصتونه",description:"ګټورې دندې، بورسونه، رضاکارانه دندې او پروګرامونه په یوه ځای کې وساتئ.",error:"ستاسو خوندي شوي فرصتونه ونه موندل شول. مهرباني وکړئ بیا هڅه وکړئ.",unavailable:"اوس مهال هېڅ خوندي شوی فرصت د لاسرسي وړ نه دی.",empty:"تراوسه مو کوم فرصت نه دی خوندي کړی.",expired:"ښايي ځینې خوندي شوي فرصتونه پای ته رسېدلي وي یا نور خپاره نه وي. اوسني فرصتونه وګورئ.",hint:"هغه فرصتونه خوندي کړئ چې غواړئ وروسته یې وګورئ یا ورته غوښتنلیک واستوئ.",browse:"فرصتونه وګورئ"}
} as const satisfies Record<SiteLanguage,Record<string,string>>;
export function SavedLocalizedText({id}:{id:keyof typeof copy.en}) {
 const language=useSyncExternalStore(subscribeSiteLanguagePreference,readSiteLanguagePreference,():SiteLanguage=>"en");
 return <span lang={language} dir={language==="en"?"ltr":"rtl"}>{copy[language][id]}</span>;
}
