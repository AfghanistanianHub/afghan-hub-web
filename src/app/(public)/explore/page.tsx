import { CatalogResultsHeading } from "@/components/public/catalog-results-heading";
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
  Sparkles,
  UsersRound,
} from "lucide-react";
import { getPublicListings } from "@/lib/public-content";
import { publicCategories, publicKinds, isPublicKind, publicPageNumber } from "@/lib/public-catalog";
import { ListingCard } from "@/components/public/listing-card";
import { Localized } from "@/components/i18n/localized";
import { ExploreSearchFields } from "@/components/public/explore-search-fields";
import type { UiCopyKey } from "@/lib/i18n/ui-copy";

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
  const pageHref = (number: number) => {
    const query = new URLSearchParams({ type: kind, page: String(number) });
    if (search) query.set("q", search);
    return `/explore?${query}`;
  };

  return (
    <main id="main-content" data-catalog className={styles.catalog}>
      <section data-illustration-trigger className="relative overflow-hidden border-b border-border/70">
        <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
          <div className={styles.intro}>
            <div>
            <div className="inline-flex items-center gap-2 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Sparkles aria-hidden="true" className="size-3.5" />
              <Localized k="explore.eyebrow" />
            </div>
            <h1 className="mt-5 text-3xl font-medium tracking-tight sm:text-4xl"><Localized k="explore.title" /></h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              <Localized k="explore.description" />
            </p>
            </div>
            <div className={styles.introArt}><CatalogIllustration interactive kind={kind} /></div>
          </div>

          <span id="explore-categories-label" className="sr-only"><Localized k="explore.categories" /></span>
          <nav aria-labelledby="explore-categories-label" className={`${styles.categories} mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4`}>
            {publicKinds.map(value => {
              const Icon = icons[value];
              const active = value === kind;
              return <a key={value} href={`/explore?type=${value}#results-heading`} aria-current={active ? "page" : undefined} className={`${styles.category} flex items-center gap-3 rounded-md border p-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${active ? "border-primary bg-secondary" : "border-border bg-card hover:border-primary"}`}>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-primary"><Icon aria-hidden="true" className="size-5" /></span>
                <div className="min-w-0 flex-1"><p className="font-semibold"><Localized k={`categories.${value}.label` as UiCopyKey} /></p><p className="mt-1 text-xs text-muted-foreground">{active ? <Localized k="explore.viewingCategory" /> : <Localized k="explore.browseListings" />}</p></div>
                <ArrowRight aria-hidden="true" data-flip-rtl className="size-4 shrink-0 text-primary" />
              </a>;
            })}
          </nav>
        </div>
      </section>
      <section aria-labelledby="results-heading" className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary"><Localized k="explore.browseListings" /></p><CatalogResultsHeading title={<Localized k={`categories.${kind}.label` as UiCopyKey} />} /><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground"><Localized k={`categories.${kind}.description` as UiCopyKey} /></p></div>
          {search && <p className="break-words text-sm text-muted-foreground"><Localized k="explore.searchQuery" values={{ query: search }} /></p>}
        </div>
        <form action="/explore" className={`${styles.searchForm} mt-6`}>
          <input type="hidden" name="type" value={kind} />
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <ExploreSearchFields kind={kind} search={search} />
          </div>
          {search && <Link href={`/explore?type=${kind}`} className={`${styles.action} mt-2 inline-flex items-center text-sm font-medium text-primary hover:underline`}><Localized k="explore.clearSearch" /></Link>}
        </form>
        <div className="min-w-0">
          <div className="mt-8">
            {result.unavailable ? (
              <div role="status" aria-live="polite" className="relative overflow-hidden rounded-md border border-border/80 bg-card p-8">
                <h3 className="relative font-semibold text-foreground"><Localized k="explore.unavailableTitle" /></h3>
                <p className="relative mt-2 text-sm leading-6 text-muted-foreground"><Localized k="explore.unavailableBody" /></p>
                <Link href={pageHref(page)} className="relative mt-4 inline-flex items-center gap-2 rounded-md border border-primary/15 bg-primary/[0.06] px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><Localized k="explore.tryAgain" /> <ArrowRight aria-hidden="true" data-flip-rtl className="size-4" /></Link>
              </div>
            ) : result.items.length ? (
              <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr))]">
                {result.items.map(item => <ListingCard key={item.slug} item={item} kind={kind} />)}
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-md border border-dashed border-border/80 bg-card/60 p-8">
                <h3 className="relative font-semibold text-foreground">{search ? <Localized k="explore.noMatchTitle" /> : <Localized k="explore.noListingsTitle" />}</h3>
                <p className="relative mt-2 text-sm leading-6 text-muted-foreground">
                  {search ? <Localized k="explore.noMatchBody" /> : <Localized k="explore.noListingsBody" />}
                </p>
                {search ? (
                  <Link
                    href={`/explore?type=${kind}`}
                    className="relative mt-5 inline-flex rounded-md border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    <Localized k="explore.clearSearch" />
                  </Link>
                ) : null}
              </div>
            )}
          </div>

          {!result.unavailable && (page > 1 || result.hasMore) && (
            <><span id="explore-pagination-label" className="sr-only"><Localized k="explore.pagination" /></span><nav aria-labelledby="explore-pagination-label" className="mt-10 flex flex-wrap items-center gap-3">
              {page > 1 && <Link href={pageHref(page - 1)} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-semibold transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><ArrowLeft aria-hidden="true" data-flip-rtl className="size-4" /> <Localized k="explore.previous" /></Link>}
              <span className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground"><Localized k="explore.page" values={{ page }} /></span>
              {result.hasMore && <Link href={pageHref(page + 1)} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-semibold transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><Localized k="explore.next" /> <ArrowRight aria-hidden="true" data-flip-rtl className="size-4" /></Link>}
            </nav></>
          )}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6"><p className="text-sm text-muted-foreground"><Localized k="explore.joinPrompt" /></p><Link href="/login?mode=join" className={`${styles.action} inline-flex items-center gap-2 text-sm font-semibold text-primary`}><Localized k="explore.joinAction" /> <ArrowRight aria-hidden="true" data-flip-rtl className="size-4" /></Link></div>
      </section>
    </main>
  );
}
