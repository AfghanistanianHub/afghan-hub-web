import Link from "next/link";
import { Building2 } from "lucide-react";
import { BusinessDirectory } from "@/components/businesses/business-directory";
import { MemberPageHeader, DirectoryEmptyState } from "@/components/catalog/member-page-header";
import { createClient } from "@/lib/supabase/server";
import { catalogCheckboxInputClass, catalogCheckboxLabelClass, catalogClearClass, catalogFieldClass, catalogFilterPanelClass, catalogPageContainerClass, catalogSubmitClass } from "@/components/catalog/catalog-filter-styles";

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

  return (
    <main className={catalogPageContainerClass}>
      <MemberPageHeader title="Discover businesses" description="Support Afghan-owned businesses, services and entrepreneurs." icon={Building2}><Link href="/businesses/new" className={catalogSubmitClass}>Create business</Link></MemberPageHeader>
      <form action="/businesses" method="get" className={`${catalogFilterPanelClass} md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto_auto]`}>
        <label className="grid gap-2 text-sm font-medium">Search businesses<input type="search" name="q" defaultValue={search} placeholder="Business name" className={catalogFieldClass} /></label>
        <label className="grid gap-2 text-sm font-medium">Category<input type="search" name="category" defaultValue={category} placeholder="Any category" className={catalogFieldClass} /></label>
        <label className="grid gap-2 text-sm font-medium">City<input type="search" name="city" defaultValue={city} placeholder="Any city" className={catalogFieldClass} /></label>
        <label className={catalogCheckboxLabelClass}><input type="checkbox" name="hiring" value="only" defaultChecked={hiring} className={catalogCheckboxInputClass} />Hiring now</label>
        <label className={catalogCheckboxLabelClass}><input type="checkbox" name="verified" value="only" defaultChecked={verified} className={catalogCheckboxInputClass} />Verified listings</label>
        <div className="flex items-end gap-3"><button type="submit" className={catalogSubmitClass}>Apply</button>{hasFilters ? <Link href="/businesses" className={catalogClearClass}>Clear</Link> : null}</div>
      </form>
      <p className="mt-5 text-sm text-muted-foreground">{error ? "Businesses could not be loaded." : `${businesses?.length ?? 0} ${businesses?.length === 1 ? "business" : "businesses"} found`}</p>
      {error ? <div role="alert" aria-live="assertive" className="mt-6 border border-destructive/20 bg-card p-5 text-sm text-destructive">We could not load businesses. Please try again.</div> : businesses?.length ? <BusinessDirectory businesses={businesses} /> : <DirectoryEmptyState title={hasFilters ? "No businesses match these filters" : "No businesses yet"} description={hasFilters ? "Try adjusting or clearing your filters." : "Community businesses will appear here once they are added."} href={hasFilters ? "/businesses" : "/businesses/new"} action={hasFilters ? "Clear filters" : "Add a business"} />}
    </main>
  );
}
