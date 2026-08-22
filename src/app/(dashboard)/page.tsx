import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  UsersRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,first_name,headline,city,country")
    .eq("id", user!.id)
    .single();

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
                Community activity
              </p>
              <h2 className="mt-1 text-xl font-bold">Latest updates</h2>
            </div>

            <div className="mt-10 flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 px-6 text-center">
              <UsersRound className="size-10 text-slate-600" />
              <h3 className="mt-4 font-semibold text-white">
                Community feed coming next
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                New members, organizations, opportunities, and events will
                appear here as the community grows.
              </p>
            </div>
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
              <h2 className="mt-1 text-xl font-bold">Nothing scheduled yet</h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Community events will be displayed here once they are
                published.
              </p>

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
