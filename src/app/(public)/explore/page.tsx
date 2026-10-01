import { CatalogIllustration } from "@/components/public/catalog-illustration";
import styles from "@/components/public/catalog.module.css";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Search,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { getPublicListings } from "@/lib/public-content";
import { publicCategories, publicKinds, isPublicKind, publicPageNumber } from "@/lib/public-catalog";
import { ListingCard } from "@/components/public/listing-card";

type Params = { type?: string | string[]; q?: string | string[]; page?: string | string[] };
type Props = { searchParams: Promise<Params> };

const icons = {
  opportunities: BriefcaseBusiness,
  events: CalendarDays,
  businesses: Building2,
  organizations: UsersRound,
};

function filters(params: Params) {
  return {
    kind: typeof params.type === "string" && isPublicKind(params.type) ? params.type : "opportunities" as const,
    search: typeof params.q === "string" ? params.q.trim().slice(0, 100) : "",
    page: publicPageNumber(params.page),
  };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { kind, search, page } = filters(await searchParams);
  return {
    title: `Explore ${publicCategories[kind].label.toLowerCase()}`,
    description: publicCategories[kind].description,
    robots: search ? { index: false, follow: true } : undefined,
    alternates: {
      canonical: `https://app.apnbc.ca/explore?type=${kind}${page > 1 ? `&page=${page}` : ""}`,
    },
  };
}

export default async function ExplorePage({ searchParams }: Props) {
  const { kind, search, page } = filters(await searchParams);
  const result = await getPublicListings(kind, { search, page });
  const ActiveIcon = icons[kind];
  const pageHref = (number: number) => {
    const query = new URLSearchParams({ type: kind, page: String(number) });
    if (search) query.set("q", search);
    return `/explore?${query}`;
  };

  return (
    <main id="main-content" data-catalog className={styles.catalog}>
      <section data-illustration-trigger className="relative overflow-hidden border-b border-border/70">
        <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className={styles.intro}>
            <div>
            <div className="inline-flex items-center gap-2 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles aria-hidden="true" className="size-3.5" />
              Explore Afghan Hub
            </div>
            <h1 className="mt-5 text-3xl font-medium tracking-tight sm:text-4xl">Find your next connection.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Afghan-led work, gatherings, and new possibilities. Find a place to connect.
            </p>
            </div>
            <div className={styles.introArt}><CatalogIllustration interactive kind={kind} /></div>
          </div>

          <nav aria-label="Listing categories" className={`${styles.categories} mt-9 grid grid-cols-2 gap-3 lg:grid-cols-4`}>
            {publicKinds.map(value => {
              const Icon = icons[value];
              const active = value === kind;
              return (
                <Link
                  key={value}
                  href={`/explore?type=${value}`}
                  aria-current={active ? "page" : undefined}
                  className={`group rounded-sm border p-4 transition-[border-color,background-color] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${
                    active
                      ? "border-primary bg-secondary text-foreground"
                      : "border-border bg-card hover:border-primary hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className={`flex size-10 items-center justify-center rounded-xl ${active ? "bg-background text-primary" : "bg-secondary text-primary"}`}>
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <ArrowRight aria-hidden="true" className={`mt-1 size-4 transition-transform group-hover:translate-x-0.5 ${active ? "text-primary" : "text-primary"}`} />
                  </div>
                  <p className="mt-4 font-semibold">{publicCategories[value].label}</p>
                  <p className={`mt-1 text-sm leading-6 ${active ? "text-muted-foreground" : "text-muted-foreground"}`}>
                    {publicCategories[value].description}
                  </p>
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <section aria-labelledby="results-heading" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <form action="/explore" className="rounded-3xl border border-border bg-card p-5">
            <input type="hidden" name="type" value={kind} />
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><Search aria-hidden="true" className="size-5" /></span>
              <div>
                <p className="font-semibold">Search this category</p>
                <p className="text-xs text-muted-foreground">Name, title, or keyword</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <label className="grid min-w-0 gap-2 text-sm font-medium">
                Search {publicCategories[kind].label.toLowerCase()}
                <input type="search" name="q" defaultValue={search} maxLength={100} placeholder="Type a keyword" className="min-w-0 rounded-xl border border-input bg-background px-4 py-3 outline-offset-2 focus-visible:outline-2" />
              </label>
              <button className="min-h-11 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Search</button>
            </div>
            {search && <Link href={`/explore?type=${kind}`} className="mt-3 inline-flex rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Clear search</Link>}
          </form>

          <div className="rounded-3xl border border-border bg-muted/35 p-5">
            <p className="text-sm font-semibold">Want to add something?</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Join Afghan Hub to contribute listings and connect with other members.</p>
            <Link href="/login?mode=join" className="relative mt-4 inline-flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/[0.06] px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Join the community <ArrowRight aria-hidden="true" className="size-4" /></Link>
          </div>
        </div>

        <div className="mt-10 min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary"><ActiveIcon aria-hidden="true" className="size-5" /></span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Currently browsing</p>
                  <h2 id="results-heading" className="mt-1 text-3xl font-semibold tracking-tight">{publicCategories[kind].label}</h2>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">{publicCategories[kind].description}</p>
            </div>
            {search && <p className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">Search: “{search}”</p>}
          </div>

          <div className="mt-8">
            {result.unavailable ? (
              <div role="status" aria-live="polite" className="relative overflow-hidden rounded-[1.75rem] border border-border/80 bg-card p-8">
                <h3 className="relative font-semibold text-foreground">Listings are temporarily unavailable.</h3>
                <p className="relative mt-2 text-sm leading-6 text-muted-foreground">Please try again in a moment.</p>
                <Link href={pageHref(page)} className="relative mt-4 inline-flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/[0.06] px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Try again <ArrowRight aria-hidden="true" className="size-4" /></Link>
              </div>
            ) : result.items.length ? (
              <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr))]">
                {result.items.map(item => <ListingCard key={item.slug} item={item} kind={kind} />)}
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-[1.75rem] border border-dashed border-border/80 bg-card/60 p-8">
                <h3 className="relative font-semibold text-foreground">{search ? "No listings match your search." : "No listings to show here yet."}</h3>
                <p className="relative mt-2 text-sm leading-6 text-muted-foreground">
                  {search ? "Try another name or clear your search." : "Check back for new community listings, or explore another category."}
                </p>
                {search ? (
                  <Link
                    href={`/explore?type=${kind}`}
                    className="relative mt-5 inline-flex rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    Clear search
                  </Link>
                ) : null}
              </div>
            )}
          </div>

          {!result.unavailable && (page > 1 || result.hasMore) && (
            <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center gap-3">
              {page > 1 && <Link href={pageHref(page - 1)} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><ArrowLeft aria-hidden="true" className="size-4" /> Previous</Link>}
              <span className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">Page {page}</span>
              {result.hasMore && <Link href={pageHref(page + 1)} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Next <ArrowRight aria-hidden="true" className="size-4" /></Link>}
            </nav>
          )}
        </div>
      </section>
    </main>
  );
}
