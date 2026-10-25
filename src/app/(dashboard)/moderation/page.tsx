import { MemberPageHeader } from "@/components/catalog/member-page-header";
import { catalogPageContainerClass } from "@/components/catalog/catalog-filter-styles";
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

import type { ReactNode } from "react";

import { moderateContent } from "@/app/(dashboard)/moderation/actions";
import { PendingSubmitButton } from "@/components/forms/pending-submit-button";
import { B, BDate, BDatePhrase } from "@/components/i18n/browse";
import { W } from "@/components/i18n/workspace";
import { organizationTypeOptions } from "@/components/organizations/organization-type-options";
import type { BrowseCopyKey } from "@/lib/i18n/browse-copy";
import type { WorkspaceCopyKey } from "@/lib/i18n/workspace-copy";
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

const approvalMessages: Record<string, BrowseCopyKey> = {
  approved: "moderation.successApproved",
  rejected: "moderation.successRejected",
};

const errorMessages: Record<string, BrowseCopyKey> = {
  "invalid-request": "moderation.errorInvalidRequest",
  "invalid-reason": "moderation.errorInvalidReason",
  "apply-failed": "moderation.errorApplyFailed",
};

function isApproved(item: HistoryItem) {
  return item.status === "published";
}

function getEntityHref(entityType: ModerationEntityType, slug: string) {
  if (entityType === "opportunity") return `/opportunities/${slug}`;
  if (entityType === "event") return `/events/${slug}`;
  if (entityType === "business") return `/businesses/${slug}`;
  return `/organizations/${slug}`;
}

function getEntityLabel(entityType: ModerationEntityType): BrowseCopyKey {
  if (entityType === "opportunity") return "moderation.entityOpportunity";
  if (entityType === "event") return "moderation.entityEvent";
  if (entityType === "business") return "moderation.entityBusiness";
  return "moderation.entityOrganization";
}

function opportunityTypeKey(value: string): BrowseCopyKey {
  return value === "volunteer" ? "opportunityType.volunteer" : "opportunityType.job";
}

function organizationTypeKey(value: string | null): WorkspaceCopyKey | null {
  if (!value) return null;
  const option = organizationTypeOptions.find((entry) => entry.value === value);
  return option?.key ?? null;
}

