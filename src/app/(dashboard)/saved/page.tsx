import Link from "next/link";
import styles from "@/components/network/network-surfaces.module.css";
import { CommunitySignature } from "@/components/public/community-signature";
import { redirect } from "next/navigation";
import { ArrowUpRight, Bookmark, MapPin, Sparkles } from "lucide-react";

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

  const savedCount = savedRows?.length ?? 0;

  const opportunities = (savedRows ?? [])
    .map((row) => getOpportunity(row.opportunity))
    .filter(
      (
        opportunity,
      ): opportunity is NonNullable<ReturnType<typeof getOpportunity>> =>
        opportunity !== null &&
        opportunity.status ==="published" &&
        !hasOpportunityDeadlinePassed(opportunity.deadline, today),
    );

  return (
    <main className="px-4 py-8 sm:px-6 md:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-5xl">
        <section className={`${styles.surface} relative overflow-hidden rounded-[var(--radius)] border border-border/80 bg-card px-6 py-8  md:px-8 md:py-10`}>
          
          
          <CommunitySignature className={styles.signature} />
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles aria-hidden="true" className="size-3.5" />
              Your collection
            </div>
            <h1 className="mt-5 text-3xl font-medium tracking-[-0.035em] text-foreground md:text-4xl">
              Saved opportunities
            </h1>
            <p className="mt-3 leading-7 text-muted-foreground">
              Keep useful jobs, scholarships, volunteer roles, and programs in one
              place.
            </p>
          </div>
        </section>

        {error ? (
          <div role="alert" aria-live="assertive" className="relative mt-8 overflow-hidden rounded-[var(--radius)] border border-destructive/25 bg-destructive/[0.06] p-4 text-sm text-destructive"><span className="relative">
            We could not load your saved opportunities. Please try again.</span>
          </div>
        ) : null}

        {!error && opportunities.length> 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {opportunities.map((opportunity) => {
              const location = [opportunity.city, opportunity.country]
                .filter(Boolean)
                .join(",");

              return (
                <Link
                  key={opportunity.id}
                  href={`/opportunities/${opportunity.slug}`}
                  className={`${styles.surface} ${styles.profile} group relative overflow-hidden rounded-[var(--radius)] border border-border/80 bg-card p-6  transition  hover:border-primary/35  focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}
>
                  
                  <span className="relative rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary">
                    {opportunity.type}
                  </span>
                  <div className="relative mt-4 flex items-start justify-between gap-4">
                    <h2 className="break-words text-xl font-bold text-card-foreground transition group-hover:text-primary">
                      {opportunity.title}
                    </h2>
                    <ArrowUpRight data-profile-arrow aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground" />
                  </div>
                  {opportunity.summary ? (
                    <p className="relative mt-3 line-clamp-3 break-words text-sm leading-6 text-muted-foreground">
                      {opportunity.summary}
                    </p>
                  ) : null}
                  {location ? (
                    <p className="relative mt-4 flex items-start gap-2 border-t border-border/70 pt-4 text-xs leading-5 text-muted-foreground">
                      <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                      <span className="min-w-0 break-words">{location}</span>
                    </p>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ) : null}

        {!error && opportunities.length === 0 ? (
          <div className={`${styles.surface} relative mt-8 flex min-h-72 flex-col items-center justify-center overflow-hidden rounded-[var(--radius)] border border-dashed border-border/80 bg-card/70 px-6 text-center`}>
            <div className="relative flex size-14 items-center justify-center rounded-[var(--radius)] bg-secondary text-primary">
              <Bookmark aria-hidden="true" className="size-7" />
            </div>
            <h2 className="relative mt-4 text-lg font-bold text-foreground">
              {savedCount > 0
                ? "No saved opportunities are currently available"
                : "No saved opportunities yet"}
            </h2>
            <p className="relative mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {savedCount > 0
                ? "Some opportunities you saved may have expired or are no longer published. Browse current opportunities to find something new."
                : "Save opportunities you want to review or apply for later."}
            </p>
            <Link
              href="/opportunities"
              className={`${styles.control} inline-flex items-center relative mt-6 rounded-[var(--radius)] bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition  hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}
>
              Browse opportunities
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
