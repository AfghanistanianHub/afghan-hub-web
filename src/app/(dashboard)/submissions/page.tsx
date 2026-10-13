import Link from "next/link";
import { redirect } from "next/navigation";
import { BriefcaseBusiness, CircleCheck, Clock3, Pencil, XCircle } from "lucide-react";
import { MemberPageHeader, DirectoryEmptyState } from "@/components/catalog/member-page-header";
import { getUtcDateKey, hasOpportunityDeadlinePassed } from "@/lib/opportunities";
import { createClient } from "@/lib/supabase/server";

const categories = ["All", "Opportunities", "Businesses", "Organizations", "Events"] as const;
const focusClass = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

function getStatusPresentation(status: string) {
  if (status === "published") return { label: "Published", className: "bg-secondary text-primary", icon: CircleCheck };
  if (status === "draft") return { label: "Pending review", className: "bg-muted text-muted-foreground", icon: Clock3 };
  return { label: status === "expired" ? "Expired" : "Not approved", className: "bg-destructive/[0.08] text-destructive", icon: XCircle };
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
    supabase.from("opportunities").select("id,title,slug,summary,type,status,deadline,moderation_note,created_at,updated_at").eq("author_id", user.id).order("updated_at", { ascending: false }),
    supabase.from("events").select("id,title,slug,summary,status,moderation_note,starts_at,created_at,updated_at").eq("creator_id", user.id).order("updated_at", { ascending: false }),
    supabase.from("businesses").select("id,name,slug,short_description,category,status,moderation_note,updated_at").eq("owner_id", user.id).order("updated_at", { ascending: false }),
    supabase.from("organizations").select("id,name,slug,short_description,organization_type,status,moderation_note,updated_at").eq("owner_id", user.id).order("updated_at", { ascending: false }),
  ]);
  const errors = { Opportunities: opportunitiesError, Businesses: businessesError, Organizations: organizationsError, Events: eventsError };
  const hasError = Object.values(errors).some(Boolean);
  const submissions = [
    ...(opportunities ?? []).map((item) => ({ id: item.id, title: item.title, category: "Opportunities", type: "Opportunity", path: `/opportunities/${item.slug}`, updatedAt: item.updated_at, status: item.status === "published" && hasOpportunityDeadlinePassed(item.deadline, today) ? "expired" : item.status, moderationNote: item.moderation_note })),
    ...(businesses ?? []).map((item) => ({ id: item.id, title: item.name, category: "Businesses", type: "Business", path: `/businesses/${item.slug}`, updatedAt: item.updated_at, status: item.status, moderationNote: item.moderation_note })),
    ...(organizations ?? []).map((item) => ({ id: item.id, title: item.name, category: "Organizations", type: "Organization", path: `/organizations/${item.slug}`, updatedAt: item.updated_at, status: item.status, moderationNote: item.moderation_note })),
    ...(events ?? []).map((item) => ({ id: item.id, title: item.title, category: "Events", type: "Event", path: `/events/${item.slug}`, updatedAt: item.updated_at, status: item.status, moderationNote: item.moderation_note })),
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const visible = submissions.filter((item) => selected === "All" || item.category === selected);
  const selectedFailed = selected !== "All" && Boolean(errors[selected]);
  const createHref = selected === "All" ? "/opportunities/new" : `/${selected.toLowerCase()}/new`;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 md:px-8 lg:px-10">
      <MemberPageHeader title="My submissions" description="Track review status and manage the content you have shared." icon={BriefcaseBusiness}>
        <Link href="/opportunities/new" className={`inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground ${focusClass}`}>New opportunity</Link>
        <Link href="/events/new" className={`inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-border bg-card px-4 py-2.5 text-sm font-semibold ${focusClass}`}>New event</Link>
      </MemberPageHeader>
      {hasError ? <div role="alert" aria-live="assertive" className="mt-5 border border-destructive/25 bg-card p-4 text-sm text-destructive">We could not load all of your submissions. Please try again. Counts for unavailable categories are unknown.</div> : null}
      <nav aria-label="Submission categories" className="mt-5 flex flex-wrap gap-1 border-b border-border pb-3">
        {categories.map((category) => {
          const unavailable = category === "All" ? hasError : Boolean(errors[category]);
          const count = category === "All" ? submissions.length : submissions.filter((item) => item.category === category).length;
          return <Link key={category} href={category === "All" ? "/submissions" : `/submissions?category=${category.toLowerCase()}`} aria-current={category === selected ? "page" : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-sm font-semibold ${focusClass} ${category === selected ? "bg-secondary text-primary" : "hover:bg-muted"}`}>{category}<span className="text-xs" aria-label={unavailable ? "Count unavailable" : `${count} submissions`}>{unavailable ? "—" : count}</span></Link>;
        })}
      </nav>
      {visible.length ? <div className="mt-4 divide-y divide-border border-y border-border bg-card">
        {visible.map((item) => {
          const presentation = getStatusPresentation(item.status);
          const StatusIcon = presentation.icon;
          return <article key={`${item.category}-${item.id}`} className="px-4 py-5 focus-within:border-primary/50">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 basis-full sm:basis-auto sm:flex-1"><p className="text-xs font-medium text-muted-foreground">{item.type}</p><Link href={item.path} className={`mt-1 inline-flex min-h-11 items-center break-words text-lg font-semibold hover:text-primary ${focusClass}`}>{item.title}</Link><p className="mt-1 text-xs text-muted-foreground">Updated <time dateTime={item.updatedAt}>{formatDate(item.updatedAt)}</time></p></div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${presentation.className}`}><StatusIcon aria-hidden="true" className="size-3.5" />{presentation.label}</span>
              <div className="flex items-center gap-2"><Link href={item.path} className={`inline-flex min-h-11 items-center px-3 text-sm font-semibold text-primary ${focusClass}`}>View</Link><Link href={`${item.path}/edit`} className={`inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-control)] border border-border px-3 text-sm font-semibold ${focusClass}`}><Pencil aria-hidden="true" className="size-3.5" />Edit</Link></div>
            </div>
            {presentation.label === "Not approved" && item.moderationNote ? <p className="mt-3 border-s-2 border-destructive/40 ps-3 text-sm leading-6 text-destructive"><span className="font-semibold">Moderator note:</span> {item.moderationNote}</p> : null}
          </article>;
        })}
      </div> : selectedFailed || (selected === "All" && hasError) ? <p role="status" className="py-6 text-sm text-muted-foreground">Your submissions are temporarily unavailable. Refresh the page or try again shortly.</p> : <DirectoryEmptyState title={selected === "All" ? "No submissions yet" : `No ${selected.toLowerCase()} submitted`} description="Create a listing to share it with the community and track its review here." href={createHref} action="Create a submission" />}
    </main>
  );
}
