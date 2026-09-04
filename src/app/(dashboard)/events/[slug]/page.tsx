import {
  cancelEventRsvp,
  rsvpEvent,
} from "@/app/(dashboard)/events/actions";
import { DeleteEventButton } from "@/components/events/delete-event-button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    rsvp?: string;
  }>;
};

function formatDateTime(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

export default async function EventPage({ params, searchParams }: Props) {
  const [{ slug }, { rsvp }] = await Promise.all([params, searchParams]);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: event, error } = await supabase
    .from("events")
    .select(`
      *,
      organization:organizations (
        name,
        slug
      )
    `)
    .eq("slug", slug)
    .single();

  if (error || !event) {
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
  const isOwner = user?.id === event.creator_id;

  if (event.status !== "published" && !isOwner && !canModerate) {
    notFound();
  }

  const [{ data: rsvpCountData }, { data: viewerRsvp }] =
    user && event.status === "published"
      ? await Promise.all([
          supabase.rpc("get_event_rsvp_count", {
            target_event_id: event.id,
          }),
          supabase
            .from("event_rsvps")
            .select("event_id")
            .eq("event_id", event.id)
            .eq("profile_id", user.id)
            .maybeSingle(),
        ])
      : [{ data: 0 }, { data: null }];

  const rsvpCount = Number(rsvpCountData ?? 0);
  const hasRsvp = Boolean(viewerRsvp);
  const hasStarted = new Date(event.starts_at) <= new Date();
  const isFull =
    event.capacity !== null && rsvpCount >= event.capacity;

  const location = [
    event.city,
    event.province_state,
    event.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      {rsvp === "joined" ? (
        <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          You are registered for this event.
        </div>
      ) : null}

      {rsvp === "cancelled" ? (
        <div className="mb-6 rounded-xl border border-slate-700 bg-slate-800/70 p-4 text-sm text-slate-200">
          Your registration was cancelled.
        </div>
      ) : null}

      {rsvp === "full" ? (
        <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          This event has reached its capacity.
        </div>
      ) : null}

      {rsvp === "started" ? (
        <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          Registration is closed because this event has started.
        </div>
      ) : null}

      {rsvp === "error" ? (
        <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
          We could not update your registration. Please try again.
        </div>
      ) : null}

      {event.status !== "published" ? (
        <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          {event.status === "draft"
            ? "This event is waiting for moderator approval and is not visible to the community yet."
            : `This event was not approved.${
                event.moderation_note
                  ? ` Reason: ${event.moderation_note}`
                  : ""
              } Edit it to submit it for review again.`}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-emerald-600/20 px-3 py-1 text-sm text-emerald-400">
              {event.is_online ? "Online event" : "In-person event"}
            </span>

            <h1 className="mt-4 text-4xl font-bold">
              {event.title}
            </h1>
          </div>

          {isOwner ? (
            <div className="flex shrink-0 gap-3">
              <Link
              href={`/events/${event.slug}/edit`}
              className="rounded-lg border border-slate-700 px-4 py-2 font-semibold hover:bg-slate-800"
            >
                Edit
              </Link>

              <DeleteEventButton slug={event.slug} />
            </div>
          ) : null}
        </div>

        {event.organization ? (
          <p className="mt-4 text-sm text-slate-400">
            Hosted by{" "}
            <Link
              href={`/organizations/${event.organization.slug}`}
              className="text-emerald-400 hover:underline"
            >
              {event.organization.name}
            </Link>
          </p>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            Community event
          </p>
        )}

        <p className="mt-6 text-lg text-slate-300">
          {event.summary}
        </p>

        <div className="mt-8 whitespace-pre-wrap leading-8 text-slate-200">
          {event.description}
        </div>

        <div className="mt-10 space-y-4 border-t border-slate-800 pt-6 text-slate-400">
          <p>
            <strong className="text-slate-200">Starts:</strong>{" "}
            {formatDateTime(event.starts_at)}
          </p>

          {event.ends_at ? (
            <p>
              <strong className="text-slate-200">Ends:</strong>{" "}
              {formatDateTime(event.ends_at)}
            </p>
          ) : null}

          {event.is_online ? (
            event.online_url ? (
              <p>
                <strong className="text-slate-200">Online:</strong>{" "}
                <a
                  href={event.online_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  Join event
                </a>
              </p>
            ) : null
          ) : (
            <>
              {event.venue_name ? (
                <p>
                  <strong className="text-slate-200">Venue:</strong>{" "}
                  {event.venue_name}
                </p>
              ) : null}

              {event.address_line ? (
                <p>
                  <strong className="text-slate-200">Address:</strong>{" "}
                  {event.address_line}
                </p>
              ) : null}
            </>
          )}

          {location ? (
            <p>
              <strong className="text-slate-200">Location:</strong>{" "}
              {location}
            </p>
          ) : null}

          {event.capacity ? (
            <p>
              <strong className="text-slate-200">Capacity:</strong>{" "}
              {event.capacity}
            </p>
          ) : null}
        </div>

        {event.status === "published" ? (
          <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Event registration
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {rsvpCount} {rsvpCount === 1 ? "person is" : "people are"} going
                  {event.capacity !== null
                    ? ` · ${Math.max(event.capacity - rsvpCount, 0)} spots remaining`
                    : ""}
                </p>
              </div>

              {!isOwner && user && !hasStarted ? (
                hasRsvp ? (
                  <form action={cancelEventRsvp}>
                    <input type="hidden" name="event_id" value={event.id} />
                    <input type="hidden" name="slug" value={event.slug} />
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                    >
                      Cancel registration
                    </button>
                  </form>
                ) : (
                  <form action={rsvpEvent}>
                    <input type="hidden" name="event_id" value={event.id} />
                    <input type="hidden" name="slug" value={event.slug} />
                    <button
                      type="submit"
                      disabled={isFull}
                      className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                    >
                      {isFull ? "Event full" : "Register"}
                    </button>
                  </form>
                )
              ) : null}

              {isOwner ? (
                <p className="text-sm font-medium text-emerald-300">
                  You are hosting this event.
                </p>
              ) : null}

              {hasStarted ? (
                <p className="text-sm text-slate-500">Registration closed</p>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
