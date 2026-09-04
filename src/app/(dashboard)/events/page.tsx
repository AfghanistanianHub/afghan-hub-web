import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{
    q?: string | string[];
    format?: string | string[];
    city?: string | string[];
  }>;
};

function getOrganizationName(
  organization: { name: string } | { name: string }[] | null,
) {
  return Array.isArray(organization)
    ? organization[0]?.name
    : organization?.name;
}

function getSearchValue(value: string | string[] | undefined, maxLength = 100) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export default async function EventsPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = getSearchValue(params.q);
  const city = getSearchValue(params.city, 80);
  const requestedFormat = getSearchValue(params.format, 20);
  const format =
    requestedFormat === "online" || requestedFormat === "in-person"
      ? requestedFormat
      : "all";
  const supabase = await createClient();
  const now = new Date().toISOString();

  let eventsQuery = supabase
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
    .eq("status", "published")
    .gte("starts_at", now)
    .order("starts_at", { ascending: true });

  if (search) {
    eventsQuery = eventsQuery.ilike(
      "title",
      `%${escapeLikePattern(search)}%`,
    );
  }

  if (city) {
    eventsQuery = eventsQuery.ilike(
      "city",
      `%${escapeLikePattern(city)}%`,
    );
  }

  if (format !== "all") {
    eventsQuery = eventsQuery.eq("is_online", format === "online");
  }

  const { data: events, error } = await eventsQuery;
  const hasFilters = Boolean(search || city || format !== "all");

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-5">
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

      <form
        action="/events"
        method="get"
        className="mt-8 grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
      >
        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Search events
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Search by event title"
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-300">
          Format
          <select
            name="format"
            defaultValue={format}
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-500"
          >
            <option value="all">All formats</option>
            <option value="online">Online</option>
            <option value="in-person">In person</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-300">
          City
          <input
            type="search"
            name="city"
            defaultValue={city}
            placeholder="Any city"
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-emerald-500"
          />
        </label>

        <div className="flex items-end gap-3">
          <button
            type="submit"
            className="rounded-lg bg-emerald-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-400"
          >
            Apply
          </button>

          {hasFilters ? (
            <Link
              href="/events"
              className="rounded-lg border border-slate-700 px-4 py-3 font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
        <p>
          {error
            ? "Events could not be loaded."
            : `${events?.length ?? 0} ${events?.length === 1 ? "event" : "events"} found`}
        </p>

        {hasFilters ? (
          <p>Showing filtered upcoming events</p>
        ) : (
          <p>Showing all upcoming events</p>
        )}
      </div>

      <div className="mt-6 space-y-6">
        {error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-8 text-center text-red-200">
            We could not load events. Please try again.
          </div>
        ) : events?.length ? (
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

              <h2 className="mt-4 text-2xl font-semibold">{event.title}</h2>

              {event.organization ? (
                <p className="mt-2 text-sm text-emerald-400">
                  Hosted by {getOrganizationName(event.organization)}
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  Community event
                </p>
              )}

              {event.summary ? (
                <p className="mt-3 text-slate-400">{event.summary}</p>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-6 text-sm text-slate-500">
                {event.venue_name ? <span>{event.venue_name}</span> : null}
                {event.city ? <span>{event.city}</span> : null}
                {event.country ? <span>{event.country}</span> : null}
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center">
            <h2 className="text-2xl font-semibold">
              {hasFilters ? "No matching events" : "No events yet"}
            </h2>

            <p className="mt-3 text-slate-400">
              {hasFilters
                ? "Try changing or clearing your filters."
                : "The first community events will appear here."}
            </p>

            {hasFilters ? (
              <Link
                href="/events"
                className="mt-5 inline-flex rounded-lg border border-slate-700 px-4 py-2 font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                Clear filters
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}
