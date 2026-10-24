import Link from "next/link";
import { ArrowUpRight, CalendarDays, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MemberPageHeader, DirectoryEmptyState } from "@/components/catalog/member-page-header";
import { B, BDate, BDatePhrase, BNumber, BWeekdays, BrowseField, BrowseSelect } from "@/components/i18n/browse";
import {
  catalogClearClass,
  catalogFieldClass,
  catalogFilterPanelClass,
  catalogPageContainerClass,
  catalogSubmitClass,
} from "@/components/catalog/catalog-filter-styles";

type Props = { searchParams: Promise<{ q?: string | string[]; format?: string | string[]; city?: string | string[]; view?: string | string[]; month?: string | string[] }> };

const FORMAT_OPTIONS = [
  { value: "all", key: "common.allFormats" },
  { value: "online", key: "common.online" },
  { value: "in-person", key: "common.inPerson" },
] as const;

const WEEKDAY_CELL_CLASS = "border-b border-r border-border px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground last:border-r-0";

function getOrganizationName(organization: { name: string } | { name: string }[] | null) { return Array.isArray(organization) ? organization[0]?.name : organization?.name }
function getSearchValue(value: string | string[] | undefined, maxLength = 100) { return typeof value === "string" ? value.trim().slice(0, maxLength) : "" }
function escapeLikePattern(value: string) { return value.replace(/[\\%_]/g, "\\$&") }
function getMonth(value: string) { if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) { const now = new Date(); return { year: now.getUTCFullYear(), monthIndex: now.getUTCMonth() } } const [year, month] = value.split("-").map(Number); return { year, monthIndex: month - 1 } }
function getMonthKey(year: number, monthIndex: number) { return `${year}-${String(monthIndex + 1).padStart(2, "0")}` }

