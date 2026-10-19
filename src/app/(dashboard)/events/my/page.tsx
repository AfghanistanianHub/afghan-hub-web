import { MemberPageHeader } from "@/components/catalog/member-page-header";
import { catalogPageContainerClass, catalogClearClass, catalogSubmitClass } from "@/components/catalog/catalog-filter-styles";
import Link from "next/link";
import styles from "@/components/network/network-surfaces.module.css";
import { redirect } from "next/navigation";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
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
      className={`${styles.surface} ${styles.profile} border border-border bg-card group relative block overflow-hidden rounded-[var(--radius)] p-5 transition  hover:border-primary/30  focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}
    >
      
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

      <div className="relative mt-3 flex items-start justify-between gap-3"><h3 className="break-words text-lg font-bold leading-6 text-foreground transition group-hover:text-primary">{event.title}</h3><ArrowUpRight data-profile-arrow aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground"/></div>

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
    <main className={catalogPageContainerClass}>
      <MemberPageHeader title="My events" description="Keep track of events you registered for and events you are hosting." icon={CalendarDays}>
        <Link href="/events" className={catalogClearClass}>Browse events</Link>
        <Link href="/events/new" className={catalogSubmitClass}>Create Event</Link>
      </MemberPageHeader>

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
          <div className="relative mt-5 overflow-hidden rounded-[var(--radius)] border border-dashed border-border/80 bg-muted/25 px-6 py-10 text-center ">
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
          <details className="mt-6 rounded-[var(--radius)] border border-border bg-muted/30 p-5">
            <summary className={`${styles.control} cursor-pointer rounded-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}>
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
          <div className="mt-5 rounded-[var(--radius)] border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
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
