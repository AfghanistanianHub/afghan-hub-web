import { CatalogIllustration } from "./catalog-illustration";
import styles from "./catalog.module.css";
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
  return (
    <article className={`@container group relative min-w-0 overflow-hidden ${styles.listing}`}> 
      <div className="flex h-full flex-col @min-[34rem]:flex-row">
        <div aria-hidden="true" className={`${styles.cover} relative flex h-40 shrink-0 items-center justify-center overflow-hidden @min-[34rem]:h-auto @min-[34rem]:w-48`}>
          <CatalogIllustration kind={kind} />
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