/** Localized entity label with an optional localized or user-data detail. */
function EntityLabel({
  entityType,
  detail,
}: {
  entityType: ModerationEntityType;
  detail?: ReactNode;
}) {
  return (
    <>
      <B k={getEntityLabel(entityType)} />
      {detail ? (
        <>
          {" · "}
          {detail}
        </>
      ) : null}
    </>
  );
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
    <main className={catalogPageContainerClass}>
      <div className="min-w-0">
        <MemberPageHeader title={<B k="moderation.title" />} description={<B k="moderation.description" />} icon={CircleCheck}>
          {accessContext.role === "admin" ? <Link href="/moderation/team" className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-border bg-card px-4 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><B k="moderation.manageTeam" /></Link> : null}
        </MemberPageHeader>

        {error ? (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-6 rounded-[var(--radius-control)] border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
          >
            <B k={errorMessages[error] ?? "moderation.errorApplyFailed"} />
          </div>
        ) : null}

        {success ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-6 rounded-[var(--radius-control)] border border-primary/20 bg-primary/10 p-4 text-sm text-primary"
          >
            <B k={approvalMessages[success] ?? "moderation.successGeneric"} />
          </div>
        ) : null}

        <div className="mt-8 grid w-full grid-cols-2 rounded-[var(--radius-control)] border border-border bg-muted/50 p-1 sm:inline-grid sm:w-auto">
          <Link
            href="/moderation"
            aria-current={activeView === "pending" ? "page" : undefined}
            className={`inline-flex min-h-11 min-w-0 items-center justify-center rounded-[var(--radius-control)] px-3 py-2 text-center text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-4 ${
              activeView === "pending"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <B k="moderation.pendingTab" />
            {pendingCount > 0 ? (
              <span className="ms-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {pendingCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/moderation?view=history"
            aria-current={activeView === "history" ? "page" : undefined}
            className={`inline-flex min-h-11 min-w-0 items-center justify-center rounded-[var(--radius-control)] px-3 py-2 text-center text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-4 ${
              activeView === "history"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <B k="moderation.historyTab" />
          </Link>
        </div>

        {activeView === "pending" ? (
          <>
            <div className="mt-8 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground"><B k="moderation.pendingHeading" /></h2>
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
                    label={
                      <EntityLabel
                        entityType="opportunity"
                        detail={<B k={opportunityTypeKey(opportunity.type)} />}
                      />
                    }
                    title={opportunity.title}
                    summary={opportunity.summary}
                    meta={
                      <BDatePhrase
                        k="moderation.submitted"
                        date={opportunity.created_at}
                        mode="shortDate"
                        field="date"
                      />
                    }
                  />
                ))}
                {events?.map((event) => (
                  <ModerationCard
                    key={`event-${event.id}`}
                    entityId={event.id}
                    entityType="event"
                    href={`/events/${event.slug}`}
                    label={<EntityLabel entityType="event" />}
                    title={event.title}
                    summary={event.summary}
                    meta={
                      <BDatePhrase
                        k="moderation.starts"
                        date={event.starts_at}
                        mode="shortDate"
                        field="date"
                      />
                    }
                  />
                ))}
                {businesses?.map((business) => (
                  <ModerationCard
                    key={`business-${business.id}`}
                    entityId={business.id}
                    entityType="business"
                    href={`/businesses/${business.slug}`}
                    label={<EntityLabel entityType="business" detail={business.category} />}
                    title={business.name}
                    summary={business.short_description}
                    meta={
                      <BDatePhrase
                        k="moderation.submitted"
                        date={business.created_at}
                        mode="shortDate"
                        field="date"
                      />
                    }
                  />
                ))}
                {organizations?.map((organization) => (
                  <ModerationCard
                    key={`organization-${organization.id}`}
                    entityId={organization.id}
                    entityType="organization"
                    href={`/organizations/${organization.slug}`}
                    label={
                      <EntityLabel
                        entityType="organization"
                        detail={
                          organization.organization_type ? (
                            <W
                              k={
                                organizationTypeKey(organization.organization_type) ??
                                "organization.typeOther"
                              }
                            />
                          ) : null
                        }
                      />
                    }
                    title={organization.name}
                    summary={organization.short_description}
                    meta={
                      <BDatePhrase
                        k="moderation.submitted"
                        date={organization.created_at}
                        mode="shortDate"
                        field="date"
                      />
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="relative mt-5 overflow-hidden rounded-[var(--radius)] border border-dashed border-border/80 bg-muted/25 p-12 text-center text-muted-foreground"><div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-primary/[0.06] blur-3xl"/><span className="relative mx-auto flex size-14 items-center justify-center rounded-[var(--radius-control)] bg-primary/10 text-primary"><CircleCheck aria-hidden="true" className="size-7"/></span><p className="relative mt-5 font-medium text-foreground"><B k="moderation.nothingPending" /></p><span className="relative mx-auto mt-2 block max-w-md text-sm leading-6 text-muted-foreground"><B k="moderation.nothingPendingBody" /></span></div>
            )}
          </>
        ) : (
          <section className="mt-8">
            <div>
              <h2 className="text-xl font-bold text-foreground"><B k="moderation.historyHeading" /></h2>
              <p className="mt-2 text-sm text-muted-foreground">
                <B k="moderation.historyBody" />
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
                      className="surface-panel rounded-[var(--radius)] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              <EntityLabel entityType={item.entityType} />
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                approved
                                  ? "bg-primary/10 text-primary"
                                  : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              <DecisionIcon aria-hidden="true" className="size-3.5" />
                              <B k={approved ? "moderation.approved" : "moderation.rejected"} />
                            </span>
                          </div>

                          <Link
                            href={getEntityHref(item.entityType, item.slug)}
                            className="mt-3 block break-words text-lg font-bold text-foreground transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                          >
                            {item.title}
                          </Link>

                          {item.moderationNote ? (
                            <p className="mt-3 break-words text-sm leading-6 text-muted-foreground">
                              <B
                                k="moderation.reason"
                                values={{ reason: item.moderationNote }}
                              />
                            </p>
                          ) : null}
                        </div>

                        <p className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                          <Clock3 aria-hidden="true" className="size-3.5" />
                          <BDate value={item.moderatedAt} mode="datetime" />
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="relative mt-5 overflow-hidden rounded-[var(--radius)] border border-dashed border-border/80 bg-muted/25 p-12 text-center text-muted-foreground"><div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-accent/55 blur-3xl"/><span className="relative mx-auto flex size-14 items-center justify-center rounded-[var(--radius-control)] bg-primary/10 text-primary"><Clock3 aria-hidden="true" className="size-7"/></span><p className="relative mt-5 font-medium text-foreground"><B k="moderation.noHistory" /></p><span className="relative mx-auto mt-2 block max-w-md text-sm leading-6 text-muted-foreground"><B k="moderation.noHistoryBody" /></span></div>
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
  label: ReactNode;
  title: string;
  summary: string | null;
  meta: ReactNode;
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
    <article className="surface-panel relative overflow-hidden rounded-[var(--radius)] p-6 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_42px_rgb(15_23_42/0.06)]">
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
        <Icon aria-hidden="true" className="size-3.5" />
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
    <form action={moderateContent} className="mt-6 space-y-3">
      <input type="hidden" name="entity_id" value={entityId} />
      <input type="hidden" name="entity_type" value={entityType} />

      <PendingSubmitButton
        name="decision"
        value="approve"
        formNoValidate
        pendingLabel={<B k="moderation.approving" />}
        className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <Check aria-hidden="true" className="size-4" /> <B k="moderation.approve" />
      </PendingSubmitButton>

      <details className="rounded-[var(--radius-control)] border border-destructive/20 bg-destructive/5 p-3">
        <summary className="flex min-h-11 cursor-pointer items-center rounded-[var(--radius-control)] px-2 py-2 text-sm font-semibold text-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive">
          <B k="moderation.rejectSummary" />
        </summary>
        <div className="mt-3 space-y-3">
          <label className="block text-xs font-medium text-foreground">
            <B k="moderation.rejectLabel" />
            <textarea
              name="moderation_note"
              required
              minLength={10}
              maxLength={1000}
              rows={3}
              className="mt-2 w-full rounded-[var(--radius-control)] border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-destructive focus:ring-2 focus:ring-destructive/10"
            />
          </label>
          <PendingSubmitButton
            name="decision"
            value="reject"
            pendingLabel={<B k="moderation.rejecting" />}
            className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] border border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-destructive"
          >
            <X aria-hidden="true" className="size-4" /> <B k="moderation.reject" />
          </PendingSubmitButton>
        </div>
      </details>
    </form>
  );
}
