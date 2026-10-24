import { MemberPageHeader } from "@/components/catalog/member-page-header";
import { catalogPageContainerClass, catalogClearClass, catalogSubmitClass } from "@/components/catalog/catalog-filter-styles";
import Link from "next/link";
import styles from "@/components/network/network-surfaces.module.css";
import { redirect } from "next/navigation";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";

import { B, BDate } from "@/components/i18n/browse";
import type { BrowseCopyKey } from "@/lib/i18n/browse-copy";
import { createClient } from "@/lib/supabase/server";

const statusKeys: Record<string, BrowseCopyKey> = {
  draft: "myEvents.statusDraft",
  published: "myEvents.statusPublished",
  closed: "myEvents.statusClosed",
  rejected: "myEvents.statusRejected",
};

function getLocation(event: {
  is_online: boolean;
  venue_name: string | null;
  city: string | null;
  country: string | null;
}) {
  if (event.is_online) return null;

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
          <BDate value={event.starts_at} mode="shortDate" />
        </span>

        {showStatus ? (
          <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            <B k={statusKeys[event.status] ?? "myEvents.statusDraft"} />
          </span>
        ) : null}
      </div>

      <div className="relative mt-3 flex items-start justify-between gap-3"><h3 className="break-words text-lg font-bold leading-6 text-foreground transition group-hover:text-primary">{event.title}</h3><ArrowUpRight data-profile-arrow aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground rtl:-scale-x-100"/></div>

      {event.summary ? (
        <p className="relative mt-2 line-clamp-2 break-words text-sm leading-6 text-muted-foreground">
          {event.summary}
        </p>
      ) : null}

      <p className="relative mt-4 flex items-start gap-2 border-t border-border/70 pt-4 text-sm text-muted-foreground">
        <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span className="min-w-0 break-words">
          {location ? location : <B k="common.online" />}
        </span>
      </p>
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
      <MemberPageHeader title={<B k="myEvents.title" />} description={<B k="myEvents.description" />} icon={CalendarDays}>
        <Link href="/events" className={catalogClearClass}><B k="myEvents.browse" /></Link>
        <Link href="/events/new" className={catalogSubmitClass}><B k="events.create" /></Link>
      </MemberPageHeader>

      <section className="mt-10">
        <div>
          <h2 className="text-2xl font-bold text-foreground"><B k="myEvents.registered" /></h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <B k="myEvents.registeredBody" />
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
              <B k="myEvents.noUpcoming" />
            </h3>
            <p className="relative mt-2 text-sm leading-6 text-muted-foreground">
              <B k="myEvents.noUpcomingBody" />
            </p>
          </div>
        )}

        {pastRegistered.length ? (
          <details className="mt-6 rounded-[var(--radius)] border border-border bg-muted/30 p-5">
            <summary className={`${styles.control} cursor-pointer rounded-sm font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}>
              <B k="myEvents.past" values={{ count: pastRegistered.length }} />
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
          <h2 className="text-2xl font-bold text-foreground"><B k="myEvents.hosting" /></h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <B k="myEvents.hostingBody" />
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
              <B k="myEvents.noHosting" />
            </h3>
            <p className="relative mt-2 text-sm leading-6 text-muted-foreground">
              <B k="myEvents.noHostingBody" />
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