export default async function EventsPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = getSearchValue(params.q);
  const city = getSearchValue(params.city, 80);
  const requestedFormat = getSearchValue(params.format, 20);
  const format = requestedFormat === "online" || requestedFormat === "in-person" ? requestedFormat : "all";
  const view = getSearchValue(params.view, 20) === "calendar" ? "calendar" : "list";
  const requestedMonth = getSearchValue(params.month, 7);
  const { year, monthIndex } = getMonth(requestedMonth);
  const monthKey = getMonthKey(year, monthIndex);
  const monthStart = new Date(Date.UTC(year, monthIndex, 1));
  const nextMonthStart = new Date(Date.UTC(year, monthIndex + 1, 1));
  const previousMonth = new Date(Date.UTC(year, monthIndex - 1, 1));
  const followingMonth = new Date(Date.UTC(year, monthIndex + 1, 1));
  const supabase = await createClient();
  const now = new Date().toISOString();
  let eventsQuery = supabase.from("events").select(`id,title,slug,summary,starts_at,ends_at,city,country,venue_name,is_online,organization:organizations(name,slug)`).eq("status", "published").order("starts_at", { ascending: true });
  eventsQuery = view === "calendar" ? eventsQuery.gte("starts_at", monthStart.toISOString()).lt("starts_at", nextMonthStart.toISOString()) : eventsQuery.gte("starts_at", now);
  if (search) eventsQuery = eventsQuery.ilike("title", `%${escapeLikePattern(search)}%`);
  if (city) eventsQuery = eventsQuery.ilike("city", `%${escapeLikePattern(city)}%`);
  if (format !== "all") eventsQuery = eventsQuery.eq("is_online", format === "online");
  const { data: events, error } = await eventsQuery;
  const hasFilters = Boolean(search || city || format !== "all");
  const count = events?.length ?? 0;
  const makeHref = (targetView: "list" | "calendar", targetMonth?: string) => {
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
    if (eventDate.getUTCFullYear() === year && eventDate.getUTCMonth() === monthIndex) {
      const day = eventDate.getUTCDate();
      const dayEvents = eventsByDay.get(day) ?? [];
      dayEvents.push(event);
      eventsByDay.set(day, dayEvents);
    }
  }

  return (
    <main data-illustration-focus-scope className={catalogPageContainerClass}>
      <MemberPageHeader title={<B k="events.title" />} description={<B k="events.description" />} icon={CalendarDays}>
        <Link href="/events/my" className={catalogClearClass}><B k="events.my" /></Link>
        <Link href="/events/new" className={catalogSubmitClass}><B k="events.create" /></Link>
      </MemberPageHeader>

      <form action="/events" method="get" className={`${catalogFilterPanelClass} md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]`}>
        {view === "calendar" ? <>
          <input type="hidden" name="view" value="calendar"/>
          <input type="hidden" name="month" value={monthKey}/>
        </> : null}
        <BrowseField labelKey="events.search" name="q" defaultValue={search} placeholderKey="events.searchPlaceholder" className={catalogFieldClass} icon={<Search aria-hidden="true" className="size-4 text-primary"/>} />
        <BrowseSelect labelKey="common.format" name="format" defaultValue={format} className={catalogFieldClass} options={FORMAT_OPTIONS} />
        <BrowseField labelKey="common.city" name="city" defaultValue={city} placeholderKey="common.anyCity" className={catalogFieldClass} />
        <div className="flex items-end gap-3">
          <button type="submit" className={catalogSubmitClass}><B k="common.apply" /></button>
          {hasFilters ? <Link href={view === "calendar" ? `/events?view=calendar&month=${monthKey}` : "/events"} className={catalogClearClass}><B k="common.clear" /></Link> : null}
        </div>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {error ? <B k="events.loadError" /> : <B k={count === 1 ? "events.countOne" : "events.countMany"} values={{ count }} />}
        </p>
        <div className="inline-flex rounded-[var(--radius)] border border-border bg-card p-1">
          <Link href={makeHref("list")} aria-current={view === "list" ? "page" : undefined} className={`rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><B k="events.list" /></Link>
          <Link href={makeHref("calendar")} aria-current={view === "calendar" ? "page" : undefined} className={`rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${view === "calendar" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><B k="events.calendar" /></Link>
        </div>
      </div>

      {error ? (
        <div role="alert" aria-live="assertive" className="relative mt-6 overflow-hidden rounded-[var(--radius)] border border-destructive/20 bg-destructive/5 p-8 text-center text-destructive">
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-destructive/[0.06] blur-3xl"/>
          <B k="events.loadErrorBody" />
        </div>
      ) : view === "calendar" ? (
        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <Link href={makeHref("calendar", getMonthKey(previousMonth.getUTCFullYear(), previousMonth.getUTCMonth()))} className="rounded-[var(--radius)] border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><B k="events.previous" /></Link>
            <h2 className="text-xl font-bold text-foreground"><BDate value={monthStart} mode="monthYear" /></h2>
            <Link href={makeHref("calendar", getMonthKey(followingMonth.getUTCFullYear(), followingMonth.getUTCMonth()))} className="rounded-[var(--radius)] border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><B k="events.next" /></Link>
          </div>
          <div className="surface-panel overflow-x-auto rounded-[var(--radius)]">
            <div className="grid min-w-[760px] grid-cols-7 bg-card">
              <BWeekdays className={WEEKDAY_CELL_CLASS} />
              {calendarDays.map((day, index) => {
                const dayEvents = day ? eventsByDay.get(day) ?? [] : [];
                return <div key={index} className="min-h-32 border-b border-r border-border bg-background/40 p-2 [&:nth-child(7n)]:border-r-0">
                  {day ? <>
                    <p className="text-sm font-semibold text-muted-foreground"><BNumber value={day} /></p>
                    <div className="mt-2 space-y-2">
                      {dayEvents.map((event) => <Link key={event.id} href={`/events/${event.slug}`} className="block rounded-lg border border-primary/15 bg-primary/8 p-2 text-xs text-foreground transition hover:border-primary/30 hover:bg-primary/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                        <span className="block font-semibold">{event.title}</span>
                        <BDate value={event.starts_at} mode="time" timeZoneName="short" className="mt-1 block text-primary" />
                      </Link>)}
                    </div>
                  </> : null}
                </div>;
              })}
            </div>
          </div>
          {!events?.length ? <DirectoryEmptyState title={<BDatePhrase k="events.monthEmpty" date={monthStart} />} description={<B k="events.monthEmptyBody" />} href="/events/new" action={<B k="events.create" />} /> : null}
        </section>
      ) : (
        <div className="mt-4 border-t border-border">
          {events?.length ? events.map((event) => (
            <Link key={event.id} href={`/events/${event.slug}`} className="group block border-b border-border bg-card px-4 py-5 transition hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary">
              <div className="relative flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary"><B k={event.is_online ? "common.online" : "common.inPerson"} /></span>
                <BDate value={event.starts_at} mode="datetime" timeZoneName="short" className="font-semibold text-foreground" />
              </div>
              <div className="relative mt-4 flex items-start justify-between gap-4">
                <h2 className="break-words text-xl font-semibold tracking-tight text-foreground transition group-hover:text-primary md:text-2xl">{event.title}</h2>
                <ArrowUpRight aria-hidden="true" data-profile-arrow className="mt-1 size-4 shrink-0 text-muted-foreground"/>
              </div>
              {event.organization ? <p className="relative mt-2 text-sm text-primary"><B k="events.hostedBy" values={{ name: getOrganizationName(event.organization) ?? "" }} /></p> : <p className="relative mt-2 text-sm text-muted-foreground"><B k="events.communityEvent" /></p>}
              {event.summary ? <p className="relative mt-3 line-clamp-3 break-words leading-7 text-muted-foreground">{event.summary}</p> : null}
              <div className="relative mt-4 flex flex-wrap gap-6 border-t border-border/70 pt-4 text-sm text-muted-foreground">
                {event.venue_name ? <span>{event.venue_name}</span> : null}
                {event.city ? <span>{event.city}</span> : null}
                {event.country ? <span>{event.country}</span> : null}
              </div>
            </Link>
          )) : <DirectoryEmptyState title={<B k={hasFilters ? "events.emptyFiltered" : "events.empty"} />} description={<B k={hasFilters ? "events.emptyFilteredBody" : "events.emptyBody"} />} href={hasFilters ? "/events" : "/events/new"} action={<B k={hasFilters ? "common.clearFilters" : "events.create"} />} />}
        </div>
      )}
    </main>
  );
}
