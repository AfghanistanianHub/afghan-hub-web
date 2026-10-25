"use client";
import { useSiteLanguage } from "@/components/i18n/localized";

const translatedPaths = {
 fa: [
  ["کار", "یافتن کار", "فرصت‌های شغلی و کسب‌وکارهایی که در حال استخدام هستند."],
  ["خدمات", "یافتن خدمات و کسب‌وکارها", "خدمات روزمره و حرفه‌ای جامعه را پیدا کنید."],
  ["ارتباط", "آشنایی با افراد هم‌حوزه", "با اعضای دارای مهارت‌ها و تجربه‌های مرتبط آشنا شوید."],
  ["عضویت", "پیوستن به جامعه", "سازمان‌ها، رویدادها و راه‌های مشارکت را کشف کنید."],
  ["مشارکت", "داوطلب شوید و کمک کنید", "فرصت‌هایی برای استفاده از زمان و تجربه خود بیابید."],
  ["رشد", "گسترش کسب‌وکار", "با کسب‌وکارهای افغان و فرصت‌های همکاری آشنا شوید."],
 ],
 ps: [
  ["کار", "کار پیدا کړئ", "دندې او هغه کاروبارونه ومومئ چې کارکوونکي ګماري."],
  ["خدمتونه", "خدمتونه او کاروبارونه", "د ورځنیو او مسلکي اړتیاوو لپاره خدمتونه ومومئ."],
  ["اړیکې", "د خپلې برخې خلک وپېژنئ", "له اړوندو مهارتونو او تجربو لرونکو غړو سره اړیکې جوړې کړئ."],
  ["ټولنه", "له ټولنې سره یوځای شئ", "سازمانونه، غونډې او د ګډون لارې وپلټئ."],
  ["مرسته", "رضاکاري او مرسته", "هغه ټولنیز فرصتونه ومومئ چې ستاسو تجربه پکې ګټوره وي."],
  ["وده", "خپل کاروبار پراخ کړئ", "د افغانانو کاروبارونه او د ګډون لارې وپېژنئ."],
 ],
} as const;
const heading = {
 en: ["Choose your path", "What do you need today?", "Start with your goal. Afghan Hub will take you to the people, services, opportunities, and community resources that fit it.", "Explore everything"],
 fa: ["مسیر خود را انتخاب کنید", "امروز به چه چیزی نیاز دارید؟", "هدف خود را انتخاب کنید تا افغان هاب شما را به افراد، خدمات، فرصت‌ها و منابع اجتماعی مرتبط برساند.", "مشاهده همه بخش‌ها"],
 ps: ["خپله لاره وټاکئ", "نن څه ته اړتیا لرئ؟", "له خپلې موخې پیل وکړئ. افغان هاب تاسو له اړوندو خلکو، خدمتونو او ټولنیزو سرچینو سره نښلوي.", "ټولې برخې وګورئ"],
} as const;
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  HandHeart,
  MapPinned,
  Store,
  UsersRound,
} from "lucide-react";

const goalPaths = [
  {
    label: "Work",
    title: "Find work",
    description: "Jobs and community businesses that are currently hiring.",
    href: "/search?intent=find_work",
    icon: BriefcaseBusiness,
    number: "01",
  },
  {
    label: "Services",
    title: "Find services & businesses",
    description: "Browse community businesses and practical services for everyday and professional needs.",
    href: "/search?intent=find_services",
    icon: MapPinned,
    number: "02",
  },
  {
    label: "Connect",
    title: "Meet people in my field",
    description: "Find members with relevant skills, experience, and community ties.",
    href: "/network",
    icon: UsersRound,
    number: "03",
  },
  {
    label: "Belong",
    title: "Join the community",
    description: "Explore organizations, events, and places to participate.",
    href: "/search?intent=join_community",
    icon: Building2,
    number: "04",
  },
  {
    label: "Contribute",
    title: "Volunteer and help",
    description: "Find community roles where your time and experience matter.",
    href: "/search?intent=volunteer",
    icon: HandHeart,
    number: "05",
  },
  {
    label: "Build",
    title: "Grow my business",
    description: "Discover the Afghan business ecosystem and ways to participate.",
    href: "/businesses",
    icon: Store,
    number: "06",
  },
];

export function GoalPaths() {
  const language = useSiteLanguage();
  return (
    <section aria-labelledby="goal-paths-heading">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {heading[language][0]}
          </p>
          <h2
            id="goal-paths-heading"
            className="mt-2 max-w-2xl text-2xl font-bold tracking-[-0.03em] text-foreground md:text-3xl"
          >
            {heading[language][1]}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {heading[language][2]}
          </p>
        </div>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 self-start text-sm font-semibold text-primary transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          {heading[language][3]}
          <ArrowUpRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
        </Link>
      </div>

      <div className="mt-6 grid border-y border-border md:grid-cols-2 xl:grid-cols-3">
        {goalPaths.map((goal, index) => {
          const Icon = goal.icon;

          return (
            <Link
              key={goal.href}
              href={goal.href}
              className={`group relative min-h-40 border-b border-border px-1 py-5 transition-colors hover:bg-secondary/35 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:px-5 ${index % 2 === 0 ? "md:border-r" : ""} ${index < 3 ? "xl:border-b" : "xl:border-b-0"} ${index % 3 !== 2 ? "xl:border-r" : "xl:border-r-0"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <span aria-hidden="true" className="text-[0.62rem] font-semibold tracking-[0.16em] text-muted-foreground">
                  {goal.number}
                </span>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-primary">
                    {language === "en" ? goal.label : translatedPaths[language][index][0]}
                  </p>
                  <h3 className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-foreground">
                    {language === "en" ? goal.title : translatedPaths[language][index][1]}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                    {language === "en" ? goal.description : translatedPaths[language][index][2]}
                  </p>
                </div>
                <ArrowUpRight
                  aria-hidden="true"
                  className="mb-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export const discoveryIntentCards = goalPaths.slice(0, 5);
