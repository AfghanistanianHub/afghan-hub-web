import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function getOrganizationName(
  organization: { name: string } | { name: string }[] | null,
) {
  return Array.isArray(organization)
    ? organization[0]?.name
    : organization?.name;
}

export default async function EventsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select(`
      id,
      title,
      slug,
      summary,
      starts_at,
      ends_at,
      city,
      country,
      venue_name,
      is_online,
      organization:organizations (
        name,
        slug
      )
    `)
    .order("starts_at", { ascending: true });

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Events</h1>

          <p className="mt-2 text-slate-400">
            Community events, workshops, conferences and gatherings.
          </p>
        </div>

        <Link
          href="/events/new"
          className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500"
        >
          Create Event
        </Link>
      </div>

      <div className="mt-10 space-y-6">
        {events?.length ? (
          events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="block rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-emerald-600"
            >
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full bg-emerald-600/20 px-3 py-1 text-emerald-400">
                  {event.is_online ? "Online" : "In person"}
                </span>

                <span className="text-slate-500">
                  {new Date(event.starts_at).toLocaleDateString("en-CA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-semibold">
                {event.title}
              </h2>

              {event.organization ? (
                <p className="mt-2 text-sm text-emerald-400">
                  Hosted by {getOrganizationName(event.organization)}
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  Community event
                </p>
              )}

              {event.summary && (
                <p className="mt-3 text-slate-400">
                  {event.summary}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-6 text-sm text-slate-500">
                {event.venue_name && (
                  <span>{event.venue_name}</span>
                )}

                {event.city && (
                  <span>{event.city}</span>
                )}

                {event.country && (
                  <span>{event.country}</span>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <h2 className="text-2xl font-semibold">
              No events yet
            </h2>

            <p className="mt-3 text-slate-400">
              The first community events will appear here.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
