import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarDays,
  CircleCheck,
  Clock3,
  Pencil,
  XCircle,
} from "lucide-react";

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
      className: "bg-emerald-500/10 text-emerald-300",
      icon: CircleCheck,
    };
  }

  if (status === "draft") {
    return {
      label: "Pending review",
      className: "bg-amber-500/10 text-amber-200",
      icon: Clock3,
    };
  }

  return {
    label: status === "expired" ? "Expired" : "Not approved",
    className: "bg-red-500/10 text-red-300",
    icon: XCircle,
  };
}

export default async function SubmissionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: opportunities, error: opportunitiesError }, { data: events, error: eventsError }] =
    await Promise.all([
      supabase
        .from("opportunities")
        .select("id,title,slug,summary,type,status,created_at,updated_at")
        .eq("author_id", user.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("events")
        .select("id,title,slug,summary,status,starts_at,created_at,updated_at")
        .eq("creator_id", user.id)
        .order("updated_at", { ascending: false }),
    ]);

  const hasError = Boolean(opportunitiesError || eventsError);
  const hasSubmissions =
    (opportunities?.length ?? 0) + (events?.length ?? 0) > 0;

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
              Your content
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              My submissions
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Track moderation status, review published content, and edit a
              submission when changes are needed.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/opportunities/new"
              className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400"
            >
              New opportunity
            </Link>
            <Link
              href="/events/new"
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold hover:bg-slate-800"
            >
              New event
            </Link>
          </div>
        </div>

        {hasError ? (
          <div className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            We could not load all of your submissions. Please try again.
          </div>
        ) : null}

        <section className="mt-10">
          <div className="flex items-center gap-3">
            <BriefcaseBusiness className="size-5 text-emerald-400" />
            <h2 className="text-xl font-bold">Opportunities</h2>
            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
              {opportunities?.length ?? 0}
            </span>
          </div>

          {opportunities?.length ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {opportunities.map((opportunity) => (
                <SubmissionCard
                  key={opportunity.id}
                  title={opportunity.title}
                  summary={opportunity.summary}
                  status={opportunity.status}
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
          <div className="flex items-center gap-3">
            <CalendarDays className="size-5 text-emerald-400" />
            <h2 className="text-xl font-bold">Events</h2>
            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
              {events?.length ?? 0}
            </span>
          </div>

          {events?.length ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {events.map((event) => (
                <SubmissionCard
                  key={event.id}
                  title={event.title}
                  summary={event.summary}
                  status={event.status}
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
  detailHref,
  editHref,
  meta,
}: {
  title: string;
  summary: string | null;
  status: string;
  detailHref: string;
  editHref: string;
  meta: string;
}) {
  const presentation = getStatusPresentation(status);
  const StatusIcon = presentation.icon;

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${presentation.className}`}
        >
          <StatusIcon className="size-3.5" />
          {presentation.label}
        </span>
        <span className="text-xs capitalize text-slate-500">{meta}</span>
      </div>

      <Link
        href={detailHref}
        className="mt-4 block text-xl font-bold transition hover:text-emerald-300"
      >
        {title}
      </Link>
      {summary ? (
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
          {summary}
        </p>
      ) : null}

      <div className="mt-6 flex gap-3">
        <Link
          href={detailHref}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-800"
        >
          View
        </Link>
        <Link
          href={editHref}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold hover:bg-slate-800"
        >
          <Pencil className="size-3.5" /> Edit
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
    <div className="mt-5 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center">
      <p className="text-sm text-slate-400">{text}</p>
      <Link
        href={href}
        className="mt-4 inline-flex text-sm font-semibold text-emerald-400 hover:text-emerald-300"
      >
        {label}
      </Link>
    </div>
  );
}
