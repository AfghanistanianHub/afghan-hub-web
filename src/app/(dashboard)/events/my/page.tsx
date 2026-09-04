import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function getLocation(event: {
  is_online: boolean;
  venue_name: string | null;
  city: string | null;
  country: string | null;
}) {
  if (event.is_online) {
    return "Online";
  }

  return [event.venue_name, event.city, event.country]
    .filter(Boolean)
    .join(", ");
}

function EventCard({
  event,
  showStatus = false,
}: {
  event: {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    starts_at: string;
    city: string | null;
    country: string | null;
    venue_name: string | null;
    is_online: boolean;
    status: string;
  };
  showStatus?: boolean;
}) {
  const location = getLocation(event);

  return (
    <Link
      href={`/events/${event.slug}`}
      className="block rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-emerald-500/60"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
          {formatEventDate(event.starts_at)}
        </span>

        {showStatus ? (
          <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-semibold capitalize text-slate-300">
            {event.status}
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 text-lg font-bold text-white">{event.title}</h3>

      {event.summary ? (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
          {event.summary}
        </p>
      ) : null}

      {location ? (
        <p className="mt-4 flex items-start gap-2 text-sm text-slate-500">
          <MapPin className="mt-0.5 size-4 shrink-0" />
          {location}
        </p>
      ) : null}
    </Link>
  );
}

export default async function MyEventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const [{ data: registrations }, { data: hostedEvents }] = await Promise.all([
    supabase
      .from("event_rsvps")
      .select("event_id")
      .eq("profile_id", user.id),
    supabase
      .from("events")
      .select(
        "id,title,slug,summary,starts_at,city,country,venue_name,is_online,status",
      )
      .eq("creator_id", user.id)
      .order("starts_at", { ascending: true }),
  ]);

  const registeredIds = registrations?.map((registration) => registration.event_id) ?? [];
  const { data: registeredEvents } = registeredIds.length
    ? await supabase
        .from("events")
        .select(
          "id,title,slug,summary,starts_at,city,country,venue_name,is_online,status",
        )
        .in("id", registeredIds)
        .eq("status", "published")
        .order("starts_at", { ascending: true })
    : { data: [] };

  const now = Date.now();
  const upcomingRegistered =
    registeredEvents?.filter(
      (event) => new Date(event.starts_at).getTime() >= now,
    ) ?? [];
  const pastRegistered =
    registeredEvents?.filter(
      (event) => new Date(event.starts_at).getTime() < now,
    ) ?? [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-emerald-400">Events</p>
          <h1 className="mt-1 text-4xl font-bold">My events</h1>
          <p className="mt-2 text-slate-400">
            Keep track of events you registered for and events you are hosting.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/events"
            className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-200 hover:bg-slate-800"
          >
            Browse events
          </Link>
          <Link
            href="/events/new"
            className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500"
          >
            Create Event
          </Link>
        </div>
      </div>

      <section className="mt-10">
        <div>
          <h2 className="text-2xl font-bold">Registered</h2>
          <p className="mt-1 text-sm text-slate-500">
            Upcoming events you have confirmed you are attending.
          </p>
        </div>

        {upcomingRegistered.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {upcomingRegistered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-10 text-center">
            <CalendarDays className="mx-auto size-9 text-slate-600" />
            <h3 className="mt-3 font-semibold text-white">
              No upcoming registrations
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Register for an event and it will appear here.
            </p>
          </div>
        )}

        {pastRegistered.length ? (
          <details className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <summary className="cursor-pointer font-semibold text-slate-300">
              Past registrations ({pastRegistered.length})
            </summary>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {pastRegistered
                .slice()
                .reverse()
                .map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
            </div>
          </details>
        ) : null}
      </section>

      <section className="mt-12 border-t border-slate-800 pt-10">
        <div>
          <h2 className="text-2xl font-bold">Hosting</h2>
          <p className="mt-1 text-sm text-slate-500">
            Events you created, including items still under review.
          </p>
        </div>

        {hostedEvents?.length ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {hostedEvents.map((event) => (
              <EventCard key={event.id} event={event} showStatus />
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-10 text-center">
            <CalendarDays className="mx-auto size-9 text-slate-600" />
            <h3 className="mt-3 font-semibold text-white">
              You are not hosting any events yet
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Create an event to submit it for moderation.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
