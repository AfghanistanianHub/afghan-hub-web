import type { Metadata } from "next";
import { InformationPage } from "@/components/public/information-page";

export const metadata: Metadata = {
  title: "Terms",
  description: "Community participation and service information for Afghan Hub.",
  alternates: { canonical: "https://app.apnbc.ca/terms" },
};

const termsCopyByLocale = {
  en: {
    title: "Terms",
    description: "Community participation and service information for Afghan Hub.",
    sections: [
      {
        title: "Respectful participation",
        text: "Use the community to make useful connections and share relevant listings. Do not use the service for harassment, threats, impersonation, spam or attempts to access another person's account or private information."
      },
      {
        title: "Responsible contributions",
        text: "Keep your profile and listing information accurate. Upload and publish only material you have permission to share. Do not publish another person's confidential documents or private contact details without permission."
      },
      {
        title: "Listings and moderation",
        text: "Contributions can pass through draft and moderation states before publication. Review details with the relevant organizer or provider before applying, paying or attending. A listing or verification badge should not replace your own checks."
      },
      {
        title: "Account security",
        text: "Keep passwords and sign-in links private. Reset your password and contact support if you suspect misuse. Do not bypass permissions, collect private member information or interfere with the service."
      },
      {
        title: "Concerns and legal scope",
        text: "Email support about misleading content, abuse, privacy concerns or account problems. Include the relevant page link and a brief explanation. A response time is not promised. These community terms do not specify a governing jurisdiction, dispute process or contractual liability limits; those legal terms remain to be confirmed."
      }
    ]
  },
  fa: {
    title: "شرایط استفاده",
    description: "مقررات مشارکت و اطلاعات خدمات در افغان هاب.",
    sections: [
      {
        title: "مشارکت توأم با احترام",
        text: "از امکانات جامعه برای ایجاد ارتباطات سازنده و به اشتراک‌گذاری آگهی‌های مفید بهره بگیرید. استفاده از خدمات برای آزار، تهدید، جعل هویت، هرزنامه یا تلاش برای دسترسی به حساب دیگران ممنوع است."
      },
      {
        title: "مسئولیت در قبال اطلاعات ثبت‌شده",
        text: "اطلاعات پروفایل و آگهی‌های خود را دقیق نگه دارید. تنها مطالبی را بارگذاری و منتشر کنید که اجازه اشتراک‌گذاری آن را دارید. مدارک محرمانه یا اطلاعات تماس دیگران را بدون اجازه منتشر نکنید."
      },
      {
        title: "آگهی‌ها و بررسی محتوا",
        text: "مطالب ارسالی پیش از انتشار ممکن است مراحل پیش‌نویس و بررسی ناظران را طی کنند. پیش از اقدام یا پرداخت هزینه، جزئیات را شخصاً با برگزارکننده بررسی فرمایید. نشان تأیید جایگزین ارزیابی فردی شما نیست."
      },
      {
        title: "امنیت حساب کاربری",
        text: "گذرواژه‌ها و لینک‌های ورود را محرمانه نگه دارید. در صورت مشاهده هرگونه سوءاستفاده رمز خود را تغییر داده و با پشتیبانی تماس بگیرید. تلاش برای دور زدن دسترسی‌ها یا نقض امنیت خدمات ممنوع است."
      },
      {
        title: "پیگیری و حدود قانونی",
        text: "هرگونه گزارش محتوای نادرست، سوءاستفاده یا دغدغه حریم خصوصی را با ارسال لینک و توضیح کوتاه به پشتیبانی اعلام فرمایید. زمان پاسخگویی تضمین نشده است."
      }
    ]
  },
  ps: {
    title: "د کارونې شرایط",
    description: "په افغان هب کې د ټولنیز ګډون او خدمتونو لارښود.",
    sections: [
      {
        title: "محترمانه ګډون",
        text: "له دې شبکې څخه د ګټورو اړیکو جوړولو او د باارزښته لېستونو د شریکولو لپاره کار واخلئ. له خدمتونو څخه د ځورونې، ګواښ، جعلي هویت، یا د بل چا معلوماتو ته د لاسرسي لپاره کار مه اخلئ."
      },
      {
        title: "د منځپانګې مسؤلیت",
        text: "د خپل پروفایل او لېستونو معلومات کره وساتئ. یوازې هغه اسناد او مواد خپاره کړئ چې د شریکولو حق یې لرئ. د نورو محرم اسناد مه خپروئ."
      },
      {
        title: "لېستونه او څارنه",
        text: "لېستونه ښايي له خپرېدو وړاندې د مدیرانو لخوا وکتل شي. مخکې له دې چې درخواست وکړئ یا پیسې ورکړئ، جزئیات په خپله وڅارئ. د تایید نښه ستاسو د خپلو پلټنو ځای نه نیسي."
      },
      {
        title: "د حساب امنیت",
        text: "پټ نومونه او د ننوتلو لېنکونه محرم وساتئ. د کومې ستونزې پر مهال ژر خپل پټ نوم بدل کړئ او ملاتړ خبر کړئ."
      },
      {
        title: "اندېښنې او قانوني حدود",
        text: "د سرغړونو، ناسمې منځپانګې، یا حساب د ستونزو په هکله د پاڼې له لېنک سره ملاتړ ته بریښنالیک ولېږئ. د چټک ځواب تضمین نشته."
      }
    ]
  }
} as const;

export default function TermsPage() {
  return (
    <InformationPage
      title={termsCopyByLocale.en.title}
      description={termsCopyByLocale.en.description}
      sections={termsCopyByLocale.en.sections}
      copyByLocale={termsCopyByLocale}
    />
  );
}
