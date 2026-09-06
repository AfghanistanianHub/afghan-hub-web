import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  MapPin,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { getUtcDateKey } from "@/lib/opportunities";
import { createClient } from "@/lib/supabase/server";

function getOrganizationName(
  organization: { name: string } | { name: string }[] | null,
) {
  return Array.isArray(organization)
    ? organization[0]?.name
    : organization?.name;
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

const quickActions = [
  {
    title: "Explore members",
    description: "Discover professionals and community members.",
    href: "/network",
    icon: UsersRound,
  },
  {
    title: "Find opportunities",
    description: "Browse jobs, volunteer roles, grants, and programs.",
    href: "/opportunities",
    icon: BriefcaseBusiness,
  },
  {
    title: "Discover businesses",
    description: "Support Afghan-owned businesses and services.",
    href: "/businesses",
    icon: Building2,
  },
  {
    title: "Community events",
    description: "Find upcoming cultural and professional events.",
    href: "/events",
    icon: CalendarDays,
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const now = new Date().toISOString();
  const today = getUtcDateKey(new Date());
  const [
    { data: profile },
    { data: suggestedOpportunities },
    { data: upcomingEvents },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name,first_name,headline,city,country")
      .eq("id", user!.id)
      .single(),
    supabase
      .from("opportunities")
      .select(`
        id,
        title,
        slug,
        summary,
        type,
        city,
        country,
        deadline,
        organization:organizations (
          name
        )
      `)
      .eq("status", "published")
      .or(`deadline.is.null,deadline.gte.${today}`)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("events")
      .select(`
        id,
        title,
        slug,
        starts_at,
        city,
        country,
        venue_name,
        is_online
      `)
      .eq("status", "published")
      .gte("starts_at", now)
      .order("starts_at", { ascending: true })
      .limit(3),
  ]);

  const displayName =
    profile?.display_name ||
    profile?.first_name ||
    user?.email?.split("@")[0] ||
    "Member";

  const location = [profile?.city, profile?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="px-4 py-7 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="surface-panel relative overflow-hidden rounded-[2rem] px-6 py-8 md:px-10 md:py-10">
          <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute right-20 top-14 size-28 rounded-full border border-primary/15" />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" />
                Your community, connected
              </div>

              <h1 className="mt-5 text-3xl font-extrabold tracking-[-0.035em] text-foreground md:text-5xl">
                Welcome back, {displayName}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Discover people, organizations, opportunities, businesses, and events across the Afghan community.
              </p>

              {profile?.headline || location ? (
                <div className="mt-5 flex flex-wrap gap-2 text-sm">
                  {profile?.headline ? (
                    <span className="rounded-full border border-border bg-card px-3 py-1.5 text-foreground shadow-sm">
                      {profile.headline}
                    </span>
                  ) : null}

                  {location ? (
                    <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground shadow-sm">
                      {location}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>

            <Link
              href="/network"
              className="inline-flex w-fit items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Explore the network
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary">Start here</p>
              <h2 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-foreground">
                Explore Afghan Hub
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group surface-panel rounded-[1.5rem] p-5 transition duration-200 hover:-translate-y-1 hover:border-primary/30"
                >
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                    <Icon className="size-5" />
                  </div>

                  <h3 className="mt-5 font-bold text-foreground">{action.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {action.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-primary">
                    Explore
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="surface-panel rounded-[1.75rem] p-6 md:p-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-primary">Recommended for you</p>
                <h2 className="mt-1 text-xl font-bold tracking-[-0.015em] text-foreground">
                  Suggested opportunities
                </h2>
              </div>

              <Link
                href="/opportunities"
                className="hidden items-center gap-2 text-sm font-semibold text-primary sm:inline-flex"
              >
                View all
                <ArrowRight className="size-4" />
              </Link>
            </div>

            {suggestedOpportunities?.length ? (
              <div className="mt-5 divide-y divide-border">
                {suggestedOpportunities.map((opportunity) => {
                  const organizationName = getOrganizationName(opportunity.organization);
                  const opportunityLocation = [opportunity.city, opportunity.country]
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <Link
                      key={opportunity.id}
                      href={`/opportunities/${opportunity.slug}`}
                      className="group block py-5 first:pt-0 last:pb-0"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-primary/8 px-2.5 py-1 text-xs font-semibold capitalize text-primary">
                          {opportunity.type}
                        </span>
                        {organizationName ? (
                          <span className="text-xs text-muted-foreground">
                            {organizationName}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-3 font-bold text-foreground transition group-hover:text-primary">
                        {opportunity.title}
                      </h3>

                      {opportunity.summary ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {opportunity.summary}
                        </p>
                      ) : null}

                      {opportunityLocation ? (
                        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="size-3.5" />
                          {opportunityLocation}
                        </p>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/45 px-5 py-10 text-center">
                <BriefcaseBusiness className="mx-auto size-9 text-muted-foreground" />
                <h3 className="mt-3 font-semibold text-foreground">No active opportunities yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  New opportunities will appear here when they are published.
                </p>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <section className="surface-panel rounded-[1.75rem] p-6">
              <p className="text-sm font-semibold text-primary">Your profile</p>
              <h2 className="mt-1 text-xl font-bold text-foreground">Build your presence</h2>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Add your headline, skills, languages, website, and LinkedIn profile to help others discover you.
              </p>

              <Link
                href="/profile"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                Edit profile
                <ArrowRight className="size-4" />
              </Link>
            </section>

            <section className="surface-panel rounded-[1.75rem] p-6">
              <p className="text-sm font-semibold text-primary">Upcoming events</p>

              {upcomingEvents?.length ? (
                <div className="mt-4 space-y-3">
                  {upcomingEvents.map((event) => {
                    const eventLocation = event.is_online
                      ? "Online"
                      : [event.venue_name, event.city, event.country]
                          .filter(Boolean)
                          .join(", ");

                    return (
                      <Link
                        key={event.id}
                        href={`/events/${event.slug}`}
                        className="block rounded-2xl border border-border bg-card p-4 transition hover:border-primary/30 hover:shadow-sm"
                      >
                        <p className="text-xs font-semibold text-primary">
                          {formatEventDate(event.starts_at)}
                        </p>
                        <h3 className="mt-2 font-semibold text-foreground">{event.title}</h3>
                        {eventLocation ? (
                          <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                            <MapPin className="mt-0.5 size-3.5 shrink-0" />
                            {eventLocation}
                          </p>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/45 px-4 py-8 text-center">
                  <CalendarDays className="mx-auto size-8 text-muted-foreground" />
                  <h2 className="mt-3 font-semibold text-foreground">Nothing scheduled yet</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Upcoming community events will appear here.
                  </p>
                </div>
              )}

              <Link
                href="/events"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                Browse events
                <ArrowRight className="size-4" />
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
