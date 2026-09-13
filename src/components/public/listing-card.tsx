import Link from "next/link";
import { ArrowUpRight, MapPin, BriefcaseBusiness, CalendarDays, Building2, UsersRound } from "lucide-react";
import type { PublicListing } from "@/lib/public-content";
import { publicHref, type PublicKind } from "@/lib/public-catalog";
import { formatOpportunityDeadline } from "@/lib/opportunities";

export function ListingDate({ item, kind }: { item: PublicListing; kind: PublicKind }) {
  if (!item.date) return null;
  return <time dateTime={item.date}>{kind === "opportunities" ? `Apply by ${formatOpportunityDeadline(item.date)}` : new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(item.date)) + " UTC"}</time>;
}

export function ListingCard({ item, kind }: { item: PublicListing; kind: PublicKind }) {
  const Icon = { opportunities: BriefcaseBusiness, events: CalendarDays, businesses: Building2, organizations: UsersRound }[kind];
  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-[0_1px_2px_rgb(15_23_42/0.03),0_14px_36px_rgb(15_23_42/0.04)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_8px_26px_rgb(15_23_42/0.08)] focus-within:border-primary/40">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/70 via-primary/25 to-transparent opacity-70" />
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
            <Icon aria-hidden="true" className="size-5" />
          </span>
          <p className="min-w-0 break-words text-xs font-semibold uppercase leading-5 tracking-[0.16em] text-primary">{item.category}</p>
        </div>
        <ArrowUpRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>

      <h3 className="mt-5 break-words text-xl font-semibold leading-snug tracking-tight">
        <Link className="outline-offset-4 before:absolute before:inset-0 before:content-[''] focus-visible:outline-2" href={publicHref(kind, item.slug)}>
          {item.title}
        </Link>
      </h3>

      <p className="mt-3 line-clamp-3 break-words text-sm leading-6 text-muted-foreground">
        {item.summary || "Explore this community listing to learn more."}
      </p>

      <div className="mt-auto space-y-2 border-t border-border/70 pt-5 text-xs leading-5 text-muted-foreground">
        <p className="flex min-w-0 items-start gap-2">
          <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <span className="min-w-0 break-words">{item.location}</span>
        </p>
        <p className="font-medium text-foreground/75"><ListingDate item={item} kind={kind} /></p>
      </div>
    </article>
  );
}
