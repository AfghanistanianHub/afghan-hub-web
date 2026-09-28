import Link from "next/link";
import { ArrowUpRight, MapPin, BriefcaseBusiness, CalendarDays, Building2, UsersRound } from "lucide-react";
import type { PublicListing } from "@/lib/public-content";
import { publicHref, type PublicKind } from "@/lib/public-catalog";
import { formatOpportunityDeadline } from "@/lib/opportunities";

export function ListingDate({ item, kind }: { item: PublicListing; kind: PublicKind }) {
  if (!item.date) return null;
  return <time dateTime={item.date}>{kind === "opportunities" ? `Apply by ${formatOpportunityDeadline(item.date)}` : new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(item.date)) + " UTC"}</time>;
}

const listingTones = {
  opportunities: "from-sky-100 via-blue-50 to-background text-sky-900",
  events: "from-amber-100 via-orange-50 to-background text-amber-900",
  businesses: "from-teal-100 via-cyan-50 to-background text-teal-900",
  organizations: "from-violet-100 via-indigo-50 to-background text-indigo-900",
} satisfies Record<PublicKind, string>;

export function ListingCard({ item, kind }: { item: PublicListing; kind: PublicKind }) {
  const Icon = { opportunities: BriefcaseBusiness, events: CalendarDays, businesses: Building2, organizations: UsersRound }[kind];
  return (
    <article className="@container group relative min-w-0 overflow-hidden rounded-3xl border border-border bg-card shadow-[0_1px_2px_rgb(15_23_42/0.03),0_14px_36px_rgb(15_23_42/0.04)] transition-[border-color,box-shadow] hover:border-primary/35 hover:shadow-[0_8px_26px_rgb(15_23_42/0.08)] focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/25 motion-reduce:transition-none">
      <div className="flex h-full flex-col @min-[34rem]:flex-row">
        <div aria-hidden="true" className={`relative flex h-32 shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br ${listingTones[kind]} @min-[34rem]:h-auto @min-[34rem]:w-48`}>
          <div className="absolute -right-6 -top-12 size-44 rounded-full border border-current opacity-10" />
          <div className="absolute -bottom-16 -left-6 size-44 rounded-full border border-current opacity-10" />
          <div className="absolute right-9 top-7 size-14 rotate-45 rounded-xl border border-current opacity-10" />
          <div className="relative flex size-16 -rotate-6 items-center justify-center rounded-2xl border border-white/90 bg-white/75 shadow-[0_8px_24px_rgb(15_23_42/0.06)] transition-transform duration-300 group-hover:rotate-0 group-focus-within:rotate-0 motion-reduce:transform-none motion-reduce:transition-none">
            <Icon className="size-8" strokeWidth={1.5} />
          </div>
          <span className="absolute bottom-4 right-5 flex gap-1.5">
            <span className="size-1 rounded-full bg-current opacity-30" />
            <span className="size-1 rounded-full bg-current opacity-20" />
            <span className="size-1 rounded-full bg-current opacity-10" />
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-6">
          <div className="flex items-start justify-between gap-4">
            <p className="min-w-0 break-words text-xs font-semibold uppercase leading-5 tracking-[0.14em] text-primary">{item.category}</p>
            <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary group-focus-within:text-primary motion-reduce:transition-none" />
          </div>

          <h3 className="mt-3 break-words text-xl font-semibold leading-snug tracking-tight">
            <Link className="outline-offset-4 before:absolute before:inset-0 before:content-[''] focus-visible:outline-2 focus-visible:outline-primary" href={publicHref(kind, item.slug)}>
              {item.title}
            </Link>
          </h3>

          <p className="mb-6 mt-3 line-clamp-3 break-words text-sm leading-6 text-muted-foreground">
            {item.summary || "Explore this community listing to learn more."}
          </p>

          <div className="mt-auto space-y-2 border-t border-border/70 pt-4 text-xs leading-5 text-muted-foreground">
            <p className="flex min-w-0 items-start gap-2">
              <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <span className="min-w-0 break-words">{item.location}</span>
            </p>
            {item.date ? <p className="font-medium text-foreground/75"><ListingDate item={item} kind={kind} /></p> : null}
          </div>
        </div>
      </div>
    </article>
  );
}
