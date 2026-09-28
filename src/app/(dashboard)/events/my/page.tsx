import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, CalendarDays, MapPin, Sparkles } from "lucide-react";
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
  if (event.is_online) return "Online";

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
      className="surface-panel group relative block overflow-hidden rounded-[1.5rem] p-5 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_16px_36px_rgb(15_23_42/0.06)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <div aria-hidden="true" className="absolute -right-8 -top-8 size-24 rounded-full border border-primary/10" />
      <div className="relative flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          {formatEventDate(event.starts_at)}
        </span>

        {showStatus ? (
          <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold capitalize text-muted-foreground">
            {event.status}
          </span>
        ) : null}
      </div>

      <div className="relative mt-3 flex items-start justify-between gap-3"><h3 className="break-words text-lg font-bold leading-6 text-foreground transition group-hover:text-primary">{event.title}</h3><ArrowUpRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"/></div>

      {event.summary ? (
        <p className="relative mt-2 line-clamp-2 break-words text-sm leading-6 text-muted-foreground">
          {event.summary}
        </p>
      ) : null}

      {location ? (
        <p className="relative mt-4 flex items-start gap-2 border-t border-border/70 pt-4 text-sm text-muted-foreground">
          <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span className="min-w-0 break-words">{location}</span>
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

  if (userError || !user) redirect("/login");

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

  const now = new Date().getTime();
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
      <section className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card px-6 py-8 shadow-[0_18px_55px_rgb(15_23_42/0.045)] md:px-8 md:py-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary/[0.07] blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-accent/45 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><Sparkles aria-hidden="true" className="size-3.5"/>Events</div>
          <h1 className="mt-5 text-3xl font-bold tracking-[-0.035em] text-foreground md:text-5xl">My events</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">Keep track of events you registered for and events you are hosting.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/events"
            className="rounded-2xl border border-border/80 bg-background/80 px-5 py-3 font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Browse events
          </Link>
          <Link
            href="/events/new"
            className="rounded-2xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-[0_10px_28px_color-mix(in_oklab,var(--primary)_16%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Create Event
          </Link>
        </div>
        </div>
      </section>

      <section className="mt-10">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Registered</h2>
          <p className="mt-1 text-sm text-muted-foreground">
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
          <div className="relative mt-5 overflow-hidden rounded-[1.75rem] border border-dashed border-border/80 bg-muted/25 px-6 py-10 text-center shadow-[0_10px_30px_rgb(15_23_42/0.025)]"><div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/[0.05] blur-3xl"/>
            <CalendarDays aria-hidden="true" className="relative mx-auto size-9 text-primary" />
            <h3 className="relative mt-3 font-semibold text-foreground">
              No upcoming registrations
            </h3>
            <p className="relative mt-2 text-sm leading-6 text-muted-foreground">
              Register for an event and it will appear here.
            </p>
          </div>
        )}

        {pastRegistered.length ? (
          <details className="mt-6 rounded-2xl border border-border bg-muted/30 p-5">
            <summary className="cursor-pointer rounded-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
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

      <section className="mt-12 border-t border-border pt-10">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Hosting</h2>
          <p className="mt-1 text-sm text-muted-foreground">
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
          <div className="mt-5 rounded-3xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
            <CalendarDays aria-hidden="true" className="relative mx-auto size-9 text-primary" />
            <h3 className="relative mt-3 font-semibold text-foreground">
              You are not hosting any events yet
            </h3>
            <p className="relative mt-2 text-sm leading-6 text-muted-foreground">
              Create an event to submit it for moderation.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
