"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowLeft, ArrowRight, Compass, HandHeart, Network, Sparkles } from "lucide-react";
import { readSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";

const aboutCopy = {
  en: {
    kicker: "Our mission",
    heading1: "More connected.",
    heading2: "More possible.",
    lead: "Afghan Hub is a shared place for Afghan people to discover opportunities, support businesses, find organizations, meet one another, and contribute something of their own.",
    pillars: [
      {
        title: "Make discovery easier.",
        description: "Useful information is often scattered. Afghan Hub brings community listings into one place so people can see what is happening and find a next step that matters.",
      },
      {
        title: "Turn introductions into connection.",
        description: "Members can build a profile, discover one another, connect, and start conversations. The goal is to make community easier to enter, not harder to navigate.",
      },
      {
        title: "Grow through contribution.",
        description: "Share an opportunity, add a business or organization, or bring people together through an event. A stronger network grows when participation is simple and visible.",
      },
    ],
    ctaKicker: "Built around participation",
    ctaHeading: "A useful community space should make it easier to show up.",
    ctaLead: "Explore first. Join when you are ready. Contribute when you have something to share.",
    exploreAction: "Explore Afghan Hub",
    joinAction: "Join the community",
  },
  fa: {
    kicker: "رسالت ما",
    heading1: "پیوسته‌تر.",
    heading2: "امکان‌پذیرتر.",
    lead: "افغان هاب فضایی مشترک برای جامعه افغانستان است تا فرصت‌ها را کشف کنند، از کسب‌وکارها پشتیبانی نمایند، سازمان‌ها را بیابند، با یکدیگر آشنا شوند و نقش ارزشمندی از خود برجای بگذارند.",
    pillars: [
      {
        title: "آسان‌سازی کشف و جست‌وجو.",
        description: "اطلاعات مفید معمولاً پراکنده است. افغان هاب آگهی‌های جامعه را در یک مکان گرد هم می‌آورد تا اعضا از رویدادها باخبر شوند و گام بعدی مؤثر خود را پیدا کنند.",
      },
      {
        title: "تبدیل آشنایی به پیوندهای استوار.",
        description: "اعضا می‌توانند پروفایل ایجاد کنند، یکدیگر را بیابند، ارتباط برقرار کنند و گفتگوها را آغاز نمایند. هدف ما این است که ورود به جامعه آسان‌تر و پیمایش در آن روان‌تر شود.",
      },
      {
        title: "رشد از طریق مشارکت و همیاری.",
        description: "یک فرصت کاری به اشتراک بگذارید، کسب‌وکار یا سازمانی ثبت کنید یا با برگزاری رویداد، افراد را گرد هم آورید. شبکه‌ای نیرومندتر زمانی شکوفا می‌شود که مشارکت ساده و نمایان باشد.",
      },
    ],
    ctaKicker: "بر پایه مشارکت پایدار",
    ctaHeading: "یک فضای اجتماعی کارآمد، حضور و همکاری را برای همه آسان می‌سازد.",
    ctaLead: "ابتدا کاوش کنید. هر زمان که آماده بودید بپیوندید. و هرگاه تجارب یا فرصتی داشتید به اشتراک بگذارید.",
    exploreAction: "کاوش در افغان هاب",
    joinAction: "پیوستن به جامعه",
  },
  ps: {
    kicker: "زموږ موخه",
    heading1: "لا ډېر تړلی.",
    heading2: "لا ډېر ممکن.",
    lead: "افغان هب د افغانانو لپاره یو ګډ ځای دی چې فرصتونه ومومي، د سوداګریو ملاتړ وکړي، سازمانونه وپېژني، له یو بل سره وویني او خپله برخه ونډه واخلي.",
    pillars: [
      {
        title: "د لټون او موندنې اسانه کول.",
        description: "ګټور معلومات ډېر کله خپاره وي. افغان هب د ټولنې ټول لېستونه یو ځای راټولوي څو خلک وویني څه روان دي او خپل باارزښته بل ګام ومومي.",
      },
      {
        title: "پېژندګلوي پر ژورو اړیکو بدلول.",
        description: "غړي کولی شي خپل پروفایل جوړ کړي، یو بل ومومي، اړیکې ونیسي او خبرې پیل کړي. هدف دا دی چې ټولنې ته ننوتل اسانه او تګ راتګ پکې ساده وي.",
      },
      {
        title: "د ګډې ونډې له لارې وده.",
        description: "فرصتونه شریک کړئ، سوداګري یا سازمان ورزیات کړئ، یا د غونډو له لارې خلک راټول کړئ. یوه پیاوړې شبکه هغه وخت غښتونکې کېږي چې ګډون اسانه او څرګند وي.",
      },
    ],
    ctaKicker: "پر ګډون ولاړ جوړښت",
    ctaHeading: "یوه ګټوره ټولنیزه فضا باید ګډون او برخه اخیستنه اسانه کړي.",
    ctaLead: "لومړی پلټنه وکړئ. کله چې چمتو شوئ یوځای شئ. او کله چې څه لرئ له نورو سره یې شریک کړئ.",
    exploreAction: "افغان هب وپلټئ",
    joinAction: "له ټولنې سره یوځای شئ",
  },
} as const;

const icons = [Compass, Network, HandHeart] as const;

export function LocalizedAboutContent() {
  const language = useSyncExternalStore(subscribeSiteLanguagePreference, readSiteLanguagePreference, (): SiteLanguage => "en");
  const copy = aboutCopy[language];
  const Arrow = language === "en" ? ArrowRight : ArrowLeft;

  return (
    <main id="main-content" lang={language} dir={language === "en" ? "ltr" : "rtl"}>
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="max-w-3xl">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <Sparkles aria-hidden="true" className="size-3.5" />
                {copy.kicker}
              </div>
              <h1 className="mt-6 text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
                {copy.heading1}<br /><span className="text-primary">{copy.heading2}</span>
              </h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
                {copy.lead}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid border-y border-border lg:grid-cols-3">
          {copy.pillars.map((pillar, index) => {
            const Icon = icons[index];
            return (
              <article key={pillar.title} className="border-b border-border px-1 py-7 lg:border-b-0 lg:border-e lg:px-7 lg:last:border-e-0">
                <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <h2 className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl">{pillar.title}</h2>
                <p className="mt-3 leading-7 text-muted-foreground">{pillar.description}</p>
              </article>
            );
          })}
        </div>

        <div className="mt-12 border-y border-border bg-muted/20 px-1 py-8 sm:px-0 sm:py-9">
          <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{copy.ctaKicker}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">{copy.ctaHeading}</h2>
              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{copy.ctaLead}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link href="/explore" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                {copy.exploreAction} <Arrow aria-hidden="true" className="size-4" />
              </Link>
              <Link href="/login?mode=join" className="rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                {copy.joinAction}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
