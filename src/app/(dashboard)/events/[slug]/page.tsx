import { cancelEventRsvp, rsvpEvent } from "@/app/(dashboard)/events/actions";
import { DeleteEventButton } from "@/components/events/delete-event-button";
import Link from "next/link";
import { buildGoogleCalendarUrl } from "@/lib/calendar";
import { rankRelatedEvents } from "@/lib/listing-recommendations";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ExternalLink,
  MapPin,
  Monitor,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ rsvp?: string }> };
function formatDateTime(value: string | null) { if (!value) return null; return new Intl.DateTimeFormat("en-CA", { year:"numeric", month:"long", day:"numeric", hour:"numeric", minute:"2-digit", hour12:true }).format(new Date(value)); }
function formatDateParts(value: string) {
  const date = new Date(value);
  return {
    month: new Intl.DateTimeFormat("en-CA", { month: "short" }).format(date),
    day: new Intl.DateTimeFormat("en-CA", { day: "numeric" }).format(date),
  };
}

export default async function EventPage({ params, searchParams }: Props) {
  const [{ slug }, { rsvp }] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: event, error } = await supabase.from("events").select(`*,organization:organizations (name,slug)`).eq("slug", slug).single();
  if (error || !event) notFound();
  const { data: viewerProfile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle() : { data: null };
  const canModerate = viewerProfile?.role === "admin" || viewerProfile?.role === "moderator";
  const isOwner = user?.id === event.creator_id;
  if (event.status !== "published" && !isOwner && !canModerate) notFound();
  const [{ data: rsvpCountData }, { data: viewerRsvp }] = user && event.status === "published" ? await Promise.all([
    supabase.rpc("get_event_rsvp_count", { target_event_id: event.id }),
    supabase.from("event_rsvps").select("event_id").eq("event_id", event.id).eq("profile_id", user.id).maybeSingle(),
  ]) : [{ data: 0 }, { data: null }];
  const rsvpCount = Number(rsvpCountData ?? 0);
  const hasRsvp = Boolean(viewerRsvp);
  const now = new Date();
  const hasStarted = new Date(event.starts_at) <= now;
  const isFull = event.capacity !== null && rsvpCount >= event.capacity;
  const location = [event.city,event.province_state,event.country].filter(Boolean).join(", ");
  const calendarLocation = event.is_online ? event.online_url : [event.venue_name,event.address_line,location].filter(Boolean).join(", ");
  const eventUrl = `https://app.apnbc.ca/events/${event.slug}`;
  const googleCalendarUrl = buildGoogleCalendarUrl({ title:event.title, startsAt:event.starts_at, endsAt:event.ends_at, description:event.summary, location:calendarLocation, url:eventUrl });
  const dateParts = formatDateParts(event.starts_at);
  const { data: relatedCandidates } = event.status === "published"
    ? await supabase
        .from("events")
        .select("id,title,slug,summary,starts_at,city,province_state,country,venue_name,is_online")
        .eq("status", "published")
        .neq("id", event.id)
        .gte("starts_at", now.toISOString())
        .order("starts_at", { ascending: true })
        .limit(12)
    : { data: [] };
  const relatedEvents = rankRelatedEvents(event, relatedCandidates ?? [], 3);

  return <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
    <Link href="/events" className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:opacity-75"><ArrowLeft aria-hidden="true" className="size-4"/>Back to events</Link>

    <div className="mt-6 space-y-4">
      {rsvp === "joined" ? <div role="status" className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">You are registered for this event.</div> : null}
      {rsvp === "cancelled" ? <div role="status" className="rounded-2xl border border-border bg-muted/60 p-4 text-sm text-muted-foreground">Your registration was cancelled.</div> : null}
      {rsvp === "full" || rsvp === "started" ? <div className="rounded-2xl border border-accent/50 bg-accent/40 p-4 text-sm text-accent-foreground">{rsvp === "full" ? "This event has reached its capacity." : "Registration is closed because this event has started."}</div> : null}
      {rsvp === "error" ? <div role="alert" className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">We could not update your registration. Please try again.</div> : null}
      {event.status !== "published" ? <div className="rounded-2xl border border-accent/50 bg-accent/40 p-4 text-sm text-accent-foreground">{event.status === "draft" ? "This event is waiting for moderator approval and is not visible to the community yet." : `This event was not approved.${event.moderation_note ? ` Reason: ${event.moderation_note}` : ""} Edit it to submit it for review again.`}</div> : null}
    </div>

    <section className="relative mt-6 overflow-hidden rounded-[2rem] border border-border/80 bg-card shadow-[0_18px_60px_rgb(15_23_42/0.055)]">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_82%_10%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_30%),radial-gradient(circle_at_15%_75%,color-mix(in_oklab,var(--accent)_52%,transparent),transparent_30%)]"/>
      <div aria-hidden="true" className="absolute right-8 top-8 size-44 rounded-full border border-primary/10"/>
      <div aria-hidden="true" className="absolute right-20 top-20 size-24 rounded-full border border-dashed border-primary/15"/>

      <div className="relative grid gap-7 px-6 py-8 md:px-9 md:py-11 lg:grid-cols-[120px_minmax(0,1fr)_auto] lg:items-start">
        <div className="flex size-24 flex-col items-center justify-center rounded-[1.7rem] border border-primary/15 bg-background/88 text-center shadow-sm backdrop-blur lg:size-28">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{dateParts.month}</span>
          <span className="mt-1 text-4xl font-bold tracking-tight text-foreground">{dateParts.day}</span>
        </div>

        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              {event.is_online ? <Monitor aria-hidden="true" className="size-3.5"/> : <MapPin aria-hidden="true" className="size-3.5"/>}
              {event.is_online ? "Online event" : "In-person event"}
            </span>
            {!hasStarted && event.status === "published" ? <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-background/75 px-3 py-1.5 text-xs font-medium text-primary"><Sparkles aria-hidden="true" className="size-3"/>Upcoming</span> : null}
          </div>
          <h1 className="mt-5 text-3xl font-bold leading-[1.08] tracking-[-0.035em] text-foreground md:text-5xl">{event.title}</h1>
          {event.organization ? <p className="mt-4 text-sm text-muted-foreground">Hosted by <Link href={`/organizations/${event.organization.slug}`} className="font-semibold text-primary hover:underline">{event.organization.name}</Link></p> : <p className="mt-4 text-sm text-muted-foreground">Community event</p>}
          {event.summary ? <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{event.summary}</p> : null}
        </div>

        {isOwner ? <div className="flex shrink-0 flex-wrap gap-3 lg:justify-end">{event.status === "published" ? <Link href={`/events/${event.slug}/attendees`} className="rounded-xl border border-border bg-background/85 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">Attendees</Link> : null}<Link href={`/events/${event.slug}/edit`} className="rounded-xl border border-border bg-background/85 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">Edit</Link><DeleteEventButton slug={event.slug}/></div> : null}
      </div>

      <div className="relative grid border-t border-border/70 lg:grid-cols-[minmax(0,1fr)_350px]">
        <article className="min-w-0 px-6 py-8 md:px-9 md:py-10 lg:border-r lg:border-border/70">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-muted/30 p-4"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary"><CalendarDays aria-hidden="true" className="size-4"/></span><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Starts</p><p className="mt-1 text-sm font-semibold text-foreground">{formatDateTime(event.starts_at)}</p></div></div></div>
            <div className="rounded-2xl border border-border bg-muted/30 p-4"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">{event.is_online ? <Monitor aria-hidden="true" className="size-4"/> : <MapPin aria-hidden="true" className="size-4"/>}</span><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Where</p><p className="mt-1 truncate text-sm font-semibold text-foreground">{event.is_online ? "Online" : event.venue_name || location || "Location to be announced"}</p></div></div></div>
          </div>

          <p className="mt-9 text-xs font-semibold uppercase tracking-[0.18em] text-primary">About the event</p>
          <div className="mt-5 whitespace-pre-wrap text-[1.02rem] leading-8 text-foreground/88">{event.description}</div>

          <div className="mt-10 grid gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:grid-cols-2">
            {event.ends_at ? <p><strong className="text-foreground">Ends:</strong> {formatDateTime(event.ends_at)}</p> : null}
            {event.is_online ? event.online_url ? <p><strong className="text-foreground">Online:</strong> <a href={event.online_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Join event</a></p> : null : <>{event.venue_name ? <p><strong className="text-foreground">Venue:</strong> {event.venue_name}</p> : null}{event.address_line ? <p><strong className="text-foreground">Address:</strong> {event.address_line}</p> : null}</>}
            {location ? <p><strong className="text-foreground">Location:</strong> {location}</p> : null}{event.capacity ? <p><strong className="text-foreground">Capacity:</strong> {event.capacity}</p> : null}
          </div>
        </article>

        <aside className="bg-muted/25 px-6 py-8 md:px-8 lg:sticky lg:top-20 lg:h-fit">
          {event.status === "published" ? <>
            <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-primary"><UsersRound aria-hidden="true" className="size-4.5"/></span><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Attendance</p><p className="mt-0.5 text-lg font-bold text-foreground">{rsvpCount} {rsvpCount === 1 ? "person" : "people"} going</p></div></div>
            {event.capacity !== null ? <p className="mt-3 text-sm text-muted-foreground">{Math.max(event.capacity-rsvpCount,0)} spots remaining</p> : null}
            <div className="mt-5">{!isOwner && user && !hasStarted ? hasRsvp ? <form action={cancelEventRsvp}><input type="hidden" name="event_id" value={event.id}/><input type="hidden" name="slug" value={event.slug}/><button type="submit" className="w-full rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted">Cancel registration</button></form> : <form action={rsvpEvent}><input type="hidden" name="event_id" value={event.id}/><input type="hidden" name="slug" value={event.slug}/><button type="submit" disabled={isFull} className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground">{isFull ? "Event full" : "Register for this event"}</button></form> : isOwner ? <p className="rounded-xl bg-primary/5 px-4 py-3 text-sm font-medium text-primary">You are hosting this event.</p> : hasStarted ? <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">Registration closed</p> : null}</div>
          </> : null}

          <div className={`${event.status === "published" ? "mt-7 border-t border-border/70 pt-6" : ""}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Add to calendar</p>
            <div className="mt-4 grid gap-2"><a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted">Google Calendar <ExternalLink aria-hidden="true" className="size-3.5"/></a><a href={`/events/${event.slug}/calendar`} className="rounded-xl border border-border bg-background px-4 py-3 text-center text-sm font-semibold text-foreground hover:bg-muted">Download calendar file</a></div>
          </div>
        </aside>
      </div>
    </section>

    {relatedEvents.length ? <section className="mt-10" aria-labelledby="related-events-heading">
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Keep exploring</p><h2 id="related-events-heading" className="mt-2 text-2xl font-bold tracking-[-0.025em] text-foreground">Related events</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Upcoming events with similar topics or locations.</p></div>
        <Link href="/events" className="hidden items-center gap-2 text-sm font-semibold text-primary sm:inline-flex">View all<ArrowRight aria-hidden="true" className="size-4"/></Link>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">{relatedEvents.map((related)=>{const relatedParts=formatDateParts(related.starts_at);const relatedLocation=related.is_online?"Online":[related.venue_name,related.city,related.country].filter(Boolean).join(", ");return <Link key={related.id} href={`/events/${related.slug}`} className="group rounded-[1.5rem] border border-border/80 bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
        <div className="flex items-start justify-between gap-3"><span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary"><CalendarDays aria-hidden="true" className="size-3.5"/>{relatedParts.month} {relatedParts.day}</span><ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground transition group-hover:text-primary"/></div>
        <h3 className="mt-4 line-clamp-2 text-lg font-bold leading-snug text-foreground group-hover:text-primary">{related.title}</h3>
        {related.summary?<p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{related.summary}</p>:null}
        {relatedLocation?<p className="mt-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">{related.is_online?<Monitor aria-hidden="true" className="size-3.5 text-primary"/>:<MapPin aria-hidden="true" className="size-3.5 text-primary"/>}{relatedLocation}</p>:null}
      </Link>})}</div>
    </section>:null}
  </main>;
}
