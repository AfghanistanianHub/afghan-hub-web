import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Check, X } from "lucide-react";

import { moderateContent } from "@/app/(dashboard)/moderation/actions";
import { createClient } from "@/lib/supabase/server";

type ModerationPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export default async function ModerationPage({
  searchParams,
}: ModerationPageProps) {
  const { error, success } = await searchParams;
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

  const [{ data: opportunities }, { data: events }] = await Promise.all([
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
  ]);

  const pendingCount =
    (opportunities?.length ?? 0) + (events?.length ?? 0);

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
          community.
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
                <ModerationButtons entityId={event.id} entityType="event" />
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-12 text-center text-slate-400">
            There is nothing waiting for review.
          </div>
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
    <form action={moderateContent} className="mt-6 flex gap-3">
      <input type="hidden" name="entity_id" value={entityId} />
      <input type="hidden" name="entity_type" value={entityType} />
      <button
        type="submit"
        name="decision"
        value="approve"
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-emerald-400"
      >
        <Check className="size-4" /> Approve
      </button>
      <button
        type="submit"
        name="decision"
        value="reject"
        className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10"
      >
        <X className="size-4" /> Reject
      </button>
    </form>
  );
}
