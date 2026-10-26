import Link from "next/link";
import { redirect } from "next/navigation";
import { BriefcaseBusiness, CircleCheck, Clock3, Pencil, XCircle } from "lucide-react";
import { MemberPageHeader, DirectoryEmptyState } from "@/components/catalog/member-page-header";
import { Localized } from "@/components/i18n/localized";
import { LocalizedDate } from "@/components/i18n/localized-date";
import type { UiCopyKey } from "@/lib/i18n/ui-copy";
import { catalogPageContainerClass } from "@/components/catalog/catalog-filter-styles";
import { getUtcDateKey, hasOpportunityDeadlinePassed } from "@/lib/opportunities";
import { createClient } from "@/lib/supabase/server";

const categories = ["All", "Opportunities", "Businesses", "Organizations", "Events"] as const;
const focusClass = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

function categoryLabelKey(category: (typeof categories)[number]): UiCopyKey {
  if (category === "All") return "submissions.all";
  return `categories.${category.toLowerCase()}.label` as UiCopyKey;
}

function categorySingularKey(category: string): UiCopyKey {
  return `categories.${category.toLowerCase()}.singular` as UiCopyKey;
}

function getStatusPresentation(status: string) {
  if (status === "published") return { key: "submissions.statusPublished" as const, rejected: false, className: "bg-secondary text-primary", icon: CircleCheck };
  if (status === "draft") return { key: "submissions.statusPending" as const, rejected: false, className: "bg-muted text-muted-foreground", icon: Clock3 };
  return { key: status === "expired" ? "submissions.statusExpired" as const : "submissions.statusRejected" as const, rejected: status !== "expired", className: "bg-destructive/[0.08] text-destructive", icon: XCircle };
}

