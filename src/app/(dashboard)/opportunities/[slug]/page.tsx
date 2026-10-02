import { ContextualAssistantPrompt } from "@/components/assistant/contextual-assistant-prompt";
import { MemberListingArtwork } from "@/components/public/member-listing-artwork";
import {
  toggleSavedOpportunity,
} from "@/app/(dashboard)/opportunities/actions";
import { DeleteOpportunityButton } from "@/components/opportunities/delete-opportunity-button";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  MapPin,
  Sparkles,
} from "lucide-react";
import { rankRelatedOpportunities } from "@/lib/listing-recommendations";
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

  const [{ data: savedOpportunity }, { data: relatedCandidates }] = await Promise.all([
    user
      ? supabase
          .from("saved_opportunities")
          .select("opportunity_id")
          .eq("profile_id", user.id)
          .eq("opportunity_id", opportunity.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    opportunity.status === "published"
      ? supabase
          .from("opportunities")
          .select(
            "id,title,slug,summary,type,city,province_state,country,is_remote,created_at,deadline",
          )
          .eq("status", "published")
          .neq("id", opportunity.id)
          .or(`deadline.is.null,deadline.gte.${today}`)
          .order("created_at", { ascending: false })
          .limit(12)
      : Promise.resolve({ data: [] }),
  ]);

  const isSaved = Boolean(savedOpportunity);
  const location = [opportunity.city, opportunity.country].filter(Boolean).join(", ");
  const relatedOpportunities = rankRelatedOpportunities(
    opportunity,
    relatedCandidates ?? [],
    3,
  );

  return (
    <main data-illustration-focus-scope className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <Link
        href="/opportunities"
        className="inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-primary transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to opportunities
      </Link>

      <div className="mt-6 space-y-4">
        {actionError ? (
          <div role="alert" aria-live="assertive" className="rounded-2xl border border-destructive/20 bg-destructive/[0.06] p-4 text-sm text-destructive">
            {actionError}
          </div>
        ) : null}

        {opportunity.status !== "published" ? (
          <div role="status" aria-live="polite" className="rounded-2xl border border-accent/50 bg-accent/35 p-4 text-sm leading-6 text-accent-foreground">
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
          <div role="status" aria-live="polite" className="rounded-2xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
            This opportunity has passed its application deadline and is no longer active.
          </div>
        ) : null}
      </div>

      <section data-illustration-trigger className="relative mt-6 overflow-hidden rounded-sm border border-border bg-card">
      <MemberListingArtwork kind="opportunities" />
      <div className="relative px-6 py-8 md:px-9 md:py-11">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  <BriefcaseBusiness aria-hidden="true" className="size-3.5" />
                  {opportunity.type}
                </span>
                {!isExpired && opportunity.status === "published" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-background/75 px-3 py-1.5 text-xs font-medium text-primary backdrop-blur">
                    <Sparkles aria-hidden="true" className="size-3" /> Active
                  </span>
                ) : null}
              </div>

              <h1 className="mt-5 break-words text-3xl font-medium leading-[1.08] tracking-[-0.035em] text-foreground md:text-4xl">
                {opportunity.title}
              </h1>
              {opportunity.summary ? (
                <p className="mt-5 max-w-2xl break-words text-lg leading-8 text-muted-foreground">
                  {opportunity.summary}
                </p>
              ) : null}

              <div className="mt-7 flex flex-wrap gap-3 text-sm">
                {location ? (
                  <span className="inline-flex min-w-0 items-start gap-2 rounded-xl border border-border bg-background/85 px-3.5 py-2 text-muted-foreground shadow-sm">
                    <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="min-w-0 break-words">{location}</span>
                  </span>
                ) : null}
                {opportunity.deadline ? (
                  <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/85 px-3.5 py-2 text-muted-foreground shadow-sm">
                    <CalendarDays aria-hidden="true" className="size-4 text-primary" />
                    {isExpired ? "Closed " : "Apply by "}{formatOpportunityDeadline(opportunity.deadline)}
                  </span>
                ) : null}
              </div>
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
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${
                        isSaved
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border bg-background/85 text-foreground hover:bg-muted"
                      }`}
                    >
                      <Bookmark aria-hidden="true" className="size-4" fill={isSaved ? "currentColor" : "none"} />
                      {isSaved ? "Saved" : "Save"}
                    </button>
                  </form>
                ) : null}

                {isOwner ? (
                  <>
                    <Link
                      href={`/opportunities/${opportunity.slug}/edit`}
                      className="rounded-xl border border-border bg-background/85 px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
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

        <div className="relative grid border-t border-border/70 lg:grid-cols-[minmax(0,1fr)_330px]">
          <article className="min-w-0 px-6 py-8 md:px-9 md:py-10 lg:border-r lg:border-border/70">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">About this opportunity</p>
            <div className="mt-5 whitespace-pre-wrap break-words text-[1.02rem] leading-8 text-foreground/88">
              {opportunity.description}
            </div>
          </article>

          <aside className="h-fit bg-muted/25 px-6 py-8 md:px-8 lg:sticky lg:top-20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Take the next step</p>

            {opportunity.status === "published" ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <ContextualAssistantPrompt
                  label="Find similar opportunities"
                  query={`Find opportunities similar to ${opportunity.title}`}
                />
                <ContextualAssistantPrompt
                  label="Find people in this field"
                  query={`Find professionals related to ${opportunity.title}`}
                />
              </div>
            ) : null}

            {opportunity.external_url && !isExpired ? (
              <a
                href={opportunity.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Apply now
                <ExternalLink aria-hidden="true" className="size-4" />
              </a>
            ) : null}

            {opportunity.external_url && isExpired ? (
              <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                Applications closed
              </p>
            ) : null}

            <div className="mt-7 space-y-5 border-t border-border/70 pt-6 text-sm">
              {location ? (
                <div className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                    <MapPin aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">Location</p>
                    <p className="mt-1 break-words text-muted-foreground">{location}</p>
                  </div>
                </div>
              ) : null}

              {opportunity.deadline ? (
                <div className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                    <CalendarDays aria-hidden="true" className="size-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">Deadline</p>
                    <p className="mt-1 text-muted-foreground">
                      {formatOpportunityDeadline(opportunity.deadline)}
                    </p>
                  </div>
                </div>
              ) : null}

              {opportunity.contact_email ? (
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Contact</p>
                  <a
                    href={`mailto:${opportunity.contact_email}`}
                    className="mt-2 block break-words rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    {opportunity.contact_email}
                  </a>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </section>

      {relatedOpportunities.length ? (
        <section className="mt-10" aria-labelledby="related-opportunities-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Keep exploring</p>
              <h2 id="related-opportunities-heading" className="mt-2 text-2xl font-bold tracking-[-0.025em] text-foreground">
                Related opportunities
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Similar active opportunities based on type, topic, and location.
              </p>
            </div>
            <Link href="/opportunities" className="hidden items-center gap-2 rounded-sm text-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:inline-flex">
              View all
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {relatedOpportunities.map((related) => {
              const relatedLocation = related.is_remote
                ? "Remote"
                : [related.city, related.country].filter(Boolean).join(", ");

              return (
                <Link
                  key={related.id}
                  href={`/opportunities/${related.slug}`}
                  className="group rounded-[1.5rem] border border-border/80 bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-primary/[0.08] px-2.5 py-1 text-[0.68rem] font-semibold capitalize text-primary">
                      {related.type}
                    </span>
                    <ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground transition group-hover:text-primary" />
                  </div>
                  <h3 className="mt-4 line-clamp-2 text-lg font-bold leading-snug text-foreground group-hover:text-primary">
                    {related.title}
                  </h3>
                  {related.summary ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {related.summary}
                    </p>
                  ) : null}
                  <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {relatedLocation ? (
                      <span className="inline-flex min-w-0 items-start gap-1.5">
                        <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        <span className="min-w-0 break-words">{relatedLocation}</span>
                      </span>
                    ) : null}
                    {related.deadline ? (
                      <span>Apply by {formatOpportunityDeadline(related.deadline)}</span>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </main>
  );
}
