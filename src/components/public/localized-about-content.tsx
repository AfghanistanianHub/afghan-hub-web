"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, Compass, HandHeart, Network, Sparkles } from "lucide-react";
import { readSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";

const copy = {
  en: {
    eyebrow: "Our mission", line1: "More connected.", line2: "More possible.",
    intro: "Afghan Hub is a shared place for Afghan people to discover opportunities, support businesses, find organizations, meet one another, and contribute something of their own.",
    pillars: [
      ["Make discovery easier.", "Useful information is often scattered. Afghan Hub brings community listings into one place so people can see what is happening and find a next step that matters."],
      ["Turn introductions into connection.", "Members can build a profile, discover one another, connect, and start conversations. The goal is to make community easier to enter, not harder to navigate."],
      ["Grow through contribution.", "Share an opportunity, add a business or organization, or bring people together through an event. A stronger network grows when participation is simple and visible."],
    ],
    participation: "Built around participation",
    headline: "A useful community space should make it easier to show up.",
    summary: "Explore first. Join when you are ready. Contribute when you have something to share.",
    explore: "Explore Afghan Hub", join: "Join the community",
  },
  fa: {
    eyebrow: "مأموریت ما", line1: "ارتباط بیشتر.", line2: "امکان‌های بیشتر.",
    intro: "افغان هاب فضایی مشترک برای مردم افغانستان است تا فرصت‌ها را پیدا کنند، از کسب‌وکارها حمایت کنند، با سازمان‌ها آشنا شوند، با یکدیگر ارتباط برقرار کنند و سهمی در جامعه داشته باشند.",
    pillars: [
      ["کشف فرصت‌ها را آسان‌تر کنیم.", "اطلاعات مفید اغلب پراکنده‌اند. افغان هاب فهرست‌های اجتماعی را در یک جا گرد می‌آورد تا افراد از رویدادها و فرصت‌ها آگاه شوند و گام بعدی مناسب خود را پیدا کنند."],
      ["آشنایی را به ارتباط تبدیل کنیم.", "اعضا می‌توانند پروفایل بسازند، یکدیگر را پیدا کنند، ارتباط برقرار کنند و گفت‌وگو را آغاز کنند. هدف این است که پیوستن به جامعه آسان‌تر شود."],
      ["با مشارکت رشد کنیم.", "فرصتی را به اشتراک بگذارید، کسب‌وکار یا سازمانی را معرفی کنید یا با برگزاری رویداد افراد را کنار هم بیاورید. شبکه‌ای نیرومندتر با مشارکت آسان و آشکار شکل می‌گیرد."],
    ],
    participation: "بر پایه مشارکت",
    headline: "فضای اجتماعی مفید باید مشارکت را آسان‌تر کند.",
    summary: "نخست جست‌وجو کنید. هر زمان آماده بودید عضو شوید. وقتی چیزی برای ارائه داشتید، مشارکت کنید.",
    explore: "کاوش در افغان هاب", join: "پیوستن به جامعه",
  },
  ps: {
    eyebrow: "زموږ موخه", line1: "لا ډېرې اړیکې.", line2: "لا ډېر فرصتونه.",
    intro: "افغان هاب د افغانستان د خلکو لپاره یو ګډ ځای دی، څو فرصتونه ومومي، له سوداګریو ملاتړ وکړي، سازمانونه وپېژني، له یو بل سره اړیکې جوړې کړي او په ټولنه کې ونډه واخلي.",
    pillars: [
      ["د فرصتونو موندل اسانه کړو.", "ګټور معلومات ډېر ځله په بېلابېلو ځایونو کې خپاره وي. افغان هاب د ټولنې اړوند معلومات په یوه ځای کې راټولوي، څو خلک له شته فرصتونو خبر شي او خپل راتلونکی ګام ومومي."],
      ["پېژندګلوي په اړیکو بدله کړو.", "غړي کولای شي خپل پروفایل جوړ کړي، یو بل ومومي، اړیکې ټینګې کړي او خبرې پیل کړي. موخه دا ده چې په ټولنه کې ګډون لا اسانه شي."],
      ["د ګډون له لارې وده وکړو.", "یو فرصت شریک کړئ، سوداګري یا سازمان ور وپېژنئ او یا د یوې غونډې له لارې خلک سره راټول کړئ. پیاوړې شبکه د اسانه او ښکاره ګډون له لارې وده کوي."],
    ],
    participation: "د ګډون پر بنسټ",
    headline: "یو ګټور ټولنیز ځای باید ګډون اسانه کړي.",
    summary: "لومړی وپلټئ. کله چې چمتو وئ، غړی شئ. که د شریکولو لپاره څه لرئ، ونډه واخلئ.",
    explore: "افغان هاب وپلټئ", join: "له ټولنې سره یوځای شئ",
  },
} as const;

const icons = [Compass, Network, HandHeart] as const;

export function LocalizedAboutContent() {
  const language = useSyncExternalStore(
    subscribeSiteLanguagePreference,
    readSiteLanguagePreference,
    (): SiteLanguage => "en",
  );
  const c = copy[language];
  const Arrow = language === "en" ? ArrowRight : ArrowLeft;
  return (
    <main id="main-content" lang={language} dir={language === "en" ? "ltr" : "rtl"}>
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles aria-hidden="true" className="size-3.5" />{c.eyebrow}
            </div>
            <h1 className="mt-6 text-3xl font-medium leading-tight sm:text-4xl">{c.line1}<span className="block text-primary">{c.line2}</span></h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">{c.intro}</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid border-y border-border lg:grid-cols-3">
          {c.pillars.map(([title, description], index) => {
            const Icon = icons[index];
            return <article key={index} className="border-b border-border px-1 py-7 lg:border-b-0 lg:border-e lg:px-7 lg:last:border-e-0">
              <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary"><Icon aria-hidden="true" className="size-5" /></span>
              <h2 className="mt-5 text-xl font-semibold sm:text-2xl">{title}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
            </article>;
          })}
        </div>
        <div className="mt-12 border-y border-border bg-muted/20 px-1 py-8 sm:px-0 sm:py-9">
          <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold text-primary">{c.participation}</p>
              <h2 className="mt-3 text-3xl font-semibold">{c.headline}</h2>
              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{c.summary}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link href="/explore" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{c.explore}<Arrow aria-hidden="true" className="size-4" /></Link>
              <Link href="/login?mode=join" className="rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{c.join}</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