export default async function SubmissionsPage({ searchParams }: { searchParams: Promise<{ category?: string | string[] }> }) {
  const params = await searchParams;
  const selected = categories.find((category) => category.toLowerCase() === params.category) ?? "All";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const today = getUtcDateKey(new Date());
  const [
    { data: opportunities, error: opportunitiesError },
    { data: events, error: eventsError },
    { data: businesses, error: businessesError },
    { data: organizations, error: organizationsError },
  ] = await Promise.all([
    supabase.from("opportunities").select("id,title,slug,summary,type,status,deadline,created_at,updated_at").eq("author_id", user.id).order("updated_at", { ascending: false }),
    supabase.from("events").select("id,title,slug,summary,status,starts_at,created_at,updated_at").eq("creator_id", user.id).order("updated_at", { ascending: false }),
    supabase.from("businesses").select("id,name,slug,short_description,category,status,updated_at").eq("owner_id", user.id).order("updated_at", { ascending: false }),
    supabase.from("organizations").select("id,name,slug,short_description,organization_type,status,updated_at").eq("owner_id", user.id).order("updated_at", { ascending: false }),
  ]);
  // Scoped RPC prevents unrelated members from reading moderation feedback.
  const ownerNoteTargets = [
    ...(opportunities ?? []).filter((item) => item.status !== "published" && item.status !== "draft").map((item) => ({ entityType: "opportunity", id: item.id })),
    ...(events ?? []).filter((item) => item.status !== "published" && item.status !== "draft").map((item) => ({ entityType: "event", id: item.id })),
    ...(businesses ?? []).filter((item) => item.status !== "published" && item.status !== "draft").map((item) => ({ entityType: "business", id: item.id })),
    ...(organizations ?? []).filter((item) => item.status !== "published" && item.status !== "draft").map((item) => ({ entityType: "organization", id: item.id })),
  ];
  const ownerNotes = await Promise.all(ownerNoteTargets.map(async (item) => {
    const { data, error } = await supabase.rpc("get_owned_listing_moderation_note", {
      target_entity_type: item.entityType, target_entity_id: item.id,
    });
    if (error) throw new Error("Owner moderation feedback could not be loaded");
    return { key: `${item.entityType}:${item.id}`, note: data };
  }));
  const moderationNotes = new Map(ownerNotes.map((item) => [item.key, item.note]));
  const errors = { Opportunities: opportunitiesError, Businesses: businessesError, Organizations: organizationsError, Events: eventsError };
  const hasError = Object.values(errors).some(Boolean);
  const submissions = [
    ...(opportunities ?? []).map((item) => ({ id: item.id, title: item.title, category: "Opportunities", type: "Opportunity", path: `/opportunities/${item.slug}`, updatedAt: item.updated_at, status: item.status === "published" && hasOpportunityDeadlinePassed(item.deadline, today) ? "expired" : item.status, moderationNote: moderationNotes.get(`opportunity:${item.id}`) ?? null })),
    ...(businesses ?? []).map((item) => ({ id: item.id, title: item.name, category: "Businesses", type: "Business", path: `/businesses/${item.slug}`, updatedAt: item.updated_at, status: item.status, moderationNote: moderationNotes.get(`business:${item.id}`) ?? null })),
    ...(organizations ?? []).map((item) => ({ id: item.id, title: item.name, category: "Organizations", type: "Organization", path: `/organizations/${item.slug}`, updatedAt: item.updated_at, status: item.status, moderationNote: moderationNotes.get(`organization:${item.id}`) ?? null })),
    ...(events ?? []).map((item) => ({ id: item.id, title: item.title, category: "Events", type: "Event", path: `/events/${item.slug}`, updatedAt: item.updated_at, status: item.status, moderationNote: moderationNotes.get(`event:${item.id}`) ?? null })),
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const visible = submissions.filter((item) => selected === "All" || item.category === selected);
  const selectedFailed = selected !== "All" && Boolean(errors[selected]);
  const createHref = selected === "All" ? "/opportunities/new" : `/${selected.toLowerCase()}/new`;

  return (
    <main className={catalogPageContainerClass}>
      <MemberPageHeader title={<Localized k="submissions.title" />} description={<Localized k="submissions.description" />} icon={BriefcaseBusiness}>
        <Link href="/opportunities/new" className={`inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground ${focusClass}`}><Localized k="submissions.newOpportunity" /></Link>
        <Link href="/events/new" className={`inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-border bg-card px-4 py-2.5 text-sm font-semibold ${focusClass}`}><Localized k="submissions.newEvent" /></Link>
      </MemberPageHeader>
      {hasError ? <div role="alert" aria-live="assertive" className="mt-5 border border-destructive/25 bg-card p-4 text-sm text-destructive"><Localized k="submissions.loadError" /></div> : null}
      <span id="submission-categories-label" className="sr-only"><Localized k="submissions.categories" /></span>
      <nav aria-labelledby="submission-categories-label" className="mt-5 flex flex-wrap gap-1 border-b border-border pb-3">
        {categories.map((category) => {
          const unavailable = category === "All" ? hasError : Boolean(errors[category]);
          const count = category === "All" ? submissions.length : submissions.filter((item) => item.category === category).length;
          return <Link key={category} href={category === "All" ? "/submissions" : `/submissions?category=${category.toLowerCase()}`} aria-current={category === selected ? "page" : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-sm font-semibold ${focusClass} ${category === selected ? "bg-secondary text-primary" : "hover:bg-muted"}`}><Localized k={categoryLabelKey(category)} /><span className="text-xs" aria-hidden="true">{unavailable ? "—" : count}</span><span className="sr-only">{unavailable ? <Localized k="submissions.countUnavailable" /> : <Localized k="submissions.count" values={{ count }} />}</span></Link>;
        })}
      </nav>
      {visible.length ? <div className="mt-6 grid gap-3 md:grid-cols-2">
        {visible.map((item) => {
          const presentation = getStatusPresentation(item.status);
          const StatusIcon = presentation.icon;
          return <article key={`${item.category}-${item.id}`} className="min-w-0 rounded-[var(--radius-card)] border border-border bg-card p-5 transition-colors hover:border-primary/40 focus-within:border-primary/50 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 basis-full sm:basis-auto sm:flex-1"><p className="text-xs font-medium text-muted-foreground"><Localized k={categorySingularKey(item.category)} /></p><Link href={item.path} className={`mt-1 inline-flex min-h-11 items-center break-words text-lg font-semibold hover:text-primary ${focusClass}`}>{item.title}</Link><p className="mt-1 text-xs text-muted-foreground"><Localized k="submissions.updated" /> <LocalizedDate value={item.updatedAt} /></p></div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${presentation.className}`}><StatusIcon aria-hidden="true" className="size-3.5" /><Localized k={presentation.key} /></span>
              <div className="flex items-center gap-2"><Link href={item.path} className={`inline-flex min-h-11 items-center px-3 text-sm font-semibold text-primary ${focusClass}`}><Localized k="submissions.view" /></Link><Link href={`${item.path}/edit`} className={`inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-control)] border border-border px-3 text-sm font-semibold ${focusClass}`}><Pencil aria-hidden="true" className="size-3.5" /><Localized k="submissions.edit" /></Link></div>
            </div>
            {presentation.rejected && item.moderationNote ? <p className="mt-3 border-s-2 border-destructive/40 ps-3 text-sm leading-6 text-destructive"><span className="font-semibold"><Localized k="submissions.moderatorNote" /></span> {item.moderationNote}</p> : null}
          </article>;
        })}
      </div> : selectedFailed || (selected === "All" && hasError) ? <p role="status" className="py-6 text-sm text-muted-foreground"><Localized k="submissions.unavailable" /></p> : <DirectoryEmptyState title={selected === "All" ? <Localized k="submissions.emptyAll" /> : <Localized k="submissions.emptyFiltered" />} description={<Localized k="submissions.emptyDescription" />} href={createHref} action={<Localized k="submissions.create" />} />}
    </main>
  );
}
