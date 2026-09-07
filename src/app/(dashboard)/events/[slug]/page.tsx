import { cancelEventRsvp, rsvpEvent } from "@/app/(dashboard)/events/actions";
import { DeleteEventButton } from "@/components/events/delete-event-button";
import Link from "next/link";
import { buildGoogleCalendarUrl } from "@/lib/calendar";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ rsvp?: string }> };
function formatDateTime(value: string | null) { if (!value) return null; return new Intl.DateTimeFormat("en-CA", { year:"numeric", month:"long", day:"numeric", hour:"numeric", minute:"2-digit", hour12:true }).format(new Date(value)); }

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
  const hasStarted = new Date(event.starts_at) <= new Date();
  const isFull = event.capacity !== null && rsvpCount >= event.capacity;
  const location = [event.city,event.province_state,event.country].filter(Boolean).join(", ");
  const calendarLocation = event.is_online ? event.online_url : [event.venue_name,event.address_line,location].filter(Boolean).join(", ");
  const eventUrl = `https://app.apnbc.ca/events/${event.slug}`;
  const googleCalendarUrl = buildGoogleCalendarUrl({ title:event.title, startsAt:event.starts_at, endsAt:event.ends_at, description:event.summary, location:calendarLocation, url:eventUrl });

  return <main className="mx-auto max-w-4xl px-6 py-10">
    {rsvp === "joined" ? <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">You are registered for this event.</div> : null}
    {rsvp === "cancelled" ? <div className="mb-6 rounded-xl border border-border bg-muted/60 p-4 text-sm text-muted-foreground">Your registration was cancelled.</div> : null}
    {rsvp === "full" || rsvp === "started" ? <div className="mb-6 rounded-xl border border-accent/50 bg-accent/40 p-4 text-sm text-accent-foreground">{rsvp === "full" ? "This event has reached its capacity." : "Registration is closed because this event has started."}</div> : null}
    {rsvp === "error" ? <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">We could not update your registration. Please try again.</div> : null}
    {event.status !== "published" ? <div className="mb-6 rounded-xl border border-accent/50 bg-accent/40 p-4 text-sm text-accent-foreground">{event.status === "draft" ? "This event is waiting for moderator approval and is not visible to the community yet." : `This event was not approved.${event.moderation_note ? ` Reason: ${event.moderation_note}` : ""} Edit it to submit it for review again.`}</div> : null}

    <section className="surface-panel overflow-hidden rounded-3xl">
      <div className="border-b border-border bg-primary/[0.035] px-8 py-8 md:px-10">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{event.is_online ? "Online event" : "In-person event"}</span><h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground">{event.title}</h1></div>{isOwner ? <div className="flex shrink-0 flex-wrap gap-3">{event.status === "published" ? <Link href={`/events/${event.slug}/attendees`} className="rounded-xl border border-border bg-card px-4 py-2 font-semibold text-foreground hover:bg-muted">Attendees</Link> : null}<Link href={`/events/${event.slug}/edit`} className="rounded-xl border border-border bg-card px-4 py-2 font-semibold text-foreground hover:bg-muted">Edit</Link><DeleteEventButton slug={event.slug}/></div> : null}</div>
        {event.organization ? <p className="mt-4 text-sm text-muted-foreground">Hosted by <Link href={`/organizations/${event.organization.slug}`} className="font-semibold text-primary hover:underline">{event.organization.name}</Link></p> : <p className="mt-4 text-sm text-muted-foreground">Community event</p>}
      </div>
      <div className="p-8 md:p-10"><p className="text-lg leading-8 text-muted-foreground">{event.summary}</p><div className="mt-8 whitespace-pre-wrap leading-8 text-foreground/90">{event.description}</div>
        <div className="mt-10 grid gap-4 border-t border-border pt-6 text-sm text-muted-foreground md:grid-cols-2">
          <p><strong className="text-foreground">Starts:</strong> {formatDateTime(event.starts_at)}</p>{event.ends_at ? <p><strong className="text-foreground">Ends:</strong> {formatDateTime(event.ends_at)}</p> : null}
          {event.is_online ? event.online_url ? <p><strong className="text-foreground">Online:</strong> <a href={event.online_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Join event</a></p> : null : <>{event.venue_name ? <p><strong className="text-foreground">Venue:</strong> {event.venue_name}</p> : null}{event.address_line ? <p><strong className="text-foreground">Address:</strong> {event.address_line}</p> : null}</>}
          {location ? <p><strong className="text-foreground">Location:</strong> {location}</p> : null}{event.capacity ? <p><strong className="text-foreground">Capacity:</strong> {event.capacity}</p> : null}
        </div>
        {event.status === "published" ? <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-border bg-muted/35 p-6"><h2 className="text-lg font-bold text-foreground">Event registration</h2><p className="mt-2 text-sm text-muted-foreground">{rsvpCount} {rsvpCount === 1 ? "person is" : "people are"} going{event.capacity !== null ? ` · ${Math.max(event.capacity-rsvpCount,0)} spots remaining` : ""}</p><div className="mt-5">{!isOwner && user && !hasStarted ? hasRsvp ? <form action={cancelEventRsvp}><input type="hidden" name="event_id" value={event.id}/><input type="hidden" name="slug" value={event.slug}/><button type="submit" className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted">Cancel registration</button></form> : <form action={rsvpEvent}><input type="hidden" name="event_id" value={event.id}/><input type="hidden" name="slug" value={event.slug}/><button type="submit" disabled={isFull} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground">{isFull ? "Event full" : "Register"}</button></form> : isOwner ? <p className="text-sm font-medium text-primary">You are hosting this event.</p> : hasStarted ? <p className="text-sm text-muted-foreground">Registration closed</p> : null}</div></section>
          <section className="rounded-2xl border border-border bg-muted/35 p-6"><h2 className="text-lg font-bold text-foreground">Add to calendar</h2><p className="mt-2 text-sm text-muted-foreground">Save the date in Google Calendar or download a calendar file for Apple Calendar, Outlook, and other apps.</p><div className="mt-5 flex flex-wrap gap-3"><a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90">Google Calendar</a><a href={`/events/${event.slug}/calendar`} className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted">Download calendar file</a></div></section>
        </div> : null}
      </div>
    </section>
  </main>;
}
