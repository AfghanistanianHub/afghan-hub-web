import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { PublicListing } from "@/lib/public-content";
import { publicHref, type PublicKind } from "@/lib/public-catalog";
import { formatOpportunityDeadline } from "@/lib/opportunities";

export function ListingDate({ item, kind }: { item: PublicListing; kind: PublicKind }) {
  if (!item.date) return null;
  return <time dateTime={item.date}>{kind === "opportunities" ? `Apply by ${formatOpportunityDeadline(item.date)}` : new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(item.date)) + " UTC"}</time>;
}

export function ListingCard({ item, kind }: { item: PublicListing; kind: PublicKind }) {
  return <article className="group flex min-w-0 flex-col rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40">
    <p className="text-xs font-semibold uppercase tracking-widest text-primary">{item.category}</p>
    <h3 className="mt-4 break-words text-xl font-semibold leading-snug"><Link className="outline-offset-4 hover:underline focus-visible:outline-2" href={publicHref(kind, item.slug)}>{item.title}<ArrowUpRight aria-hidden="true" className="ml-2 inline size-4" /></Link></h3>
    <p className="mt-3 line-clamp-3 break-words text-sm leading-6 text-muted-foreground">{item.summary || "Explore this community listing to learn more."}</p>
    <div className="mt-auto space-y-2 pt-6 text-xs leading-5 text-muted-foreground"><p className="flex items-start gap-2"><MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />{item.location}</p><p><ListingDate item={item} kind={kind} /></p></div>
  </article>;
}
