import Link from "next/link";
import { Building2 } from "lucide-react";
import { BusinessDirectory } from "@/components/businesses/business-directory";
import { MemberPageHeader, DirectoryEmptyState } from "@/components/catalog/member-page-header";
import { createClient } from "@/lib/supabase/server";
import { B, BrowseCheckbox, BrowseField } from "@/components/i18n/browse";
import { catalogCheckboxLabelClass, catalogClearClass, catalogFieldClass, catalogFilterPanelClass, catalogPageContainerClass, catalogSubmitClass } from "@/components/catalog/catalog-filter-styles";

type BusinessesPageProps = { searchParams: Promise<{ q?: string | string[]; category?: string | string[]; city?: string | string[]; hiring?: string | string[]; verified?: string | string[] }> };
function getSearchValue(value: string | string[] | undefined, maxLength = 100) { return typeof value === "string" ? value.trim().slice(0, maxLength) : ""; }
function escapeLikePattern(value: string) { return value.replace(/[\\%_]/g, "\\$&"); }

export default async function BusinessesPage({ searchParams }: BusinessesPageProps) {
  const params = await searchParams;
  const search = getSearchValue(params.q);
  const category = getSearchValue(params.category, 80);
  const city = getSearchValue(params.city, 80);
  const hiring = getSearchValue(params.hiring, 20) === "only";
  const verified = getSearchValue(params.verified, 20) === "only";
  const supabase = await createClient();
  let query = supabase.from("businesses").select(`id,name,slug,category,short_description,city,province_state,country,services,logo_url,is_verified,is_hiring`).eq("status", "published").order("name", { ascending: true });
  if (search) query = query.ilike("name", `%${escapeLikePattern(search)}%`);
  if (category) query = query.ilike("category", `%${escapeLikePattern(category)}%`);
  if (city) query = query.ilike("city", `%${escapeLikePattern(city)}%`);
  if (hiring) query = query.eq("is_hiring", true);
  if (verified) query = query.eq("is_verified", true);
  const { data: businesses, error } = await query;
  const hasFilters = Boolean(search || category || city || hiring || verified);
  const count = businesses?.length ?? 0;

  return (
    <main className={catalogPageContainerClass}>
      <MemberPageHeader title={<B k="businesses.title" />} description={<B k="businesses.description" />} icon={Building2}><Link href="/businesses/new" className={catalogSubmitClass}><B k="businesses.create" /></Link></MemberPageHeader>
      <form action="/businesses" method="get" className={`${catalogFilterPanelClass} md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto_auto]`}>
        <BrowseField labelKey="businesses.search" name="q" defaultValue={search} placeholderKey="businesses.searchPlaceholder" className={catalogFieldClass} labelClassName="grid gap-2 text-sm font-medium" />
        <BrowseField labelKey="businesses.category" name="category" defaultValue={category} placeholderKey="businesses.anyCategory" className={catalogFieldClass} labelClassName="grid gap-2 text-sm font-medium" />
        <BrowseField labelKey="common.city" name="city" defaultValue={city} placeholderKey="common.anyCity" className={catalogFieldClass} labelClassName="grid gap-2 text-sm font-medium" />
        <BrowseCheckbox name="hiring" labelKey="common.hiringNow" defaultChecked={hiring} labelClassName={catalogCheckboxLabelClass} />
        <BrowseCheckbox name="verified" labelKey="common.verifiedListings" defaultChecked={verified} labelClassName={catalogCheckboxLabelClass} />
        <div className="flex items-end gap-3"><button type="submit" className={catalogSubmitClass}><B k="common.apply" /></button>{hasFilters ? <Link href="/businesses" className={catalogClearClass}><B k="common.clear" /></Link> : null}</div>
      </form>
      <p className="mt-5 text-sm text-muted-foreground">{error ? <B k="businesses.loadError" /> : <B k={count === 1 ? "businesses.countOne" : "businesses.countMany"} values={{ count }} />}</p>
      {error ? <div role="alert" aria-live="assertive" className="mt-6 border border-destructive/20 bg-card p-5 text-sm text-destructive"><B k="businesses.loadErrorBody" /></div> : businesses?.length ? <BusinessDirectory businesses={businesses} /> : <DirectoryEmptyState title={<B k={hasFilters ? "businesses.emptyFiltered" : "businesses.empty"} />} description={<B k={hasFilters ? "businesses.emptyFilteredBody" : "businesses.emptyBody"} />} href={hasFilters ? "/businesses" : "/businesses/new"} action={<B k={hasFilters ? "common.clearFilters" : "businesses.add"} />} />}
    </main>
  );
}
