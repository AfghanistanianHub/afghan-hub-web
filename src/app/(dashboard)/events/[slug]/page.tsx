import { PendingSubmitButton } from "@/components/forms/pending-submit-button";
import { ContextualAssistantPrompt } from "@/components/assistant/contextual-assistant-prompt";
import { MemberListingArtwork } from "@/components/public/member-listing-artwork";
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
import { B, BDate } from "@/components/i18n/browse";
import { eventActionErrorKey } from "@/lib/i18n/browse-copy";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ rsvp?: string; error?: string }> };

export default async function EventPage({ params, searchParams }: Props) {
  const [{ slug }, { rsvp, error: actionError }] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: event, error } = await supabase.from("events").select(`id,creator_id,business_id,organization_id,title,slug,summary,description,venue_name,address_line,city,province_state,country,is_online,online_url,starts_at,ends_at,capacity,status,created_at,updated_at,organization:organizations (name,slug)`).eq("slug", slug).single();
  if (error || !event) notFound();
  const { data: moderationFeedback } = user && event.status !== "published"
    ? await supabase.rpc("get_listing_moderation_feedback", {
        target_entity_type: "event",
        target_entity_id: event.id,
      })
    : { data: null };
  const moderationNote = moderationFeedback?.[0]?.moderation_note ?? null;

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

  return <main data-illustration-focus-scope className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
    <Link href="/events" className="inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-primary transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180"/><B k="detail.backToEvents" /></Link>

    <div className="mt-6 space-y-4">
      {rsvp === "joined" ? <div role="status" aria-live="polite" className="rounded-[var(--radius)] border border-primary/20 bg-primary/5 p-4 text-sm text-foreground"><B k="eventDetail.rsvpJoined" /></div> : null}
      {rsvp === "cancelled" ? <div role="status" aria-live="polite" className="rounded-[var(--radius)] border border-border bg-muted/60 p-4 text-sm text-muted-foreground"><B k="eventDetail.rsvpCancelled" /></div> : null}
      {rsvp === "full" || rsvp === "started" ? <div role="status" aria-live="polite" className="rounded-[var(--radius)] border border-accent/50 bg-accent/40 p-4 text-sm text-accent-foreground"><B k={rsvp === "full" ? "eventDetail.rsvpFull" : "eventDetail.rsvpStarted"} /></div> : null}
      {rsvp === "error" ? <div role="alert" aria-live="assertive" className="rounded-[var(--radius)] border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"><B k="eventDetail.rsvpError" /></div> : null}
      {actionError ? <div role="alert" aria-live="assertive" className="rounded-[var(--radius)] border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"><B k={eventActionErrorKey(actionError)} /></div> : null}
      {event.status !== "published" ? <div role="status" aria-live="polite" className="rounded-[var(--radius)] border border-accent/50 bg-accent/40 p-4 text-sm leading-6 text-accent-foreground">{event.status === "draft" ? <B k="eventDetail.draft" /> : moderationNote ? <B k="eventDetail.rejectedReason" values={{ reason: moderationNote }} /> : <B k="eventDetail.rejected" />}</div> : null}
    </div>

    <section data-illustration-trigger className="relative mt-6 overflow-hidden rounded-sm border border-border bg-card">
      <MemberListingArtwork kind="events" />
      <div className="relative grid gap-7 px-6 py-8 md:px-9 md:py-11 lg:grid-cols-[120px_minmax(0,1fr)_auto] lg:items-start">
        <div className="flex size-24 flex-col items-center justify-center rounded-[var(--radius)] border border-primary/15 bg-background text-center shadow-sm lg:size-28">
          <BDate value={event.starts_at} mode="monthShort" className="text-xs font-bold uppercase tracking-[0.2em] text-primary" />
          <BDate value={event.starts_at} mode="day" className="mt-1 text-4xl font-bold tracking-tight text-foreground" />
        </div>

        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              {event.is_online ? <Monitor aria-hidden="true" className="size-3.5"/> : <MapPin aria-hidden="true" className="size-3.5"/>}
              {event.is_online ? <B k="eventDetail.onlineEvent" /> : <B k="eventDetail.inPersonEvent" />}
            </span>
            {!hasStarted && event.status === "published" ? <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-background px-3 py-1.5 text-xs font-medium text-primary"><Sparkles aria-hidden="true" className="size-3"/><B k="eventDetail.upcoming" /></span> : null}
          </div>
          <h1 className="mt-5 break-words text-3xl font-medium leading-[1.08] tracking-[-0.035em] text-foreground md:text-4xl">{event.title}</h1>
          {event.organization ? <p className="mt-4 text-sm text-muted-foreground"><B k="common.hostedBy" /> <Link href={`/organizations/${event.organization.slug}`} className="rounded-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{event.organization.name}</Link></p> : <p className="mt-4 text-sm text-muted-foreground"><B k="events.communityEvent" /></p>}
          {event.summary ? <p className="mt-5 max-w-2xl break-words text-lg leading-8 text-muted-foreground">{event.summary}</p> : null}
        </div>

        {isOwner ? <div className="flex shrink-0 flex-wrap gap-3 lg:justify-end">{event.status === "published" ? <Link href={`/events/${event.slug}/attendees`} className="rounded-[var(--radius-control)] border border-border bg-background/85 px-4 py-2.5 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><B k="eventDetail.attendees" /></Link> : null}<Link href={`/events/${event.slug}/edit`} className="rounded-[var(--radius-control)] border border-border bg-background/85 px-4 py-2.5 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><B k="common.edit" /></Link><DeleteEventButton slug={event.slug}/></div> : null}
      </div>

      <div className="relative grid border-t border-border/70 lg:grid-cols-[minmax(0,1fr)_350px]">
        <article className="min-w-0 px-6 py-8 md:px-9 md:py-10 lg:border-r lg:border-border/70">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--radius)] border border-border bg-muted/30 p-4"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-[var(--radius-control)] bg-secondary text-primary"><CalendarDays aria-hidden="true" className="size-4"/></span><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"><B k="eventDetail.starts" /></p><BDate value={event.starts_at} mode="datetime" timeZoneName="short" className="mt-1 block text-sm font-semibold text-foreground" /></div></div></div>
            <div className="rounded-[var(--radius)] border border-border bg-muted/30 p-4"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-[var(--radius-control)] bg-secondary text-primary">{event.is_online ? <Monitor aria-hidden="true" className="size-4"/> : <MapPin aria-hidden="true" className="size-4"/>}</span><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"><B k="eventDetail.where" /></p><p className="mt-1 break-words text-sm font-semibold text-foreground">{event.is_online ? <B k="common.online" /> : event.venue_name || location || <B k="eventDetail.tba" />}</p></div></div></div>
          </div>

          <B k="eventDetail.about" className="mt-9 block text-xs font-semibold uppercase tracking-[0.18em] text-primary" />
          <div className="mt-5 whitespace-pre-wrap break-words text-[1.02rem] leading-8 text-foreground/88">{event.description}</div>

          <div className="mt-10 grid gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:grid-cols-2">
            {event.ends_at ? <p><strong className="text-foreground"><B k="eventDetail.ends" /></strong> <BDate value={event.ends_at} mode="datetime" timeZoneName="short" /></p> : null}
            {event.is_online ? event.online_url ? <p><strong className="text-foreground"><B k="eventDetail.online" /></strong> <a href={event.online_url} target="_blank" rel="noopener noreferrer" className="rounded-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><B k="eventDetail.joinEvent" /></a></p> : null : <>{event.venue_name ? <p><strong className="text-foreground"><B k="eventDetail.venue" /></strong> {event.venue_name}</p> : null}{event.address_line ? <p><strong className="text-foreground"><B k="eventDetail.address" /></strong> {event.address_line}</p> : null}</>}
            {location ? <p><strong className="text-foreground"><B k="eventDetail.location" /></strong> {location}</p> : null}{event.capacity ? <p><strong className="text-foreground"><B k="eventDetail.capacity" /></strong> {event.capacity}</p> : null}
          </div>
        </article>

        <aside className="bg-muted/25 px-6 py-8 md:px-8 lg:sticky lg:top-20 lg:h-fit">
          {event.status === "published" ? (
            <div className="mb-6 flex flex-wrap gap-2">
              <ContextualAssistantPrompt
                label={<B k="eventDetail.findSimilar" />}
                query={`Find events similar to ${event.title}`}
              />
              <ContextualAssistantPrompt
                label={<B k="eventDetail.findOrganizations" />}
                query={`Find organizations related to ${event.title}`}
              />
            </div>
          ) : null}

          {event.status === "published" ? <>
            <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-[var(--radius-control)] bg-secondary text-primary"><UsersRound aria-hidden="true" className="size-4.5"/></span><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"><B k="eventDetail.attendance" /></p><p className="mt-0.5 text-lg font-bold text-foreground"><B k={rsvpCount === 1 ? "eventDetail.goingOne" : "eventDetail.goingMany"} values={{ count: rsvpCount }} /></p></div></div>
            {event.capacity !== null ? <p className="mt-3 text-sm text-muted-foreground"><B k="eventDetail.spots" values={{ count: Math.max(event.capacity-rsvpCount,0) }} /></p> : null}
            <div className="mt-5">{!isOwner && user && !hasStarted ? hasRsvp ? <form action={cancelEventRsvp}><input type="hidden" name="event_id" value={event.id}/><input type="hidden" name="slug" value={event.slug}/><PendingSubmitButton pendingLabel={<B k="eventDetail.cancelling" />} className="min-h-11 w-full rounded-[var(--radius)] border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors motion-reduce:transition-none active:brightness-95 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><B k="eventDetail.cancelRegistration" /></PendingSubmitButton></form> : <form action={rsvpEvent}><input type="hidden" name="event_id" value={event.id}/><input type="hidden" name="slug" value={event.slug}/><PendingSubmitButton pendingLabel={<B k="eventDetail.registering" />} disabled={isFull} className="min-h-11 w-full rounded-[var(--radius)] bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-colors motion-reduce:transition-none active:brightness-95 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground">{isFull ? <B k="eventDetail.full" /> : <B k="eventDetail.register" />}</PendingSubmitButton></form> : isOwner ? <p className="rounded-[var(--radius-control)] bg-primary/5 px-4 py-3 text-sm font-medium text-primary"><B k="eventDetail.hosting" /></p> : hasStarted ? <p className="rounded-[var(--radius-control)] bg-muted px-4 py-3 text-sm text-muted-foreground"><B k="eventDetail.registrationClosed" /></p> : null}</div>
          </> : null}

          <div className={`${event.status === "published" ? "mt-7 border-t border-border/70 pt-6" : ""}`}>
            <B k="eventDetail.addToCalendar" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground" />
            <div className="mt-4 grid gap-2"><a href={googleCalendarUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><B k="eventDetail.googleCalendar" /> <ExternalLink aria-hidden="true" className="size-3.5"/></a><a href={`/events/${event.slug}/calendar`} className="rounded-[var(--radius-control)] border border-border bg-background px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><B k="eventDetail.downloadIcs" /></a></div>
          </div>
        </aside>
      </div>
    </section>

    {relatedEvents.length ? <section className="mt-10" aria-labelledby="related-events-heading">
      <div className="flex items-end justify-between gap-4">
        <div><B k="common.keepExploring" className="text-xs font-semibold uppercase tracking-[0.18em] text-primary" /><h2 id="related-events-heading" className="mt-2 text-2xl font-bold tracking-[-0.025em] text-foreground"><B k="eventDetail.related" /></h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground"><B k="eventDetail.relatedBody" /></p></div>
        <Link href="/events" className="hidden items-center gap-2 rounded-sm text-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:inline-flex"><B k="common.viewAll" /><ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180"/></Link>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">{relatedEvents.map((related)=>{const relatedLocation=related.is_online?null:[related.venue_name,related.city,related.country].filter(Boolean).join(", ");return <Link key={related.id} href={`/events/${related.slug}`} className="group rounded-[var(--radius)] border border-border/80 bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
        <div className="flex items-start justify-between gap-3"><span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary"><CalendarDays aria-hidden="true" className="size-3.5"/><BDate value={related.starts_at} mode="monthDay" /></span><ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground transition group-hover:text-primary"/></div>
        <h3 className="mt-4 line-clamp-2 text-lg font-bold leading-snug text-foreground group-hover:text-primary">{related.title}</h3>
        {related.summary?<p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{related.summary}</p>:null}
        {related.is_online || relatedLocation?<p className="mt-5 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">{related.is_online?<Monitor aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-primary"/>:<MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-primary"/>}<span className="min-w-0 break-words">{related.is_online?<B k="common.online" />:relatedLocation}</span></p>:null}
      </Link>})}</div>
    </section>:null}
  </main>;
}
