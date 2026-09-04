import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  MapPin,
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
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
          <div className="relative px-6 py-10 md:px-10">
            <div className="absolute right-0 top-0 size-72 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
                Community dashboard
              </p>

              <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
                Welcome back, {displayName}
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400 md:text-lg">
                Connect with Afghan professionals, organizations, businesses,
                opportunities, and events in one community platform.
              </p>

              {profile?.headline || location ? (
                <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-300">
                  {profile?.headline ? (
                    <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5">
                      {profile?.headline}
                    </span>
                  ) : null}

                  {location ? (
                    <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5">
                      {location}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-400">
                Get started
              </p>
              <h2 className="mt-1 text-2xl font-bold">Explore Afghan Hub</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-0.5 hover:border-emerald-500/60"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Icon className="size-5" />
                  </div>

                  <h3 className="mt-5 font-bold text-white">{action.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {action.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-emerald-400">
                    Explore
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div>
              <p className="text-sm font-semibold text-emerald-400">
                Recommended for you
              </p>
              <h2 className="mt-1 text-xl font-bold">
                Suggested opportunities
              </h2>
            </div>

            {suggestedOpportunities?.length ? (
              <div className="mt-5 divide-y divide-slate-800">
                {suggestedOpportunities.map((opportunity) => {
                  const organizationName = getOrganizationName(
                    opportunity.organization,
                  );
                  const location = [
                    opportunity.city,
                    opportunity.country,
                  ]
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <Link
                      key={opportunity.id}
                      href={`/opportunities/${opportunity.slug}`}
                      className="group block py-5 first:pt-0 last:pb-0"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-400">
                          {opportunity.type}
                        </span>
                        {organizationName ? (
                          <span className="text-xs text-slate-500">
                            {organizationName}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-3 font-bold text-white transition group-hover:text-emerald-300">
                        {opportunity.title}
                      </h3>

                      {opportunity.summary ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                          {opportunity.summary}
                        </p>
                      ) : null}

                      {location ? (
                        <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                          <MapPin className="size-3.5" />
                          {location}
                        </p>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 px-5 py-10 text-center">
                <BriefcaseBusiness className="mx-auto size-9 text-slate-600" />
                <h3 className="mt-3 font-semibold text-white">
                  No active opportunities yet
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  New opportunities will appear here when they are published.
                </p>
              </div>
            )}

            <Link
              href="/opportunities"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Browse all opportunities
              <ArrowRight className="size-4" />
            </Link>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm font-semibold text-emerald-400">
                Your profile
              </p>
              <h2 className="mt-1 text-xl font-bold">Build your presence</h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Add your headline, skills, languages, website, and LinkedIn
                profile to help others discover you.
              </p>

              <Link
                href="/profile"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Edit profile
                <ArrowRight className="size-4" />
              </Link>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-sm font-semibold text-emerald-400">
                Upcoming events
              </p>

              {upcomingEvents?.length ? (
                <div className="mt-4 space-y-4">
                  {upcomingEvents.map((event) => {
                    const location = event.is_online
                      ? "Online"
                      : [event.venue_name, event.city, event.country]
                          .filter(Boolean)
                          .join(", ");

                    return (
                      <Link
                        key={event.id}
                        href={`/events/${event.slug}`}
                        className="block rounded-xl border border-slate-800 bg-slate-950/50 p-4 transition hover:border-emerald-500/50"
                      >
                        <p className="text-xs font-semibold text-emerald-400">
                          {formatEventDate(event.starts_at)}
                        </p>
                        <h3 className="mt-2 font-semibold text-white">
                          {event.title}
                        </h3>
                        {location ? (
                          <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-slate-500">
                            <MapPin className="mt-0.5 size-3.5 shrink-0" />
                            {location}
                          </p>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 px-4 py-8 text-center">
                  <CalendarDays className="mx-auto size-8 text-slate-600" />
                  <h2 className="mt-3 font-semibold text-white">
                    Nothing scheduled yet
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Upcoming community events will appear here.
                  </p>
                </div>
              )}

              <Link
                href="/events"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
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
