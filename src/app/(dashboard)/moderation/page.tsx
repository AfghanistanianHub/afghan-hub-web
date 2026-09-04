import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  Check,
  CircleCheck,
  CircleX,
  Clock3,
  X,
} from "lucide-react";

import { moderateContent } from "@/app/(dashboard)/moderation/actions";
import { createClient } from "@/lib/supabase/server";

type ModerationPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
    view?: string;
  }>;
};

type HistoryItem = {
  id: string;
  entityType: "opportunity" | "event";
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

export default async function ModerationPage({
  searchParams,
}: ModerationPageProps) {
  const { error, success, view } = await searchParams;
  const activeView = view === "history" ? "history" : "pending";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin" && profile?.role !== "moderator") {
    redirect("/");
  }

  const [
    { data: opportunities },
    { data: events },
    { data: moderatedOpportunities },
    { data: moderatedEvents },
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
  ]);

  const pendingCount =
    (opportunities?.length ?? 0) + (events?.length ?? 0);

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
  ]
    .sort(
      (a, b) =>
        new Date(b.moderatedAt).getTime() -
        new Date(a.moderatedAt).getTime(),
    )
    .slice(0, 30);

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
          Admin tools
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          Content moderation
        </h1>
        <p className="mt-3 text-slate-400">
          Review opportunities and events before they become visible to the
          community, and keep a record of recent decisions.
        </p>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            The submission was {success}.
          </div>
        ) : null}

        <div className="mt-8 inline-flex rounded-xl border border-slate-800 bg-slate-900 p-1">
          <Link
            href="/moderation"
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeView === "pending"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Pending review
            {pendingCount > 0 ? (
              <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">
                {pendingCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/moderation?view=history"
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeView === "history"
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Recent decisions
          </Link>
        </div>

        {activeView === "pending" ? (
          <>
            <div className="mt-8 flex items-center justify-between">
              <h2 className="text-xl font-bold">Pending review</h2>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                {pendingCount}
              </span>
            </div>

            {pendingCount > 0 ? (
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                {opportunities?.map((opportunity) => (
                  <article
                    key={`opportunity-${opportunity.id}`}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                      Opportunity · {opportunity.type}
                    </span>
                    <Link
                      href={`/opportunities/${opportunity.slug}`}
                      className="mt-3 block text-xl font-bold hover:text-emerald-300"
                    >
                      {opportunity.title}
                    </Link>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                      {opportunity.summary}
                    </p>
                    <p className="mt-4 text-xs text-slate-500">
                      Submitted {formatDate(opportunity.created_at)}
                    </p>
                    <ModerationButtons
                      entityId={opportunity.id}
                      entityType="opportunity"
                    />
                  </article>
                ))}

                {events?.map((event) => (
                  <article
                    key={`event-${event.id}`}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                  >
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">
                      <CalendarDays className="size-3.5" /> Event
                    </span>
                    <Link
                      href={`/events/${event.slug}`}
                      className="mt-3 block text-xl font-bold hover:text-emerald-300"
                    >
                      {event.title}
                    </Link>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                      {event.summary}
                    </p>
                    <p className="mt-4 text-xs text-slate-500">
                      Starts {formatDate(event.starts_at)}
                    </p>
                    <ModerationButtons
                      entityId={event.id}
                      entityType="event"
                    />
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-12 text-center text-slate-400">
                There is nothing waiting for review.
              </div>
            )}
          </>
        ) : (
          <section className="mt-8">
            <div>
              <h2 className="text-xl font-bold">Recent decisions</h2>
              <p className="mt-2 text-sm text-slate-500">
                The latest approved and rejected submissions across events and
                opportunities.
              </p>
            </div>

            {history.length > 0 ? (
              <div className="mt-5 space-y-4">
                {history.map((item) => {
                  const approved = isApproved(item);
                  const href =
                    item.entityType === "event"
                      ? `/events/${item.slug}`
                      : `/opportunities/${item.slug}`;
                  const DecisionIcon = approved ? CircleCheck : CircleX;

                  return (
                    <article
                      key={`${item.entityType}-${item.id}`}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              {item.entityType}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                approved
                                  ? "bg-emerald-500/10 text-emerald-300"
                                  : "bg-red-500/10 text-red-300"
                              }`}
                            >
                              <DecisionIcon className="size-3.5" />
                              {approved ? "Approved" : "Rejected"}
                            </span>
                          </div>

                          <Link
                            href={href}
                            className="mt-3 block text-lg font-bold text-white hover:text-emerald-300"
                          >
                            {item.title}
                          </Link>

                          {item.moderationNote ? (
                            <p className="mt-3 text-sm leading-6 text-slate-400">
                              Reason: {item.moderationNote}
                            </p>
                          ) : null}
                        </div>

                        <p className="flex shrink-0 items-center gap-2 text-xs text-slate-500">
                          <Clock3 className="size-3.5" />
                          {formatDateTime(item.moderatedAt)}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-12 text-center text-slate-400">
                No moderation decisions have been recorded yet.
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function ModerationButtons({
  entityId,
  entityType,
}: {
  entityId: string;
  entityType: "opportunity" | "event";
}) {
  return (
    <div className="mt-6 space-y-3">
      <form action={moderateContent}>
        <input type="hidden" name="entity_id" value={entityId} />
        <input type="hidden" name="entity_type" value={entityType} />
        <input type="hidden" name="decision" value="approve" />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400"
        >
          <Check className="size-4" /> Approve
        </button>
      </form>

      <details className="rounded-xl border border-red-500/30 bg-red-500/5 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-red-300">
          Reject with a reason
        </summary>
        <form action={moderateContent} className="mt-3 space-y-3">
          <input type="hidden" name="entity_id" value={entityId} />
          <input type="hidden" name="entity_type" value={entityType} />
          <input type="hidden" name="decision" value="reject" />
          <label className="block text-xs font-medium text-slate-300">
            Explain what should be corrected
            <textarea
              name="moderation_note"
              required
              minLength={10}
              maxLength={1000}
              rows={3}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-red-400"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10"
          >
            <X className="size-4" /> Reject submission
          </button>
        </form>
      </details>
    </div>
  );
}
