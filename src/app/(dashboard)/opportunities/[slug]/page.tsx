import {
  toggleSavedOpportunity,
} from "@/app/(dashboard)/opportunities/actions";
import { DeleteOpportunityButton } from "@/components/opportunities/delete-opportunity-button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bookmark, CalendarDays, ExternalLink, MapPin } from "lucide-react";
import {
  formatOpportunityDeadline,
  getUtcDateKey,
  hasOpportunityDeadlinePassed,
} from "@/lib/opportunities";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function OpportunityPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const { error: actionError } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: opportunity, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !opportunity) {
    notFound();
  }

  const { data: viewerProfile } = user
    ? await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const canModerate =
    viewerProfile?.role === "admin" || viewerProfile?.role === "moderator";
  const isOwner = user?.id === opportunity.author_id;

  if (opportunity.status !== "published" && !isOwner && !canModerate) {
    notFound();
  }

  const today = getUtcDateKey(new Date());
  const isExpired = hasOpportunityDeadlinePassed(opportunity.deadline, today);

  const { data: savedOpportunity } = user
    ? await supabase
        .from("saved_opportunities")
        .select("opportunity_id")
        .eq("profile_id", user.id)
        .eq("opportunity_id", opportunity.id)
        .maybeSingle()
    : { data: null };
  const isSaved = Boolean(savedOpportunity);
  const location = [opportunity.city, opportunity.country].filter(Boolean).join(", ");

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
      <Link
        href="/opportunities"
        className="text-sm font-semibold text-primary transition hover:opacity-75"
      >
        ← Back to opportunities
      </Link>

      {actionError ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {actionError}
        </div>
      ) : null}

      {opportunity.status !== "published" ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {opportunity.status === "draft"
            ? "This opportunity is waiting for moderator approval and is not visible to the community yet."
            : `This opportunity was not approved.${
                opportunity.moderation_note
                  ? ` Reason: ${opportunity.moderation_note}`
                  : ""
              } Edit it to submit it for review again.`}
        </div>
      ) : null}

      {opportunity.status === "published" && isExpired ? (
        <div className="mt-6 rounded-2xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
          This opportunity has passed its application deadline and is no longer active.
        </div>
      ) : null}

      <section className="surface-panel mt-6 overflow-hidden rounded-3xl">
        <div className="border-b border-border bg-primary/[0.035] px-6 py-8 md:px-8 md:py-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                {opportunity.type}
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                {opportunity.title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                {opportunity.summary}
              </p>
            </div>

            {user ? (
              <div className="flex shrink-0 flex-wrap justify-end gap-3">
                {opportunity.status === "published" && !isExpired ? (
                  <form action={toggleSavedOpportunity}>
                    <input type="hidden" name="opportunity_id" value={opportunity.id} />
                    <input type="hidden" name="opportunity_slug" value={opportunity.slug} />
                    <button
                      type="submit"
                      aria-pressed={isSaved}
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                        isSaved
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      <Bookmark className="size-4" fill={isSaved ? "currentColor" : "none"} />
                      {isSaved ? "Saved" : "Save"}
                    </button>
                  </form>
                ) : null}

                {isOwner ? (
                  <>
                    <Link
                      href={`/opportunities/${opportunity.slug}/edit`}
                      className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold transition hover:bg-muted"
                    >
                      Edit
                    </Link>
                    <DeleteOpportunityButton slug={opportunity.slug} />
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="min-w-0">
            <div className="whitespace-pre-wrap leading-8 text-foreground/90">
              {opportunity.description}
            </div>
          </article>

          <aside className="h-fit rounded-2xl border border-border bg-muted/30 p-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Opportunity details
            </h2>
            <div className="mt-5 space-y-4 text-sm">
              {location ? (
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Location</p>
                    <p className="mt-1 text-muted-foreground">{location}</p>
                  </div>
                </div>
              ) : null}

              {opportunity.deadline ? (
                <div className="flex gap-3">
                  <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Deadline</p>
                    <p className="mt-1 text-muted-foreground">
                      {formatOpportunityDeadline(opportunity.deadline)}
                    </p>
                  </div>
                </div>
              ) : null}

              {opportunity.contact_email ? (
                <div>
                  <p className="font-semibold text-foreground">Contact</p>
                  <a
                    href={`mailto:${opportunity.contact_email}`}
                    className="mt-1 block break-words text-primary hover:underline"
                  >
                    {opportunity.contact_email}
                  </a>
                </div>
              ) : null}
            </div>

            {opportunity.external_url && !isExpired ? (
              <a
                href={opportunity.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
              >
                Apply now
                <ExternalLink className="size-4" />
              </a>
            ) : null}

            {opportunity.external_url && isExpired ? (
              <p className="mt-6 rounded-xl bg-muted px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Applications closed
              </p>
            ) : null}
          </aside>
        </div>
      </section>
    </main>
  );
}
