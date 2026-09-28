import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CircleCheck,
  CircleX,
  Clock3,
  UsersRound,
  X,
} from "lucide-react";

import { moderateContent } from "@/app/(dashboard)/moderation/actions";
import { PendingSubmitButton } from "@/components/forms/pending-submit-button";
import { getMyAccessContext } from "@/lib/profile-access";
import { createClient } from "@/lib/supabase/server";

type ModerationEntityType =
  | "opportunity"
  | "event"
  | "business"
  | "organization";

type ModerationPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
    view?: string;
  }>;
};

type HistoryItem = {
  id: string;
  entityType: ModerationEntityType;
  title: string;
  slug: string;
  status: string;
  moderationNote: string | null;
  moderatedAt: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function isApproved(item: HistoryItem) {
  return item.status === "published";
}

function getEntityHref(entityType: ModerationEntityType, slug: string) {
  if (entityType === "opportunity") return `/opportunities/${slug}`;
  if (entityType === "event") return `/events/${slug}`;
  if (entityType === "business") return `/businesses/${slug}`;
  return `/organizations/${slug}`;
}

function getEntityLabel(entityType: ModerationEntityType) {
  if (entityType === "opportunity") return "Opportunity";
  if (entityType === "event") return "Event";
  if (entityType === "business") return "Business";
  return "Organization";
}

export default async function ModerationPage({
  searchParams,
}: ModerationPageProps) {
  const { error, success, view } = await searchParams;
  const activeView = view === "history" ? "history" : "pending";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: accessContext } = await getMyAccessContext(supabase, user.id);

  if (
    accessContext?.role !== "admin" &&
    accessContext?.role !== "moderator"
  ) {
    redirect("/");
  }

  const [
    { data: opportunities },
    { data: events },
    { data: businesses },
    { data: organizations },
    { data: moderatedOpportunities },
    { data: moderatedEvents },
    { data: moderatedBusinesses },
    { data: moderatedOrganizations },
  ] = await Promise.all([
    supabase
      .from("opportunities")
      .select("id,title,slug,summary,type,created_at")
      .eq("status", "draft")
      .order("created_at", { ascending: true }),
    supabase
      .from("events")
      .select("id,title,slug,summary,starts_at,created_at")
      .eq("status", "draft")
      .order("created_at", { ascending: true }),
    supabase
      .from("businesses")
      .select("id,name,slug,short_description,category,created_at")
      .eq("status", "draft")
      .order("created_at", { ascending: true }),
    supabase
      .from("organizations")
      .select("id,name,slug,short_description,organization_type,created_at")
      .eq("status", "draft")
      .order("created_at", { ascending: true }),
    supabase
      .from("opportunities")
      .select("id,title,slug,status,moderation_note,moderated_at")
      .not("moderated_at", "is", null)
      .order("moderated_at", { ascending: false })
      .limit(20),
    supabase
      .from("events")
      .select("id,title,slug,status,moderation_note,moderated_at")
      .not("moderated_at", "is", null)
      .order("moderated_at", { ascending: false })
      .limit(20),
    supabase
      .from("businesses")
      .select("id,name,slug,status,moderation_note,moderated_at")
      .not("moderated_at", "is", null)
      .order("moderated_at", { ascending: false })
      .limit(20),
    supabase
      .from("organizations")
      .select("id,name,slug,status,moderation_note,moderated_at")
      .not("moderated_at", "is", null)
      .order("moderated_at", { ascending: false })
      .limit(20),
  ]);

  const pendingCount =
    (opportunities?.length ?? 0) +
    (events?.length ?? 0) +
    (businesses?.length ?? 0) +
    (organizations?.length ?? 0);

  const history: HistoryItem[] = [
    ...(moderatedOpportunities ?? [])
      .filter(
        (item): item is typeof item & { moderated_at: string } =>
          Boolean(item.moderated_at),
      )
      .map((item) => ({
        id: item.id,
        entityType: "opportunity" as const,
        title: item.title,
        slug: item.slug,
        status: item.status,
        moderationNote: item.moderation_note,
        moderatedAt: item.moderated_at,
      })),
    ...(moderatedEvents ?? [])
      .filter(
        (item): item is typeof item & { moderated_at: string } =>
          Boolean(item.moderated_at),
      )
      .map((item) => ({
        id: item.id,
        entityType: "event" as const,
        title: item.title,
        slug: item.slug,
        status: item.status,
        moderationNote: item.moderation_note,
        moderatedAt: item.moderated_at,
      })),
    ...(moderatedBusinesses ?? [])
      .filter(
        (item): item is typeof item & { moderated_at: string } =>
          Boolean(item.moderated_at),
      )
      .map((item) => ({
        id: item.id,
        entityType: "business" as const,
        title: item.name,
        slug: item.slug,
        status: item.status,
        moderationNote: item.moderation_note,
        moderatedAt: item.moderated_at,
      })),
    ...(moderatedOrganizations ?? [])
      .filter(
        (item): item is typeof item & { moderated_at: string } =>
          Boolean(item.moderated_at),
      )
      .map((item) => ({
        id: item.id,
        entityType: "organization" as const,
        title: item.name,
        slug: item.slug,
        status: item.status,
        moderationNote: item.moderation_note,
        moderatedAt: item.moderated_at,
      })),
  ]
    .sort(
      (a, b) =>
        new Date(b.moderatedAt).getTime() -
        new Date(a.moderatedAt).getTime(),
    )
    .slice(0, 40);

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card px-6 py-8 shadow-[0_18px_55px_rgb(15_23_42/0.045)] md:px-8 md:py-10">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary/[0.07] blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-accent/45 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Admin tools</p>
              <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-foreground md:text-5xl">Content moderation</h1>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                Review opportunities, events, businesses, and organizations before they become visible to the community.
              </p>
            </div>
            {accessContext.role === "admin" ? (
              <Link
                href="/moderation/team"
                className="inline-flex w-fit rounded-2xl border border-border/80 bg-background/80 px-4 py-2.5 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Manage moderation team
              </Link>
            ) : null}
          </div>
        </section>

        {error ? (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-6 rounded-xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary"
          >
            The submission was {success}.
          </div>
        ) : null}

        <div className="mt-8 grid w-full grid-cols-2 rounded-2xl border border-border bg-muted/50 p-1 sm:inline-grid sm:w-auto">
          <Link
            href="/moderation"
            className={`min-w-0 rounded-xl px-3 py-2 text-center text-sm font-semibold transition sm:px-4 ${
              activeView === "pending"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pending review
            {pendingCount > 0 ? (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {pendingCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/moderation?view=history"
            className={`min-w-0 rounded-xl px-3 py-2 text-center text-sm font-semibold transition sm:px-4 ${
              activeView === "history"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Recent decisions
          </Link>
        </div>

        {activeView === "pending" ? (
          <>
            <div className="mt-8 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Pending review</h2>
              <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                {pendingCount}
              </span>
            </div>

            {pendingCount > 0 ? (
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                {opportunities?.map((opportunity) => (
                  <ModerationCard
                    key={`opportunity-${opportunity.id}`}
                    entityId={opportunity.id}
                    entityType="opportunity"
                    href={`/opportunities/${opportunity.slug}`}
                    label={`Opportunity · ${opportunity.type}`}
                    title={opportunity.title}
                    summary={opportunity.summary}
                    meta={`Submitted ${formatDate(opportunity.created_at)}`}
                  />
                ))}
                {events?.map((event) => (
                  <ModerationCard
                    key={`event-${event.id}`}
                    entityId={event.id}
                    entityType="event"
                    href={`/events/${event.slug}`}
                    label="Event"
                    title={event.title}
                    summary={event.summary}
                    meta={`Starts ${formatDate(event.starts_at)}`}
                  />
                ))}
                {businesses?.map((business) => (
                  <ModerationCard
                    key={`business-${business.id}`}
                    entityId={business.id}
                    entityType="business"
                    href={`/businesses/${business.slug}`}
                    label={`Business · ${business.category}`}
                    title={business.name}
                    summary={business.short_description}
                    meta={`Submitted ${formatDate(business.created_at)}`}
                  />
                ))}
                {organizations?.map((organization) => (
                  <ModerationCard
                    key={`organization-${organization.id}`}
                    entityId={organization.id}
                    entityType="organization"
                    href={`/organizations/${organization.slug}`}
                    label={
                      organization.organization_type
                        ? `Organization · ${organization.organization_type}`
                        : "Organization"
                    }
                    title={organization.name}
                    summary={organization.short_description}
                    meta={`Submitted ${formatDate(organization.created_at)}`}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-3xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
                There is nothing waiting for review.
              </div>
            )}
          </>
        ) : (
          <section className="mt-8">
            <div>
              <h2 className="text-xl font-bold text-foreground">Recent decisions</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                The latest approved and rejected submissions across all moderated content.
              </p>
            </div>

            {history.length > 0 ? (
              <div className="mt-5 space-y-4">
                {history.map((item) => {
                  const approved = isApproved(item);
                  const DecisionIcon = approved ? CircleCheck : CircleX;

                  return (
                    <article
                      key={`${item.entityType}-${item.id}`}
                      className="surface-panel rounded-[1.5rem] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              {getEntityLabel(item.entityType)}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                approved
                                  ? "bg-primary/10 text-primary"
                                  : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              <DecisionIcon className="size-3.5" />
                              {approved ? "Approved" : "Rejected"}
                            </span>
                          </div>

                          <Link
                            href={getEntityHref(item.entityType, item.slug)}
                            className="mt-3 block break-words text-lg font-bold text-foreground transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                          >
                            {item.title}
                          </Link>

                          {item.moderationNote ? (
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                              Reason: {item.moderationNote}
                            </p>
                          ) : null}
                        </div>

                        <p className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                          <Clock3 className="size-3.5" />
                          {formatDateTime(item.moderatedAt)}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-3xl border border-dashed border-border bg-muted/30 p-12 text-center text-muted-foreground">
                No moderation decisions have been recorded yet.
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function ModerationCard({
  entityId,
  entityType,
  href,
  label,
  title,
  summary,
  meta,
}: {
  entityId: string;
  entityType: ModerationEntityType;
  href: string;
  label: string;
  title: string;
  summary: string | null;
  meta: string;
}) {
  const Icon =
    entityType === "opportunity"
      ? BriefcaseBusiness
      : entityType === "event"
        ? CalendarDays
        : entityType === "business"
          ? Building2
          : UsersRound;

  return (
    <article className="surface-panel relative overflow-hidden rounded-[1.75rem] p-6 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_42px_rgb(15_23_42/0.06)]">
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
        <Icon className="size-3.5" />
        {label}
      </span>
      <Link
        href={href}
        className="mt-3 block break-words text-xl font-bold text-foreground transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        {title}
      </Link>
      {summary ? (
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
          {summary}
        </p>
      ) : null}
      <p className="mt-4 text-xs text-muted-foreground">{meta}</p>
      <ModerationButtons entityId={entityId} entityType={entityType} />
    </article>
  );
}

function ModerationButtons({
  entityId,
  entityType,
}: {
  entityId: string;
  entityType: ModerationEntityType;
}) {
  return (
    <div className="mt-6 space-y-3">
      <form action={moderateContent}>
        <input type="hidden" name="entity_id" value={entityId} />
        <input type="hidden" name="entity_type" value={entityType} />
        <input type="hidden" name="decision" value="approve" />
        <PendingSubmitButton
          pendingLabel="Approving…"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <Check className="size-4" /> Approve
        </PendingSubmitButton>
      </form>

      <details className="rounded-xl border border-destructive/20 bg-destructive/5 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-destructive">
          Reject with a reason
        </summary>
        <form action={moderateContent} className="mt-3 space-y-3">
          <input type="hidden" name="entity_id" value={entityId} />
          <input type="hidden" name="entity_type" value={entityType} />
          <input type="hidden" name="decision" value="reject" />
          <label className="block text-xs font-medium text-foreground">
            Explain what should be corrected
            <textarea
              name="moderation_note"
              required
              minLength={10}
              maxLength={1000}
              rows={3}
              className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-destructive focus:ring-2 focus:ring-destructive/10"
            />
          </label>
          <PendingSubmitButton
            pendingLabel="Rejecting…"
            className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-destructive"
          >
            <X className="size-4" /> Reject submission
          </PendingSubmitButton>
        </form>
      </details>
    </div>
  );
}
