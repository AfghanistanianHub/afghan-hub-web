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
  return (
    <section aria-labelledby="goal-paths-heading">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Choose your path
          </p>
          <h2
            id="goal-paths-heading"
            className="mt-2 max-w-2xl text-2xl font-bold tracking-[-0.03em] text-foreground md:text-3xl"
          >
            What do you need today?
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Start with your goal. Afghan Hub will take you to the people, services,
            opportunities, and community resources that fit it.
          </p>
        </div>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 self-start text-sm font-semibold text-primary transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Explore everything
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {goalPaths.map((goal, index) => {
          const Icon = goal.icon;
          const featured = index === 0 || index === 1;

          return (
            <Link
              key={goal.href}
              href={goal.href}
              className={`group relative min-h-48 overflow-hidden rounded-[1.75rem] border border-border/80 p-5 transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_42px_rgb(15_23_42/0.06)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${
                featured ? "bg-card" : "bg-card/75"
              }`}
            >
              <div
                aria-hidden="true"
                className="absolute -right-10 -top-10 size-32 rounded-full border border-primary/10 transition-transform duration-300 group-hover:scale-110"
              />
              <div
                aria-hidden="true"
                className="absolute right-8 top-8 size-16 rounded-full border border-dashed border-primary/10"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-primary/[0.035] to-transparent"
              />

              <div className="relative flex h-full flex-col justify-between gap-8">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-12 items-center justify-center rounded-2xl border border-primary/10 bg-primary/[0.07] text-primary shadow-sm">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <span aria-hidden="true" className="text-3xl font-black tracking-[-0.06em] text-foreground/[0.07]">
                    {goal.number}
                  </span>
                </div>

                <div>
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">
                    {goal.label}
                  </p>
                  <div className="mt-1.5 flex items-end justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold tracking-[-0.025em] text-foreground">
                        {goal.title}
                      </h3>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                        {goal.description}
                      </p>
                    </div>
                    <span className="mb-1 flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition group-hover:border-primary/20 group-hover:text-primary">
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export const discoveryIntentCards = goalPaths.slice(0, 5);
