import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  MapPin,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { RecommendedMembers } from "@/components/dashboard/recommended-members";
import { ProfileStrength } from "@/components/profile/profile-strength";
import { ConnectionThread } from "@/components/ui/connection-thread";
import {
  rankEventRecommendations,
  rankOpportunityRecommendations,
} from "@/lib/listing-recommendations";
import { rankMemberRecommendations } from "@/lib/member-recommendations";
import { getUtcDateKey } from "@/lib/opportunities";
import { getProfileCompleteness } from "@/lib/profile-completeness";
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
    kicker: "People",
    description: "Find people to learn from, collaborate with, or simply say hello to.",
    href: "/network",
    icon: UsersRound,
  },
  {
    title: "Find opportunities",
    kicker: "Next step",
    description: "Jobs, grants, volunteer roles, and programs.",
    href: "/opportunities",
    icon: BriefcaseBusiness,
  },
  {
    title: "Discover businesses",
    kicker: "Support local",
    description: "Afghan-owned services and businesses.",
    href: "/businesses",
    icon: Building2,
  },
  {
    title: "Community events",
    kicker: "Show up",
    description: "Cultural, social, and professional gatherings.",
    href: "/events",
    icon: CalendarDays,
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const now = new Date().toISOString();
  const today = getUtcDateKey(new Date());
  const [
    { data: profile },
    { data: opportunityCandidates },
    { data: eventCandidates },
    { data: memberCandidates },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "display_name,first_name,last_name,headline,bio,profession,company,city,province_state,country,skills,languages,avatar_url,linkedin_url,website_url",
      )
      .eq("id", user.id)
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
        province_state,
        country,
        is_remote,
        deadline,
        created_at,
        organization:organizations (
          name
        )
      `)
      .eq("status", "published")
      .or(`deadline.is.null,deadline.gte.${today}`)
      .order("created_at", { ascending: false })
      .limit(18),
    supabase
      .from("events")
      .select(`
        id,
        title,
        slug,
        summary,
        starts_at,
        city,
        province_state,
        country,
        venue_name,
        is_online
      `)
      .eq("status", "published")
      .gte("starts_at", now)
      .order("starts_at", { ascending: true })
      .limit(12),
    supabase
      .from("profiles")
      .select(`
        id,
        display_name,
        first_name,
        last_name,
        headline,
        profession,
        company,
        city,
        country,
        avatar_url,
        skills
      `)
      .eq("is_public", true)
      .eq("onboarding_completed", true)
      .neq("id", user.id)
      .order("display_name", { ascending: true })
      .limit(24),
  ]);

  const displayName =
    profile?.display_name ||
    profile?.first_name ||
    user?.email?.split("@")[0] ||
    "Member";

  const location = [profile?.city, profile?.country]
    .filter(Boolean)
    .join(", ");

  const suggestedOpportunities = rankOpportunityRecommendations(
    profile,
    opportunityCandidates ?? [],
  );
  const upcomingEvents = rankEventRecommendations(
    profile,
    eventCandidates ?? [],
  );
  const opportunityCount = suggestedOpportunities.length;
  const eventCount = upcomingEvents.length;
  const profileStrength = getProfileCompleteness(profile);
  const recommendedMembers = rankMemberRecommendations(
    profile,
    memberCandidates ?? [],
  );
  const nextStep = profileStrength.complete
    ? {
        kicker: "Next best step",
        title: "Grow your network",
        href: "/network",
      }
    : {
        kicker: "Next best step",
        title: profileStrength.missing[0]?.label ?? "Complete your profile",
        href: "/profile",
      };

  return (
    <main className="px-4 py-7 md:px-8 md:py-10">
      <div className="mx-auto max-w-7xl space-y-9">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card shadow-[0_20px_60px_rgb(15_23_42/0.06)]">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_80%_8%,color-mix(in_oklab,var(--primary)_13%,transparent),transparent_28%),radial-gradient(circle_at_18%_90%,color-mix(in_oklab,var(--accent)_60%,transparent),transparent_30%)]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.02] [background-image:linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] [background-size:36px_36px]" />
          <ConnectionThread className="pointer-events-none absolute -right-10 top-0 hidden h-56 w-[34rem] text-primary/45 xl:block" />

          <div className="relative grid gap-8 px-6 py-8 md:px-9 md:py-10 xl:grid-cols-[1fr_390px] xl:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/70 px-3 py-1.5 text-xs font-semibold text-primary backdrop-blur">
                <Sparkles aria-hidden="true" className="size-3.5" />
                Your community, connected
              </div>

              <h1 className="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-foreground md:text-5xl">
                Welcome back, {displayName}
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
                See what is moving, meet people relevant to you, and keep your next step close.
              </p>

              {profile?.headline || location ? (
                <div className="mt-5 flex flex-wrap gap-2 text-sm">
                  {profile?.headline ? (
                    <span className="rounded-full border border-border bg-background/85 px-3 py-1.5 text-foreground shadow-sm">
                      {profile.headline}
                    </span>
                  ) : null}

                  {location ? (
                    <span className="rounded-full border border-border bg-background/85 px-3 py-1.5 text-muted-foreground shadow-sm">
                      {location}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2">
              <Link
                href="/opportunities"
                className="group rounded-2xl border border-border/80 bg-background/88 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
                    <BriefcaseBusiness aria-hidden="true" className="size-4.5" />
                  </span>
                  <ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <p className="mt-5 text-2xl font-bold tracking-tight">{opportunityCount}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">relevant opportunities</p>
              </Link>

              <Link
                href="/events"
                className="group rounded-2xl border border-border/80 bg-background/88 p-4 backdrop-blur transition hover:-translate-y-0.5 hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
                    <CalendarDays aria-hidden="true" className="size-4.5" />
                  </span>
                  <ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground group-hover:text-primary" />
                </div>
                <p className="mt-5 text-2xl font-bold tracking-tight">{eventCount}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">events for you</p>
              </Link>

              <Link
                href={nextStep.href}
                className="group col-span-2 flex items-center justify-between gap-4 rounded-2xl bg-primary px-5 py-4 text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/92 sm:col-span-1 xl:col-span-2"
              >
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] opacity-70">{nextStep.kicker}</p>
                  <p className="mt-1 font-semibold">{nextStep.title}</p>
                </div>
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="dashboard-explore-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Start here</p>
              <h2 id="dashboard-explore-heading" className="mt-2 text-2xl font-bold tracking-[-0.025em] text-foreground">
                Move through Afghan Hub
              </h2>
            </div>
          </div>

          <div className="mt-5 grid auto-rows-[170px] gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              const featured = index === 0;

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`group relative overflow-hidden rounded-[1.65rem] border border-border/80 p-5 transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md ${featured ? "bg-foreground text-background md:row-span-2 xl:col-span-2" : "bg-card"}`}
                >
                  <div aria-hidden="true" className={`absolute -right-8 -top-8 size-28 rounded-full border ${featured ? "border-background/10" : "border-primary/10"}`} />
                  <div aria-hidden="true" className={`absolute right-5 top-10 size-12 rounded-full border ${featured ? "border-background/10" : "border-primary/10"}`} />

                  <div className="relative flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <span className={`flex size-11 items-center justify-center rounded-2xl ${featured ? "bg-background/10" : "bg-secondary text-primary"}`}>
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <ArrowUpRight aria-hidden="true" className={`size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${featured ? "opacity-65" : "text-muted-foreground group-hover:text-primary"}`} />
                    </div>

                    <div>
                      <p className={`text-[0.64rem] font-semibold uppercase tracking-[0.18em] ${featured ? "opacity-60" : "text-primary"}`}>{action.kicker}</p>
                      <h3 className={`${featured ? "mt-2 max-w-md text-3xl md:text-4xl" : "mt-1 text-lg"} font-bold leading-tight tracking-[-0.025em]`}>
                        {action.title}
                      </h3>
                      <p className={`${featured ? "mt-3 max-w-md text-sm leading-6 opacity-70" : "mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground"}`}>
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <RecommendedMembers members={recommendedMembers} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-[0_12px_38px_rgb(15_23_42/0.04)] md:p-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Recommended for you</p>
                <h2 className="mt-2 text-xl font-bold tracking-[-0.02em] text-foreground">
                  Suggested opportunities
                </h2>
              </div>

              <Link
                href="/opportunities"
                className="hidden items-center gap-2 text-sm font-semibold text-primary sm:inline-flex"
              >
                View all
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            {suggestedOpportunities.length ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {suggestedOpportunities.map((opportunity, index) => {
                  const organizationName = getOrganizationName(opportunity.organization);
                  const opportunityLocation = opportunity.is_remote
                    ? "Remote"
                    : [opportunity.city, opportunity.country]
                        .filter(Boolean)
                        .join(", ");

                  return (
                    <Link
                      key={opportunity.id}
                      href={`/opportunities/${opportunity.slug}`}
                      className={`group relative overflow-hidden rounded-2xl border border-border bg-background p-5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm ${index === 0 ? "md:col-span-2 2xl:col-span-1" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="rounded-full bg-primary/[0.08] px-2.5 py-1 text-[0.68rem] font-semibold capitalize text-primary">
                          {opportunity.type}
                        </span>
                        <ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground group-hover:text-primary" />
                      </div>

                      <h3 className="mt-5 line-clamp-2 text-lg font-bold leading-snug text-foreground transition group-hover:text-primary">
                        {opportunity.title}
                      </h3>

                      {organizationName ? (
                        <p className="mt-2 text-xs font-medium text-foreground/70">{organizationName}</p>
                      ) : null}

                      {opportunity.summary ? (
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {opportunity.summary}
                        </p>
                      ) : null}

                      {opportunityLocation ? (
                        <p className="mt-5 flex items-center gap-2 border-t border-border/70 pt-4 text-xs text-muted-foreground">
                          <MapPin aria-hidden="true" className="size-3.5 text-primary" />
                          <span className="truncate">{opportunityLocation}</span>
                        </p>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="relative mt-6 overflow-hidden rounded-2xl border border-dashed border-border bg-muted/40 px-5 py-10 text-center">
                <div aria-hidden="true" className="absolute -right-8 -top-8 size-28 rounded-full border border-primary/10" />
                <BriefcaseBusiness aria-hidden="true" className="relative mx-auto size-9 text-muted-foreground" />
                <h3 className="relative mt-3 font-semibold text-foreground">No active opportunities yet</h3>
                <p className="relative mt-2 text-sm text-muted-foreground">
                  New opportunities will appear here when they are published.
                </p>
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <ProfileStrength profile={profile} compact />

            <section className="rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-[0_12px_38px_rgb(15_23_42/0.04)]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">For you</p>
                  <h2 className="mt-1 text-lg font-bold text-foreground">Events</h2>
                </div>
                <span className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <CalendarDays aria-hidden="true" className="size-4.5" />
                </span>
              </div>

              {upcomingEvents.length ? (
                <div className="relative mt-5 space-y-1 before:absolute before:bottom-4 before:left-[5px] before:top-4 before:w-px before:bg-border">
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
                        className="group relative block py-3 pl-7"
                      >
                        <span aria-hidden="true" className="absolute left-0 top-[1.15rem] size-[11px] rounded-full border-2 border-card bg-primary" />
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-primary">
                          {formatEventDate(event.starts_at)}
                        </p>
                        <h3 className="mt-1 line-clamp-2 font-semibold leading-5 text-foreground group-hover:text-primary">{event.title}</h3>
                        {eventLocation ? (
                          <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
                            <MapPin aria-hidden="true" className="mt-0.5 size-3 shrink-0" />
                            <span className="line-clamp-1">{eventLocation}</span>
                          </p>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/35 px-4 py-8 text-center">
                  <CalendarDays aria-hidden="true" className="mx-auto size-8 text-muted-foreground" />
                  <h3 className="mt-3 font-semibold text-foreground">Nothing scheduled yet</h3>
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
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
