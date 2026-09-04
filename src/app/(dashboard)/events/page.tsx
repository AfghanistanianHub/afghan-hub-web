import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{
    q?: string | string[];
    format?: string | string[];
    city?: string | string[];
    view?: string | string[];
    month?: string | string[];
  }>;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

function getMonth(value: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
    const now = new Date();
    return { year: now.getUTCFullYear(), monthIndex: now.getUTCMonth() };
  }

  const [year, month] = value.split("-").map(Number);
  return { year, monthIndex: month - 1 };
}

function getMonthKey(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
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
  const view = getSearchValue(params.view, 20) === "calendar"
    ? "calendar"
    : "list";
  const requestedMonth = getSearchValue(params.month, 7);
  const { year, monthIndex } = getMonth(requestedMonth);
  const monthKey = getMonthKey(year, monthIndex);
  const monthStart = new Date(Date.UTC(year, monthIndex, 1));
  const nextMonthStart = new Date(Date.UTC(year, monthIndex + 1, 1));
  const previousMonth = new Date(Date.UTC(year, monthIndex - 1, 1));
  const followingMonth = new Date(Date.UTC(year, monthIndex + 1, 1));
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
    .order("starts_at", { ascending: true });

  eventsQuery =
    view === "calendar"
      ? eventsQuery
          .gte("starts_at", monthStart.toISOString())
          .lt("starts_at", nextMonthStart.toISOString())
      : eventsQuery.gte("starts_at", now);

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
  const makeHref = (
    targetView: "list" | "calendar",
    targetMonth?: string,
  ) => {
    const nextParams = new URLSearchParams();

    if (search) nextParams.set("q", search);
    if (city) nextParams.set("city", city);
    if (format !== "all") nextParams.set("format", format);
    if (targetView === "calendar") {
      nextParams.set("view", "calendar");
      nextParams.set("month", targetMonth ?? monthKey);
    }

    const query = nextParams.toString();
    return query ? `/events?${query}` : "/events";
  };

  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const firstWeekday = monthStart.getUTCDay();
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const calendarDays = Array.from({ length: totalCells }, (_, index) => {
    const day = index - firstWeekday + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });
  const eventsByDay = new Map<number, NonNullable<typeof events>>();

  for (const event of events ?? []) {
    const eventDate = new Date(event.starts_at);

    if (
      eventDate.getUTCFullYear() === year &&
      eventDate.getUTCMonth() === monthIndex
    ) {
      const day = eventDate.getUTCDate();
      const dayEvents = eventsByDay.get(day) ?? [];
      dayEvents.push(event);
      eventsByDay.set(day, dayEvents);
    }
  }

  const monthLabel = monthStart.toLocaleDateString("en-CA", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

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
        {view === "calendar" ? (
          <>
            <input type="hidden" name="view" value="calendar" />
            <input type="hidden" name="month" value={monthKey} />
          </>
        ) : null}

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
              href={view === "calendar" ? `/events?view=calendar&month=${monthKey}` : "/events"}
              className="rounded-lg border border-slate-700 px-4 py-3 font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-slate-400">
          {error
            ? "Events could not be loaded."
            : `${events?.length ?? 0} ${events?.length === 1 ? "event" : "events"} found`}
        </p>

        <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900 p-1">
          <Link
            href={makeHref("list")}
            aria-current={view === "list" ? "page" : undefined}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              view === "list"
                ? "bg-emerald-500 text-slate-950"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            List
          </Link>
          <Link
            href={makeHref("calendar")}
            aria-current={view === "calendar" ? "page" : undefined}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
              view === "calendar"
                ? "bg-emerald-500 text-slate-950"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            Calendar
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 p-8 text-center text-red-200">
          We could not load events. Please try again.
        </div>
      ) : view === "calendar" ? (
        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <Link
              href={makeHref(
                "calendar",
                getMonthKey(
                  previousMonth.getUTCFullYear(),
                  previousMonth.getUTCMonth(),
                ),
              )}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Previous
            </Link>
            <h2 className="text-xl font-bold">{monthLabel}</h2>
            <Link
              href={makeHref(
                "calendar",
                getMonthKey(
                  followingMonth.getUTCFullYear(),
                  followingMonth.getUTCMonth(),
                ),
              )}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Next
            </Link>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <div className="grid min-w-[760px] grid-cols-7 bg-slate-950">
              {WEEKDAYS.map((weekday) => (
                <div
                  key={weekday}
                  className="border-b border-r border-slate-800 px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-500 last:border-r-0"
                >
                  {weekday}
                </div>
              ))}

              {calendarDays.map((day, index) => {
                const dayEvents = day ? eventsByDay.get(day) ?? [] : [];

                return (
                  <div
                    key={index}
                    className="min-h-32 border-b border-r border-slate-800 bg-slate-900/40 p-2 [&:nth-child(7n)]:border-r-0"
                  >
                    {day ? (
                      <>
                        <p className="text-sm font-semibold text-slate-400">
                          {day}
                        </p>
                        <div className="mt-2 space-y-2">
                          {dayEvents.map((event) => (
                            <Link
                              key={event.id}
                              href={`/events/${event.slug}`}
                              className="block rounded-md border border-emerald-500/20 bg-emerald-500/10 p-2 text-xs text-emerald-100 transition hover:border-emerald-400"
                            >
                              <span className="block font-semibold">
                                {event.title}
                              </span>
                              <span className="mt-1 block text-emerald-300/80">
                                {new Date(event.starts_at).toLocaleTimeString(
                                  "en-CA",
                                  {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    timeZone: "UTC",
                                  },
                                )}{" "}
                                UTC
                              </span>
                            </Link>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {!events?.length ? (
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-center text-slate-400">
              No matching events in {monthLabel}.
            </div>
          ) : null}
        </section>
      ) : (
        <div className="mt-6 space-y-6">
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
            </div>
          )}
        </div>
      )}
    </main>
  );
}
