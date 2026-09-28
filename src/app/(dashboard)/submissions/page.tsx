import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CircleCheck,
  Clock3,
  Pencil,
  UsersRound,
  XCircle,
} from "lucide-react";

import {
  getUtcDateKey,
  hasOpportunityDeadlinePassed,
} from "@/lib/opportunities";
import { createClient } from "@/lib/supabase/server";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getStatusPresentation(status: string) {
  if (status === "published") {
    return {
      label: "Published",
      className: "bg-primary/[0.08] text-primary",
      icon: CircleCheck,
    };
  }

  if (status === "draft") {
    return {
      label: "Pending review",
      className: "bg-accent/60 text-accent-foreground",
      icon: Clock3,
    };
  }

  return {
    label: status === "expired" ? "Expired" : "Not approved",
    className: "bg-destructive/[0.08] text-destructive",
    icon: XCircle,
  };
}

const focusClass =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

export default async function SubmissionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const today = getUtcDateKey(new Date());

  const [
    { data: opportunities, error: opportunitiesError },
    { data: events, error: eventsError },
    { data: businesses, error: businessesError },
    { data: organizations, error: organizationsError },
  ] = await Promise.all([
    supabase
      .from("opportunities")
      .select("id,title,slug,summary,type,status,deadline,moderation_note,created_at,updated_at")
      .eq("author_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("events")
      .select("id,title,slug,summary,status,moderation_note,starts_at,created_at,updated_at")
      .eq("creator_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("businesses")
      .select("id,name,slug,short_description,category,status,moderation_note,updated_at")
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("organizations")
      .select("id,name,slug,short_description,organization_type,status,moderation_note,updated_at")
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  const hasError = Boolean(
    opportunitiesError ||
      eventsError ||
      businessesError ||
      organizationsError,
  );
  const hasSubmissions =
    (opportunities?.length ?? 0) +
      (events?.length ?? 0) +
      (businesses?.length ?? 0) +
      (organizations?.length ?? 0) >
    0;

  const sectionHeadingClass = "flex items-center gap-3";
  const countClass =
    "rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground";

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card p-6 shadow-[0_18px_55px_rgb(15_23_42/0.045)] md:p-8">
          <div className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary/[0.07] blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 size-56 rounded-full bg-accent/45 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Your content
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-foreground md:text-5xl">
                My submissions
              </h1>
              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
                Track moderation status, review published content, and edit a
                submission when changes are needed.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/opportunities/new"
                className={`rounded-2xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-[0_10px_28px_color-mix(in_oklab,var(--primary)_16%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/90 ${focusClass}`}
              >
                New opportunity
              </Link>
              <Link
                href="/events/new"
                className={`rounded-2xl border border-border/80 bg-background/80 px-4 py-2.5 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted ${focusClass}`}
              >
                New event
              </Link>
            </div>
          </div>
        </section>

        {hasError ? (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-8 rounded-xl border border-destructive/25 bg-destructive/[0.08] p-4 text-sm text-destructive"
          >
            We could not load all of your submissions. Please try again.
          </div>
        ) : null}

        <section className="mt-10">
          <div className={sectionHeadingClass}>
            <BriefcaseBusiness aria-hidden="true" className="size-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Opportunities</h2>
            <span className={countClass}>{opportunities?.length ?? 0}</span>
          </div>

          {opportunities?.length ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {opportunities.map((opportunity) => (
                <SubmissionCard
                  key={opportunity.id}
                  title={opportunity.title}
                  summary={opportunity.summary}
                  status={
                    opportunity.status === "published" &&
                    hasOpportunityDeadlinePassed(opportunity.deadline, today)
                      ? "expired"
                      : opportunity.status
                  }
                  moderationNote={opportunity.moderation_note}
                  detailHref={`/opportunities/${opportunity.slug}`}
                  editHref={`/opportunities/${opportunity.slug}/edit`}
                  meta={`${opportunity.type} · Updated ${formatDate(opportunity.updated_at)}`}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              href="/opportunities/new"
              label="Submit an opportunity"
              text="You have not submitted an opportunity yet."
            />
          )}
        </section>

        <section className="mt-12">
          <div className={sectionHeadingClass}>
            <Building2 aria-hidden="true" className="size-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Businesses</h2>
            <span className={countClass}>{businesses?.length ?? 0}</span>
          </div>

          {businesses?.length ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {businesses.map((business) => (
                <SubmissionCard
                  key={business.id}
                  title={business.name}
                  summary={business.short_description}
                  status={business.status}
                  moderationNote={business.moderation_note}
                  detailHref={`/businesses/${business.slug}`}
                  editHref={`/businesses/${business.slug}/edit`}
                  meta={`${business.category} · Updated ${formatDate(business.updated_at)}`}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              href="/businesses/new"
              label="Create a business"
              text="You have not submitted a business yet."
            />
          )}
        </section>

        <section className="mt-12">
          <div className={sectionHeadingClass}>
            <UsersRound aria-hidden="true" className="size-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Organizations</h2>
            <span className={countClass}>{organizations?.length ?? 0}</span>
          </div>

          {organizations?.length ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {organizations.map((organization) => (
                <SubmissionCard
                  key={organization.id}
                  title={organization.name}
                  summary={organization.short_description}
                  status={organization.status}
                  moderationNote={organization.moderation_note}
                  detailHref={`/organizations/${organization.slug}`}
                  editHref={`/organizations/${organization.slug}/edit`}
                  meta={`${organization.organization_type ?? "Organization"} · Updated ${formatDate(organization.updated_at)}`}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              href="/organizations/new"
              label="Create an organization"
              text="You have not submitted an organization yet."
            />
          )}
        </section>

        <section className="mt-12">
          <div className={sectionHeadingClass}>
            <CalendarDays aria-hidden="true" className="size-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Events</h2>
            <span className={countClass}>{events?.length ?? 0}</span>
          </div>

          {events?.length ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {events.map((event) => (
                <SubmissionCard
                  key={event.id}
                  title={event.title}
                  summary={event.summary}
                  status={event.status}
                  moderationNote={event.moderation_note}
                  detailHref={`/events/${event.slug}`}
                  editHref={`/events/${event.slug}/edit`}
                  meta={`Starts ${formatDate(event.starts_at)} · Updated ${formatDate(event.updated_at)}`}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              href="/events/new"
              label="Submit an event"
              text="You have not submitted an event yet."
            />
          )}
        </section>

        {!hasError && !hasSubmissions ? (
          <p className="sr-only">No submissions found.</p>
        ) : null}
      </div>
    </main>
  );
}

function SubmissionCard({
  title,
  summary,
  status,
  moderationNote,
  detailHref,
  editHref,
  meta,
}: {
  title: string;
  summary: string | null;
  status: string;
  moderationNote: string | null;
  detailHref: string;
  editHref: string;
  meta: string;
}) {
  const presentation = getStatusPresentation(status);
  const StatusIcon = presentation.icon;

  return (
    <article className="surface-panel relative overflow-hidden rounded-[1.75rem] p-6 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_42px_rgb(15_23_42/0.06)] focus-within:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${presentation.className}`}
        >
          <StatusIcon aria-hidden="true" className="size-3.5" />
          {presentation.label}
        </span>
        <span className="text-xs capitalize text-muted-foreground">{meta}</span>
      </div>

      <Link
        href={detailHref}
        className={`mt-4 block break-words text-xl font-bold text-foreground transition hover:text-primary ${focusClass}`}
      >
        {title}
      </Link>
      {summary ? (
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
          {summary}
        </p>
      ) : null}

      {presentation.label === "Not approved" && moderationNote ? (
        <div className="mt-4 rounded-xl border border-destructive/20 bg-destructive/[0.05] p-3 text-sm leading-6 text-destructive">
          <span className="font-semibold">Moderator note:</span>{" "}
          {moderationNote}
        </div>
      ) : null}

      <div className="mt-6 flex gap-3">
        <Link
          href={detailHref}
          className={`rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted ${focusClass}`}
        >
          View
        </Link>
        <Link
          href={editHref}
          className={`inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted ${focusClass}`}
        >
          <Pencil aria-hidden="true" className="size-3.5" /> Edit
        </Link>
      </div>
    </article>
  );
}

function EmptyState({
  href,
  label,
  text,
}: {
  href: string;
  label: string;
  text: string;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/25 p-8 text-center">
      <p className="text-sm text-muted-foreground">{text}</p>
      <Link
        href={href}
        className={`mt-4 inline-flex text-sm font-semibold text-primary transition hover:text-primary/80 ${focusClass}`}
      >
        {label}
      </Link>
    </div>
  );
}
