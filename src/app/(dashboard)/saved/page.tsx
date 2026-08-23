import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, MapPin } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

function getOpportunity(
  opportunity:
    | {
        id: string;
        title: string;
        slug: string;
        summary: string | null;
        type: string;
        city: string | null;
        country: string | null;
        deadline: string | null;
      }
    | {
        id: string;
        title: string;
        slug: string;
        summary: string | null;
        type: string;
        city: string | null;
        country: string | null;
        deadline: string | null;
      }[]
    | null,
) {
  return Array.isArray(opportunity)
    ? opportunity[0]
    : opportunity;
}

export default async function SavedOpportunitiesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: savedRows, error } = await supabase
    .from("saved_opportunities")
    .select(`
      created_at,
      opportunity:opportunities (
        id,
        title,
        slug,
        summary,
        type,
        city,
        country,
        deadline
      )
    `)
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  const opportunities = (savedRows ?? [])
    .map((row) => getOpportunity(row.opportunity))
    .filter((opportunity) => opportunity !== null);

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
          Your collection
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          Saved opportunities
        </h1>
        <p className="mt-3 leading-7 text-slate-400">
          Keep useful jobs, scholarships, volunteer roles, and programs in one
          place.
        </p>

        {error ? (
          <div className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            We could not load your saved opportunities. Please try again.
          </div>
        ) : null}

        {!error && opportunities.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {opportunities.map((opportunity) => {
              const location = [opportunity.city, opportunity.country]
                .filter(Boolean)
                .join(", ");

              return (
                <Link
                  key={opportunity.id}
                  href={`/opportunities/${opportunity.slug}`}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-0.5 hover:border-emerald-500/50"
                >
                  <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold capitalize text-emerald-400">
                    {opportunity.type}
                  </span>
                  <h2 className="mt-4 text-xl font-bold text-white">
                    {opportunity.title}
                  </h2>
                  {opportunity.summary ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                      {opportunity.summary}
                    </p>
                  ) : null}
                  {location ? (
                    <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="size-3.5" />
                      {location}
                    </p>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ) : null}

        {!error && opportunities.length === 0 ? (
          <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 text-center">
            <Bookmark className="size-11 text-slate-600" />
            <h2 className="mt-4 text-lg font-bold text-white">
              No saved opportunities yet
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Save opportunities you want to review or apply for later.
            </p>
            <Link
              href="/opportunities"
              className="mt-6 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
            >
              Browse opportunities
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
