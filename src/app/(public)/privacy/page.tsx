import type { Metadata } from "next";
import { InformationPage } from "@/components/public/information-page";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Information use and privacy choices in the current Afghan Hub service.",
  alternates: { canonical: "https://app.apnbc.ca/privacy" },
};

const privacyCopyByLocale = {
  en: {
    title: "Privacy",
    description: "Information use and privacy choices in the current Afghan Hub service.",
    sections: [
      {
        title: "Information you provide",
        text: "Your account uses an email address and authentication credentials. Profiles, avatars, connections, messages, saved opportunities, event RSVPs and contributed listings store the information needed to provide the features you choose."
      },
      {
        title: "Visibility and sharing",
        text: "Published listings can be viewed without an account, including any contact details you add to them. Eligible visible profiles can appear in the member directory. Your account email and internal role are not public profile fields. Change profile visibility in Settings; hiding a profile does not delete previous messages, connections or contributions."
      },
      {
        title: "Messages and media",
        text: "In-app conversation access is restricted to conversation members; this is not a claim of end-to-end encryption. Business and organization draft media is restricted to its owner; published listing media is accessible to visitors. Avatars use public image storage, so avoid uploading confidential images."
      },
      {
        title: "Service providers and cookies",
        text: "Afghan Hub uses Supabase for authentication, application data and uploaded files, and Vercel for hosting. Sign-in uses session cookies. Information needed to operate the service is processed through these providers."
      },
      {
        title: "Corrections, deletion and data export",
        text: "Edit your profile and visibility through your account. Contact support for information questions, corrections, account deletion or a copy of your data. Settings provides a JSON download of your account details and profile. Conversations, messages, connections, listings, saved items, RSVPs and file contents are outside that download. Account deletion and wider data exports still require contacting support. Share only the minimum personal information needed to explain your request."
      },
      {
        title: "Retention and request scope",
        text: "A fixed retention period and backup-deletion schedule have not yet been published. Ask support to clarify the scope and timing of a deletion or export request, including shared conversations, contributions and backups. This notice does not promise immediate removal or a specific completion date."
      }
    ]
  },
  fa: {
    title: "حریم خصوصی",
    description: "نحوه استفاده از اطلاعات و گزینه‌های حریم خصوصی در افغان هاب.",
    sections: [
      {
        title: "اطلاعاتی که ارائه می‌دهید",
        text: "حساب شما از یک آدرس ایمیل و مشخصات ورود استفاده می‌کند. پروفایل‌ها، تصاویر، پیام‌ها، فرصت‌های ذخیره‌شده و آگهی‌ها صرفاً اطلاعات لازم برای ارائه قابلیت‌های انتخابی شما را ذخیره می‌نمایند."
      },
      {
        title: "نمایش و اشتراک‌گذاری",
        text: "آگهی‌های منتشرشده بدون نیاز به حساب قابل مشاهده‌اند. پروفایل‌های عمومی در فهرست اعضا نمایش داده می‌شوند. ایمیل و نقش کاربری شما هرگز عمومی نیستند. امکان تغییر وضعیت نمایش در تنظیمات فراهم است."
      },
      {
        title: "پیام‌ها و پرونده‌های چندرسانه‌ای",
        text: "دسترسی به گفتگوها فقط برای اعضای همان مکالمه مقدور است. تصاویر پیش‌نویس کسب‌وکارها محدود به مالک است و آواتارها در فضای ذخیره‌سازی عمومی میزبانی می‌شوند، لذا از بارگذاری تصاویر محرمانه خودداری فرمایید."
      },
      {
        title: "ارائه‌دهندگان خدمات و کوکی‌ها",
        text: "افغان هاب از سوپابیس برای احراز هویت و داده‌ها و از ورسل برای میزبانی استفاده می‌کند. فرآیند ورود از کوکی‌های نشست بهره می‌برد."
      },
      {
        title: "اصلاح، حذف و دریافت نسخه داده‌ها",
        text: "امکان ویرایش مشخصات و دانلود پرونده حساب به صورت JSON در تنظیمات موجود است. برای حذف کامل حساب کاربری با پشتیبانی تماس بگیرید."
      },
      {
        title: "مدت نگهداری و حدود درخواست‌ها",
        text: "برنامه زمانی ثابت برای نگهداری و حذف نسخه‌های پشتیبان هنوز نهایی نشده است. این اطلاعیه متضمن حذف فوری یا تاریخ تکمیل قطعی نیست."
      }
    ]
  },
  ps: {
    title: "محرمیت",
    description: "په افغان هب کې د معلوماتو کارول او د محرمیت اختیارونه.",
    sections: [
      {
        title: "هغه معلومات چې تاسو یې ورکوئ",
        text: "ستاسو حساب بریښنالیک او پټ نوم کاروي. پروفایلونه، تصویرونه، پیغامونه او لېستونه یوازې هغه معلومات ساتي چې ستاسو د غوره شوو اسانتیاوو لپاره اړین دي."
      },
      {
        title: "ښودنه او شریکول",
        text: "خپاره شوي لېستونه له حساب پرته هم کتل کېدی شي. ستاسو شخصي برېښنالیک عامه نه دی. په ترتیباتو کې د خپل پروفایل د پټولو اختیار لرئ."
      },
      {
        title: "پیغامونه او رسنۍ",
        text: "خبرو اترو ته لاسرسی یوازې د همغو کسانو لپاره دی. د پروفایل انځورونه په عامه ذخیره کې دي نو محرم اسناد مه پورته کوئ."
      },
      {
        title: "چوپړتیا وړاندې کوونکي او کوکیز",
        text: "افغان هب د معلوماتو او تایید لپاره له باوري چمتوکوونکو کار اخلي او د ننوتلو لپاره لنډمهالي کوکیز کارول کېږي."
      },
      {
        title: "سمون، حذف او د معلوماتو کاپي",
        text: "تاسو کولی شئ په ترتیباتو کې خپل معلومات سم یا ډانلوډ کړئ. د حساب د بشپړ پاکولو لپاره ملاتړ ته ووایاست."
      },
      {
        title: "د ساتلو موده او د غوښتنو حدود",
        text: "د پخوانیو بیک اپونو د پاکولو لپاره ټاکلی مهالوېش نه دی اعلان شوی."
      }
    ]
  }
} as const;

export default function PrivacyPage() {
  return (
    <InformationPage
      title={privacyCopyByLocale.en.title}
      description={privacyCopyByLocale.en.description}
      sections={privacyCopyByLocale.en.sections}
      copyByLocale={privacyCopyByLocale}
    />
  );
}
