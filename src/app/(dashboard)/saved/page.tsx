import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, MapPin } from "lucide-react";

import {
  getUtcDateKey,
  hasOpportunityDeadlinePassed,
} from "@/lib/opportunities";
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
        status: string;
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
        status: string;
      }[]
    | null,
) {
  return Array.isArray(opportunity) ? opportunity[0] : opportunity;
}

export default async function SavedOpportunitiesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const today = getUtcDateKey(new Date());

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
        deadline,
        status
      )
    `)
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  const opportunities = (savedRows ?? [])
    .map((row) => getOpportunity(row.opportunity))
    .filter(
      (
        opportunity,
      ): opportunity is NonNullable<ReturnType<typeof getOpportunity>> =>
        opportunity !== null &&
        opportunity.status === "published" &&
        !hasOpportunityDeadlinePassed(opportunity.deadline, today),
    );

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="surface-panel relative overflow-hidden rounded-[2rem] border border-border/70 px-6 py-8 md:px-8">
          <div className="absolute -right-16 -top-16 size-52 rounded-full border border-primary/15" />
          <div className="absolute -right-4 top-10 size-28 rounded-full border border-primary/10" />
          <div className="relative max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Your collection
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Saved opportunities
            </h1>
            <p className="mt-3 leading-7 text-muted-foreground">
              Keep useful jobs, scholarships, volunteer roles, and programs in one
              place.
            </p>
          </div>
        </section>

        {error ? (
          <div className="mt-8 rounded-2xl border border-destructive/25 bg-destructive/8 p-4 text-sm text-destructive">
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
                  className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"
                >
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary">
                    {opportunity.type}
                  </span>
                  <h2 className="mt-4 text-xl font-bold text-card-foreground transition group-hover:text-primary">
                    {opportunity.title}
                  </h2>
                  {opportunity.summary ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {opportunity.summary}
                    </p>
                  ) : null}
                  {location ? (
                    <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
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
          <div className="mt-8 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/70 px-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Bookmark className="size-7" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-foreground">
              No saved opportunities yet
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Save opportunities you want to review or apply for later.
            </p>
            <Link
              href="/opportunities"
              className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
            >
              Browse opportunities
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
