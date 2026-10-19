"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowRight, Compass, HandHeart, Network, Sparkles } from "lucide-react";
import { readSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";

const contentByLanguage = {
  en: {
    label: "Our mission", headline: "More connected.", highlight: "More possible.",
    introduction: "Afghan Hub is a shared place for Afghan people to discover opportunities, support businesses, find organizations, meet one another, and contribute something of their own.",
    pillars: [
      { title: "Make discovery easier.", description: "Useful information is often scattered. Afghan Hub brings community listings into one place so people can see what is happening and find a next step that matters." },
      { title: "Turn introductions into connection.", description: "Members can build a profile, discover one another, connect, and start conversations. The goal is to make community easier to enter, not harder to navigate." },
      { title: "Grow through contribution.", description: "Share an opportunity, add a business or organization, or bring people together through an event. A stronger network grows when participation is simple and visible." },
    ],
    participation: "Built around participation", participationTitle: "A useful community space should make it easier to show up.",
    participationDescription: "Explore first. Join when you are ready. Contribute when you have something to share.",
    explore: "Explore Afghan Hub", join: "Join the community",
  },
  fa: {
    label: "مأموریت ما", headline: "ارتباط بیشتر.", highlight: "امکان‌های بیشتر.",
    introduction: "افغان هاب فضایی مشترک برای جامعه افغانستان است تا فرصت‌ها را پیدا کنند، از کسب‌وکارها حمایت کنند، با سازمان‌ها آشنا شوند، با یکدیگر ارتباط برقرار کنند و سهمی در جامعه داشته باشند.",
    pillars: [
      { title: "دسترسی به اطلاعات را آسان‌تر کنیم.", description: "اطلاعات سودمند اغلب پراکنده‌اند. افغان هاب آگهی‌ها و اطلاعات جامعه را در یک جا گرد می‌آورد تا افراد بتوانند از فرصت‌ها آگاه شوند و گام بعدی خود را پیدا کنند." },
      { title: "آشنایی را به ارتباط تبدیل کنیم.", description: "اعضا می‌توانند پروفایل بسازند، دیگران را پیدا کنند، ارتباط برقرار کنند و گفتگو را آغاز کنند. هدف ما آسان‌تر کردن مشارکت در جامعه است." },
      { title: "با مشارکت یکدیگر رشد کنیم.", description: "فرصتی را به اشتراک بگذارید، کسب‌وکار یا سازمانی معرفی کنید یا رویدادی برگزار کنید. شبکه‌ای نیرومندتر زمانی شکل می‌گیرد که مشارکت ساده و در دسترس باشد." },
    ],
    participation: "بر پایه مشارکت", participationTitle: "فضایی سودمند برای جامعه باید مشارکت را آسان‌تر کند.",
    participationDescription: "ابتدا جستجو کنید. هر زمان آماده بودید عضو شوید و زمانی که چیزی برای به‌اشتراک‌گذاری داشتید، مشارکت کنید.",
    explore: "کاوش در افغان هاب", join: "پیوستن به جامعه",
  },
  ps: {
    label: "زموږ موخه", headline: "لا ډېرې اړیکې.", highlight: "لا ډېر فرصتونه.",
    introduction: "افغان هاب د افغان ټولنې لپاره ګډ ځای دی چې خلک پکې فرصتونه ومومي، له سوداګریو ملاتړ وکړي، سازمانونه وپېژني، یو له بل سره اړیکې جوړې کړي او خپله ونډه واخلي.",
    pillars: [
      { title: "د معلوماتو موندل اسانه کړو.", description: "ګټور معلومات ډېر ځله په بېلابېلو ځایونو کې وي. افغان هاب د ټولنې اعلانونه په یوه ځای کې راټولوي، څو خلک له شته فرصتونو خبر شي او خپل راتلونکی ګام ومومي." },
      { title: "پېژندګلوي په اړیکو بدله کړو.", description: "غړي کولای شي پروفایل جوړ کړي، نور کسان ومومي، اړیکې ورسره ټینګې کړي او خبرې پیل کړي. موخه دا ده چې په ټولنه کې ګډون اسانه شي." },
      { title: "د ګډون له لارې وده وکړو.", description: "یو فرصت شریک کړئ، سوداګري یا سازمان ور وپېژنئ، یا یوه غونډه جوړه کړئ. پیاوړې شبکه هغه وخت رامنځته کېږي چې ګډون ساده او د لاسرسي وړ وي." },
    ],
    participation: "د ګډون پر بنسټ", participationTitle: "د ټولنې ګټور ځای باید ګډون اسانه کړي.",
    participationDescription: "لومړی وپلټئ. کله چې چمتو وئ، غړي شئ او کله چې د شریکولو لپاره څه لرئ، خپله ونډه واخلئ.",
    explore: "افغان هاب وپلټئ", join: "له ټولنې سره یوځای شئ",
  },
} as const satisfies Record<SiteLanguage, { label: string; headline: string; highlight: string; introduction: string; pillars: readonly {title: string; description: string}[]; participation: string; participationTitle: string; participationDescription: string; explore: string; join: string }>;

const icons = [Compass, Network, HandHeart] as const;

export function AboutContent() {
  const language = useSyncExternalStore(subscribeSiteLanguagePreference, readSiteLanguagePreference, (): SiteLanguage => "en");
  const copy = contentByLanguage[language];
  return (
    <main id="main-content" lang={language} dir={language === "en" ? "ltr" : "rtl"}>
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles aria-hidden="true" className="size-3.5" />{copy.label}
            </div>
            <h1 className="mt-6 text-3xl font-medium leading-tight tracking-tight sm:text-4xl">{copy.headline}<span className="block text-primary">{copy.highlight}</span></h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">{copy.introduction}</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid border-y border-border lg:grid-cols-3">
          {copy.pillars.map(({ title, description }, index) => {
            const Icon = icons[index];
            return (
              <article key={index} className="border-b border-border px-1 py-7 lg:border-b-0 lg:border-e lg:px-7 lg:last:border-e-0">
                <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary"><Icon aria-hidden="true" className="size-5" /></span>
                <h2 className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h2>
                <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
              </article>
            );
          })}
        </div>
        <div className="mt-12 border-y border-border bg-muted/20 px-1 py-8 sm:px-0 sm:py-9">
          <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold text-primary">{copy.participation}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">{copy.participationTitle}</h2>
              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{copy.participationDescription}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link href="/explore" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{copy.explore}<ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" /></Link>
              <Link href="/login?mode=join" className="rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{copy.join}</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
