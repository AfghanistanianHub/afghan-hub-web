import Link from "next/link";
import { MemberPageHeader, DirectoryEmptyState } from "@/components/catalog/member-page-header";
import { ArrowUpRight, Search, UsersRound } from "lucide-react";

import { OrganizationDirectory } from "@/components/organizations/organization-directory";
import { createClient } from "@/lib/supabase/server";
import { B, BrowseCheckbox, BrowseField } from "@/components/i18n/browse";
import {
  catalogCheckboxInputClass,
  catalogCheckboxLabelClass,
  catalogClearClass,
  catalogFieldClass,
  catalogFilterPanelClass,
  catalogPageContainerClass,
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
  const count = organizations?.length ?? 0;

  return <main data-illustration-focus-scope className={catalogPageContainerClass}>
    <MemberPageHeader title={<B k="organizations.title" />} description={<B k="organizations.description" />} icon={UsersRound}><Link href="/organizations/new" className={catalogSubmitClass}><B k="organizations.add" /><ArrowUpRight className="ms-2 inline size-4" aria-hidden="true" /></Link></MemberPageHeader>
    <form action="/organizations" method="get" className={`${catalogFilterPanelClass} md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto_auto]`}>
      <BrowseField labelKey="organizations.search" name="q" defaultValue={search} placeholderKey="organizations.searchPlaceholder" className={catalogFieldClass} labelClassName="grid gap-2 text-sm font-medium text-foreground" icon={<Search className="size-4 text-primary" aria-hidden="true" />} />
      <BrowseField labelKey="common.type" name="type" defaultValue={organizationType} placeholderKey="organizations.anyType" className={catalogFieldClass} labelClassName="grid gap-2 text-sm font-medium text-foreground" />
      <BrowseField labelKey="common.city" name="city" defaultValue={city} placeholderKey="common.anyCity" className={catalogFieldClass} labelClassName="grid gap-2 text-sm font-medium text-foreground" />
      <BrowseCheckbox name="volunteers" labelKey="common.volunteers" defaultChecked={volunteers} labelClassName={catalogCheckboxLabelClass} inputClassName={catalogCheckboxInputClass} />
      <BrowseCheckbox name="verified" labelKey="common.verifiedListings" defaultChecked={verified} labelClassName={catalogCheckboxLabelClass} inputClassName={catalogCheckboxInputClass} />
      <div className="flex items-end gap-3"><button type="submit" className={catalogSubmitClass}><B k="common.apply" /></button>{hasFilters ? <Link href="/organizations" className={catalogClearClass}><B k="common.clear" /></Link> : null}</div>
    </form>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-muted-foreground">{error ? <B k="organizations.loadError" /> : <B k={count === 1 ? "organizations.countOne" : "organizations.countMany"} values={{ count }} />}</p>{hasFilters ? <p className="text-xs text-muted-foreground"><B k="common.filtersShared" /></p> : null}</div>
    {error ? <div role="alert" aria-live="assertive" className="relative mt-8 overflow-hidden rounded-[var(--radius)] border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive"><div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-destructive/[0.06] blur-3xl"/><span className="relative"><B k="organizations.loadErrorBody" /></span></div> : organizations?.length ? <OrganizationDirectory organizations={organizations}/> : <DirectoryEmptyState title={<B k={hasFilters ? "organizations.emptyFiltered" : "organizations.empty"} />} description={<B k={hasFilters ? "organizations.emptyFilteredBody" : "organizations.emptyBody"} />} href={hasFilters ? "/organizations" : "/organizations/new"} action={<B k={hasFilters ? "common.clearFilters" : "organizations.emptyAction"} />} />}
  </main>;
}
