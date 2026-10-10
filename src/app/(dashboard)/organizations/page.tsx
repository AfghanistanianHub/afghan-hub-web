import Link from "next/link";
import { MemberPageHeader, DirectoryEmptyState } from "@/components/catalog/member-page-header";
import { ArrowUpRight, Search, UsersRound } from "lucide-react";

import { OrganizationDirectory } from "@/components/organizations/organization-directory";
import { createClient } from "@/lib/supabase/server";
import {
  catalogCheckboxInputClass,
  catalogCheckboxLabelClass,
  catalogClearClass,
  catalogFieldClass,
  catalogFilterPanelClass,
  catalogSubmitClass,
} from "@/components/catalog/catalog-filter-styles";

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

  return <main data-illustration-focus-scope className="px-4 py-8 sm:px-6 md:px-8 lg:px-10 lg:py-10 xl:px-12"><div className="mx-auto w-full max-w-[1500px]">
    <MemberPageHeader title="Discover organizations" description="Explore Afghan-led nonprofits, associations and community initiatives." icon={UsersRound}><Link href="/organizations/new" className={catalogSubmitClass}>Add organization<ArrowUpRight className="ms-2 inline size-4" aria-hidden="true" /></Link></MemberPageHeader>
    <form action="/organizations" method="get" className={`${catalogFilterPanelClass} md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto_auto]`}>
      <label className="grid gap-2 text-sm font-medium text-foreground"><span className="inline-flex items-center gap-2"><Search className="size-4 text-primary" aria-hidden="true"/>Search organizations</span><input type="search" name="q" defaultValue={search} placeholder="Organization name" className={catalogFieldClass}/></label>
      <label className="grid gap-2 text-sm font-medium text-foreground">Type<input type="search" name="type" defaultValue={organizationType} placeholder="Any type" className={catalogFieldClass}/></label>
      <label className="grid gap-2 text-sm font-medium text-foreground">City<input type="search" name="city" defaultValue={city} placeholder="Any city" className={catalogFieldClass}/></label>
      <label className={catalogCheckboxLabelClass}><input type="checkbox" name="volunteers" value="only" defaultChecked={volunteers} className={catalogCheckboxInputClass}/>Volunteers</label>
      <label className={catalogCheckboxLabelClass}><input type="checkbox" name="verified" value="only" defaultChecked={verified} className={catalogCheckboxInputClass}/>Verified listings</label>
      <div className="flex items-end gap-3"><button type="submit" className={catalogSubmitClass}>Apply</button>{hasFilters ? <Link href="/organizations" className={catalogClearClass}>Clear</Link> : null}</div>
    </form>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-muted-foreground">{error ? "Organizations could not be loaded." : `${organizations?.length ?? 0} ${organizations?.length === 1 ? "organization" : "organizations"} found`}</p>{hasFilters ? <p className="text-xs text-muted-foreground">Filters are reflected in the URL, so this view can be shared.</p> : null}</div>
    {error ? <div role="alert" aria-live="assertive" className="relative mt-8 overflow-hidden rounded-[var(--radius)] border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive"><div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-destructive/[0.06] blur-3xl"/><span className="relative">We could not load organizations. Please try again.</span></div> : organizations?.length ? <OrganizationDirectory organizations={organizations}/> : <DirectoryEmptyState title={hasFilters ? "No organizations match these filters" : "No organizations yet"} description={hasFilters ? "Try adjusting or clearing your filters." : "Community organizations will appear here once they are added."} href={hasFilters ? "/organizations" : "/organizations/new"} action={hasFilters ? "Clear filters" : "Add an organization"} />}
  </div></main>;
}
