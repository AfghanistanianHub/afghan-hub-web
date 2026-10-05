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
                <span aria-hidden="true" className="text-[0.62rem] font-semibold tracking-[0.16em] text-muted-foreground/60">
                  {goal.number}
                </span>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-primary">
                    {goal.label}
                  </p>
                  <h3 className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-foreground">
                    {goal.title}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                    {goal.description}
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
