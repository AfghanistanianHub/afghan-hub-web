import type { Metadata } from "next";
import Link from "next/link";
import { getPublicListings } from "@/lib/public-content";
import { publicCategories, publicKinds, isPublicKind, publicPageNumber } from "@/lib/public-catalog";
import { ListingCard } from "@/components/public/listing-card";

type Params = { type?: string | string[]; q?: string | string[]; page?: string | string[] };
type Props = { searchParams: Promise<Params> };
function filters(params: Params) {
  return { kind: typeof params.type === "string" && isPublicKind(params.type) ? params.type : "opportunities" as const, search: typeof params.q === "string" ? params.q.trim().slice(0, 100) : "", page: publicPageNumber(params.page) };
}
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { kind, search, page } = filters(await searchParams);
  return { title: `Explore ${publicCategories[kind].label.toLowerCase()}`, description: publicCategories[kind].description, robots: search ? { index: false, follow: true } : undefined, alternates: { canonical: `https://app.apnbc.ca/explore?type=${kind}${page > 1 ? `&page=${page}` : ""}` } };
}
export default async function ExplorePage({ searchParams }: Props) {
  const { kind, search, page } = filters(await searchParams);
  const result = await getPublicListings(kind, { search, page });
  const pageHref = (number: number) => { const query = new URLSearchParams({ type: kind, page: String(number) }); if (search) query.set("q", search); return `/explore?${query}`; };
  return <main id="main-content" className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
    <p className="text-xs font-semibold uppercase tracking-widest text-primary">Explore Afghan Hub</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Find your next connection.</h1><p className="mt-4 max-w-2xl leading-7 text-muted-foreground">Browse community listings before you join. Make an account when you’re ready to connect, save, or contribute.</p>
    <nav aria-label="Listing categories" className="mt-8 flex flex-wrap gap-2">{publicKinds.map(value => <Link key={value} href={`/explore?type=${value}`} aria-current={value === kind ? "page" : undefined} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${value === kind ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>{publicCategories[value].label}</Link>)}</nav>
    <section aria-labelledby="results-heading" className="mt-10"><h2 id="results-heading" className="text-2xl font-semibold">{publicCategories[kind].label}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{publicCategories[kind].description}</p>
      <form action="/explore" className="mt-6 flex flex-wrap items-end gap-3"><input type="hidden" name="type" value={kind} /><label className="grid w-full gap-2 text-sm font-medium sm:max-w-md">Search {publicCategories[kind].label.toLowerCase()}<input type="search" name="q" defaultValue={search} maxLength={100} placeholder="Search by name or title" className="min-w-0 rounded-xl border border-input bg-card px-4 py-3 outline-offset-2 focus-visible:outline-2" /></label><button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Search</button>{search && <Link href={`/explore?type=${kind}`} className="px-3 py-3 text-sm text-primary underline">Clear search</Link>}</form>
      <div className="mt-8">{result.unavailable ? <div role="status" className="rounded-2xl border border-border p-8"><h3 className="font-semibold">Listings are temporarily unavailable.</h3><p className="mt-2 text-sm text-muted-foreground">Please try again in a moment.</p><Link href={pageHref(page)} className="mt-4 inline-block text-sm text-primary underline">Try again</Link></div> : result.items.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{result.items.map(item => <ListingCard key={item.slug} item={item} kind={kind} />)}</div> : <div className="rounded-2xl border border-dashed border-border p-8"><h3 className="font-semibold">{search ? "No listings match your search." : "No listings to show here yet."}</h3><p className="mt-2 text-sm text-muted-foreground">{search ? "Try another name or clear your search." : "Check back for new community listings, or explore another category."}</p></div>}</div>
      {!result.unavailable && (page > 1 || result.hasMore) && <nav aria-label="Pagination" className="mt-8 flex items-center gap-5">{page > 1 && <Link href={pageHref(page - 1)} className="rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted">Previous</Link>}<span className="text-sm text-muted-foreground">Page {page}</span>{result.hasMore && <Link href={pageHref(page + 1)} className="rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted">Next</Link>}</nav>}
    </section>
  </main>;
}
