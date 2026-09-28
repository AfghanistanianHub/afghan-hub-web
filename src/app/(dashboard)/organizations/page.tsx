import Link from "next/link";
import { ArrowUpRight, Search, UsersRound } from "lucide-react";

import { OrganizationDirectory } from "@/components/organizations/organization-directory";
import { createClient } from "@/lib/supabase/server";

type OrganizationsPageProps = { searchParams: Promise<{ q?: string | string[]; type?: string | string[]; city?: string | string[]; volunteers?: string | string[]; verified?: string | string[] }> };
function getSearchValue(value: string | string[] | undefined, maxLength = 100) { return typeof value === "string" ? value.trim().slice(0, maxLength) : ""; }
function escapeLikePattern(value: string) { return value.replace(/[\\%_]/g, "\\$&"); }

export default async function OrganizationsPage({ searchParams }: OrganizationsPageProps) {
  const params = await searchParams;
  const search = getSearchValue(params.q);
  const organizationType = getSearchValue(params.type, 80);
  const city = getSearchValue(params.city, 80);
  const volunteers = getSearchValue(params.volunteers, 20) === "only";
  const verified = getSearchValue(params.verified, 20) === "only";
  const supabase = await createClient();
  let organizationsQuery = supabase.from("organizations").select(`id,name,slug,short_description,organization_type,city,province_state,country,logo_url,is_verified,is_accepting_volunteers`).eq("status", "published").order("name", { ascending: true });
  if (search) organizationsQuery = organizationsQuery.ilike("name", `%${escapeLikePattern(search)}%`);
  if (organizationType) organizationsQuery = organizationsQuery.ilike("organization_type", `%${escapeLikePattern(organizationType)}%`);
  if (city) organizationsQuery = organizationsQuery.ilike("city", `%${escapeLikePattern(city)}%`);
  if (volunteers) organizationsQuery = organizationsQuery.eq("is_accepting_volunteers", true);
  if (verified) organizationsQuery = organizationsQuery.eq("is_verified", true);
  const { data: organizations, error } = await organizationsQuery;
  const hasFilters = Boolean(search || organizationType || city || volunteers || verified);
  const field = "rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10";

  return <main className="px-4 py-8 md:px-8 lg:py-10"><div className="mx-auto max-w-7xl">
    <section className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card px-6 py-8 shadow-[0_18px_55px_rgb(15_23_42/0.045)] md:px-8 md:py-10">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary/[0.07] blur-3xl"/>
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl"><div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary"><UsersRound className="size-3.5" aria-hidden="true"/>Community organizations</div><h1 className="mt-5 text-3xl font-bold tracking-[-0.035em] text-foreground md:text-5xl">Discover organizations</h1><p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Explore Afghan-led nonprofits, associations, cultural groups, community initiatives, and professional organizations.</p></div>
        <Link href="/organizations/new" className="inline-flex w-fit items-center gap-2 rounded-2xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-[0_10px_28px_color-mix(in_oklab,var(--primary)_18%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/92 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Add organization<ArrowUpRight className="size-4" aria-hidden="true"/></Link>
      </div>
    </section>
    <form action="/organizations" method="get" className="surface-panel mt-8 grid gap-4 rounded-[1.75rem] p-5 backdrop-blur md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto_auto]">
      <label className="grid gap-2 text-sm font-medium text-foreground"><span className="inline-flex items-center gap-2"><Search className="size-4 text-primary" aria-hidden="true"/>Search organizations</span><input type="search" name="q" defaultValue={search} placeholder="Organization name" className={field}/></label>
      <label className="grid gap-2 text-sm font-medium text-foreground">Type<input type="search" name="type" defaultValue={organizationType} placeholder="Any type" className={field}/></label>
      <label className="grid gap-2 text-sm font-medium text-foreground">City<input type="search" name="city" defaultValue={city} placeholder="Any city" className={field}/></label>
      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border/80 bg-card px-3 py-3 text-sm font-medium text-foreground transition hover:border-primary/25 hover:bg-muted/40 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15"><input type="checkbox" name="volunteers" value="only" defaultChecked={volunteers} className="size-5 shrink-0 rounded border-border accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"/>Volunteers</label>
      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border/80 bg-card px-3 py-3 text-sm font-medium text-foreground transition hover:border-primary/25 hover:bg-muted/40 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15"><input type="checkbox" name="verified" value="only" defaultChecked={verified} className="size-5 shrink-0 rounded border-border accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"/>Verified listings</label>
      <div className="flex items-end gap-3"><button type="submit" className="rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Apply</button>{hasFilters ? <Link href="/organizations" className="rounded-xl border border-border bg-card px-4 py-3 font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Clear</Link> : null}</div>
    </form>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-muted-foreground">{error ? "Organizations could not be loaded." : `${organizations?.length ?? 0} ${organizations?.length === 1 ? "organization" : "organizations"} found`}</p>{hasFilters ? <p className="text-xs text-muted-foreground">Filters are reflected in the URL, so this view can be shared.</p> : null}</div>
    {error ? <div role="alert" aria-live="assertive" className="relative mt-8 overflow-hidden rounded-[1.5rem] border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive"><div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-destructive/[0.06] blur-3xl"/><span className="relative">We could not load organizations. Please try again.</span></div> : organizations?.length ? <OrganizationDirectory organizations={organizations}/> : <div className="surface-panel relative mt-10 overflow-hidden rounded-[2rem] border-dashed p-10 text-center shadow-[0_14px_42px_rgb(15_23_42/0.04)]"><div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-primary/[0.06] blur-3xl"/><span className="relative mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><UsersRound aria-hidden="true" className="size-7"/></span><h2 className="relative mt-5 text-xl font-semibold text-foreground">{hasFilters ? "No organizations match these filters" : "No organizations yet"}</h2><p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{hasFilters ? "Try adjusting or clearing your filters." : "Community organizations will appear here once they are added."}</p>{hasFilters ? <Link href="/organizations" className="relative mt-5 inline-flex rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Clear filters</Link> : <Link href="/organizations/new" className="relative mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Add an organization</Link>}</div>}
  </div></main>;
}
