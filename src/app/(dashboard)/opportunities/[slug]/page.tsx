import { PendingSubmitButton } from "@/components/forms/pending-submit-button";
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
import { B, BDate, BDatePhrase } from "@/components/i18n/browse";
import {
  opportunityActionErrorKey,
  opportunityTypeKey,
} from "@/lib/i18n/browse-copy";
import { rankRelatedOpportunities } from "@/lib/listing-recommendations";
import {
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
    .select("author_id,business_id,city,contact_email,country,created_at,deadline,description,external_url,id,is_remote,organization_id,province_state,slug,status,summary,title,type,updated_at")
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
  const { data: ownerModerationNote } = user?.id === opportunity.author_id && opportunity.status !== "published"
    ? await supabase.rpc("get_owned_listing_moderation_note", { target_entity_type: "opportunity", target_entity_id: opportunity.id })
    : { data: null };


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
  const typeKey = opportunityTypeKey(opportunity.type);

  return (
    <main data-illustration-focus-scope className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <Link
        href="/opportunities"
        className="inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-primary transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
        <B k="detail.backToOpportunities" />
      </Link>

      <div className="mt-6 space-y-4">
        {actionError ? (
          <div role="alert" aria-live="assertive" className="rounded-[var(--radius)] border border-destructive/20 bg-destructive/[0.06] p-4 text-sm text-destructive">
            <B k={opportunityActionErrorKey(actionError)} />
          </div>
        ) : null}

        {opportunity.status !== "published" ? (
          <div role="status" aria-live="polite" className="rounded-[var(--radius)] border border-accent/50 bg-accent/35 p-4 text-sm leading-6 text-accent-foreground">
            {opportunity.status === "draft" ? (
              <B k="opportunityDetail.draft" />
            ) : ownerModerationNote ? (
              <B k="opportunityDetail.rejectedReason" values={{ reason: ownerModerationNote }} />
            ) : (
              <B k="opportunityDetail.rejected" />
            )}
          </div>
        ) : null}

        {opportunity.status === "published" && isExpired ? (
          <div role="status" aria-live="polite" className="rounded-[var(--radius)] border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
            <B k="opportunityDetail.expired" />
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
                  {typeKey ? <B k={typeKey} /> : opportunity.type}
                </span>
                {!isExpired && opportunity.status === "published" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-background px-3 py-1.5 text-xs font-medium text-primary">
                    <Sparkles aria-hidden="true" className="size-3" /> <B k="opportunityDetail.active" />
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
                  <span className="inline-flex min-w-0 items-start gap-2 rounded-[var(--radius-control)] border border-border bg-background/85 px-3.5 py-2 text-muted-foreground shadow-sm">
                    <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="min-w-0 break-words">{location}</span>
                  </span>
                ) : null}
                {opportunity.deadline ? (
                  <span className="inline-flex items-center gap-2 rounded-[var(--radius-control)] border border-border bg-background/85 px-3.5 py-2 text-muted-foreground shadow-sm">
                    <CalendarDays aria-hidden="true" className="size-4 text-primary" />
                    <BDatePhrase k={isExpired ? "opportunityDetail.closedOn" : "opportunityDetail.applyBy"} date={opportunity.deadline} mode="shortDate" />
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
                    <PendingSubmitButton
                      pendingLabel={<B k={isSaved ? "opportunityDetail.removing" : "opportunityDetail.saving"} />}
                      aria-pressed={isSaved}
                      className={`inline-flex min-h-11 min-w-28 items-center gap-2 rounded-[var(--radius)] border px-4 py-2.5 text-sm font-semibold transition-colors motion-reduce:transition-none active:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${
                        isSaved
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border bg-background/85 text-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2"><Bookmark aria-hidden="true" className="size-4" fill={isSaved ? "currentColor" : "none"} />
                      <B k={isSaved ? "opportunityDetail.saved" : "opportunityDetail.save"} /></span>
                    </PendingSubmitButton>
                  </form>
                ) : null}

                {isOwner ? (
                  <>
                    <Link
                      href={`/opportunities/${opportunity.slug}/edit`}
                      className="rounded-[var(--radius-control)] border border-border bg-background/85 px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                    >
                      <B k="common.edit" />
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
            <B k="opportunityDetail.about" className="text-xs font-semibold uppercase tracking-[0.18em] text-primary" />
            <div className="mt-5 whitespace-pre-wrap break-words text-[1.02rem] leading-8 text-foreground/88">
              {opportunity.description}
            </div>
          </article>

          <aside className="h-fit bg-muted/25 px-6 py-8 md:px-8 lg:sticky lg:top-20">
            <B k="detail.takeNextStep" className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground" />

            {opportunity.status === "published" ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <ContextualAssistantPrompt
                  label={<B k="opportunityDetail.findSimilar" />}
                  query={`Find opportunities similar to ${opportunity.title}`}
                />
                <ContextualAssistantPrompt
                  label={<B k="opportunityDetail.findPeople" />}
                  query={`Find professionals related to ${opportunity.title}`}
                />
              </div>
            ) : null}

            {opportunity.external_url && !isExpired ? (
              <a
                href={opportunity.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <B k="opportunityDetail.applyNow" />
                <ExternalLink aria-hidden="true" className="size-4" />
              </a>
            ) : null}

            {opportunity.external_url && isExpired ? (
              <p className="mt-4 rounded-[var(--radius-control)] bg-muted px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                <B k="opportunityDetail.applicationsClosed" />
              </p>
            ) : null}

            <div className="mt-7 space-y-5 border-t border-border/70 pt-6 text-sm">
              {location ? (
                <div className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-secondary text-primary">
                    <MapPin aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground"><B k="common.location" /></p>
                    <p className="mt-1 break-words text-muted-foreground">{location}</p>
                  </div>
                </div>
              ) : null}

              {opportunity.deadline ? (
                <div className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-secondary text-primary">
                    <CalendarDays aria-hidden="true" className="size-4" />
                  </span>
                  <div>
                    <p className="font-semibold text-foreground"><B k="opportunities.deadlineLabel" /></p>
                    <p className="mt-1 text-muted-foreground">
                      <BDate value={opportunity.deadline} mode="shortDate" />
                    </p>
                  </div>
                </div>
              ) : null}

              {opportunity.contact_email ? (
                <div className="rounded-[var(--radius)] border border-border bg-background p-4">
                  <B k="opportunityDetail.contact" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground" />
                  <a
                    href={`mailto:${opportunity.contact_email}`}
                    dir="ltr"
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
              <B k="common.keepExploring" className="text-xs font-semibold uppercase tracking-[0.18em] text-primary" />
              <h2 id="related-opportunities-heading" className="mt-2 text-2xl font-bold tracking-[-0.025em] text-foreground">
                <B k="opportunityDetail.related" />
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                <B k="opportunityDetail.relatedBody" />
              </p>
            </div>
            <Link href="/opportunities" className="hidden items-center gap-2 rounded-sm text-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:inline-flex">
              <B k="common.viewAll" />
              <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {relatedOpportunities.map((related) => {
              const relatedTypeKey = opportunityTypeKey(related.type);
              const relatedLocation = [related.city, related.country]
                .filter(Boolean)
                .join(", ");

              return (
                <Link
                  key={related.id}
                  href={`/opportunities/${related.slug}`}
                  className="group rounded-[var(--radius)] border border-border/80 bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-primary/[0.08] px-2.5 py-1 text-[0.68rem] font-semibold capitalize text-primary">
                      {relatedTypeKey ? <B k={relatedTypeKey} /> : related.type}
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
                    {related.is_remote || relatedLocation ? (
                      <span className="inline-flex min-w-0 items-start gap-1.5">
                        <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        <span className="min-w-0 break-words">{related.is_remote ? <B k="common.remote" /> : relatedLocation}</span>
                      </span>
                    ) : null}
                    {related.deadline ? (
                      <BDatePhrase k="opportunityDetail.applyBy" date={related.deadline} mode="shortDate" />
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
