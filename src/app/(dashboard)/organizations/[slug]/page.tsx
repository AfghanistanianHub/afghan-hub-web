import { setOrganizationVerification } from "@/app/(dashboard)/organizations/actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  HandHeart,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { ExternalImage } from "@/components/ui/external-image";
import { VerificationBadge, VerificationNote } from "@/components/ui/verification-badge";
import { getMyAccessContext } from "@/lib/profile-access";
import { createClient } from "@/lib/supabase/server";

type OrganizationPageProps={params:Promise<{slug:string}>;searchParams:Promise<{error?:string}>};
export default async function OrganizationPage({params,searchParams}:OrganizationPageProps){
 const {slug}=await params; const {error:actionError}=await searchParams; const supabase=await createClient();
 const {data:organization,error}=await supabase.from("organizations").select(`id,name,slug,short_description,description,organization_type,mission,programs,website_url,email,phone,city,province_state,country,logo_url,cover_url,is_verified,is_accepting_volunteers,status,moderation_note,owner_id`).eq("slug",slug).maybeSingle();
 if(error||!organization)notFound();
 const {data:{user}}=await supabase.auth.getUser();
 const {data:viewerProfile}=user?await getMyAccessContext(supabase,user.id):{data:null};
 const canEdit=user?.id===organization.owner_id; const canVerify=viewerProfile?.role==="admin"&&organization.status==="published";
 const programs=Array.isArray(organization.programs)?organization.programs.filter((program:unknown):program is string=>typeof program==="string"):[];
 const location=[organization.city,organization.province_state,organization.country].filter(Boolean).join(", ");
 return <main className="px-4 py-8 md:px-8"><div className="mx-auto max-w-6xl">
  <Link href="/organizations" className="inline-flex items-center gap-2 rounded-sm text-sm font-medium text-primary transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><ArrowLeft aria-hidden="true" className="size-4"/>Back to organizations</Link>
  {actionError?<div role="alert" aria-live="assertive" className="mt-6 break-words rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm leading-6 text-destructive">{actionError}</div>:null}
  {organization.status!=="published"?<div role="status" aria-live="polite" className="mt-6 break-words rounded-2xl border border-accent/50 bg-accent/40 p-4 text-sm leading-6 text-accent-foreground">{organization.status==="draft"?"This organization is waiting for moderator approval and is not visible to the community yet.":`This organization was not approved.${organization.moderation_note?` Reason: ${organization.moderation_note}`:""} Edit it to submit it for review again.`}</div>:null}

  <section className="relative mt-6 overflow-hidden rounded-[2rem] border border-border/80 bg-card shadow-[0_18px_60px_rgb(15_23_42/0.055)]">
   <div className="relative">{organization.cover_url?<ExternalImage src={organization.cover_url} alt={`${organization.name} cover`} width={1200} height={400} className="h-44 w-full object-cover md:h-64"/>:<div className="h-44 bg-[radial-gradient(circle_at_18%_20%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_30%),radial-gradient(circle_at_84%_65%,color-mix(in_oklab,var(--accent)_60%,transparent),transparent_30%),linear-gradient(to_right,var(--muted),var(--card))] md:h-64"/>}<div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card/70 to-transparent"/></div>

   <div className="relative z-10 px-6 pb-8 md:px-10 md:pb-10">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
     <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start"><div className="-mt-14 shrink-0">
      {organization.logo_url?<ExternalImage src={organization.logo_url} alt={`${organization.name} logo`} width={112} height={112} className="size-28 rounded-[1.65rem] border-4 border-card object-cover shadow-md"/>:<div className="flex size-28 items-center justify-center rounded-[1.65rem] border-4 border-card bg-primary/10 text-4xl font-bold text-primary shadow-md">{organization.name.charAt(0).toUpperCase()}</div>}</div>
      <div className="min-w-0 pt-1 sm:pt-5"><div className="flex flex-wrap items-center gap-2">{organization.organization_type?<span className="max-w-full break-words rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{organization.organization_type}</span>:null}{organization.is_verified?<VerificationBadge/>:null}{organization.is_accepting_volunteers?<span className="inline-flex items-center gap-1 rounded-full bg-accent/60 px-3 py-1 text-xs font-semibold text-accent-foreground"><HandHeart aria-hidden="true" className="size-3.5"/>Volunteers welcome</span>:null}</div><h1 className="mt-3 break-words text-3xl font-bold tracking-[-0.03em] text-foreground md:text-5xl">{organization.name}</h1>{location?<p className="mt-2 flex items-start gap-2 text-sm leading-6 text-muted-foreground"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary"/><span className="min-w-0 break-words">{location}</span></p>:null}</div>
     </div>
     {canEdit||canVerify?<div className="flex shrink-0 flex-wrap gap-3 pb-1 sm:pt-5">{canEdit?<Link href={`/organizations/${organization.slug}/edit`} className="inline-flex rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Edit organization</Link>:null}{canVerify?<form action={setOrganizationVerification}><input type="hidden" name="organization_id" value={organization.id}/><input type="hidden" name="slug" value={organization.slug}/><input type="hidden" name="verified" value={organization.is_verified?"false":"true"}/><button type="submit" className="inline-flex rounded-xl border border-primary/25 bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{organization.is_verified?"Remove verification":"Verify organization"}</button></form>:null}</div>:null}
    </div>
    {organization.short_description?<p className="mt-7 max-w-3xl break-words text-lg leading-8 text-muted-foreground">{organization.short_description}</p>:null}
    {organization.is_verified?<VerificationNote/>:null}
   </div>

   <div className="grid border-t border-border/70 lg:grid-cols-[minmax(0,1fr)_340px]">
    <div className="space-y-9 px-6 py-8 md:px-10 md:py-10 lg:border-r lg:border-border/70">
     {organization.description?<section><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">About the organization</p><p className="mt-5 whitespace-pre-line break-words text-[1.02rem] leading-8 text-foreground/88">{organization.description}</p></section>:null}
     {organization.mission?<section className="relative overflow-hidden rounded-3xl border border-primary/10 bg-primary/[0.045] p-6 md:p-7"><div aria-hidden="true" className="absolute -right-10 -top-10 size-32 rounded-full border border-primary/10"/><div className="relative flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-primary"><UsersRound aria-hidden="true" className="size-4.5"/></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Why they exist</p><h2 className="mt-1 text-xl font-semibold text-foreground">Mission</h2></div></div><p className="relative mt-5 whitespace-pre-line break-words leading-8 text-foreground/82">{organization.mission}</p></section>:null}
     {programs.length?<section className="border-t border-border/70 pt-8"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-primary"><Sparkles aria-hidden="true" className="size-4.5"/></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">What they do</p><h2 className="mt-1 text-xl font-semibold text-foreground">Programs</h2></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{programs.map(program=><div key={program} className="break-words rounded-2xl border border-border bg-muted/30 px-4 py-3.5 text-sm font-medium text-foreground">{program}</div>)}</div></section>:null}
    </div>

    <aside className="bg-muted/25 px-6 py-8 md:px-8 lg:sticky lg:top-20 lg:h-fit">
     <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Connect</p>
     {organization.website_url?<a href={organization.website_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Visit website<ExternalLink aria-hidden="true" className="size-4"/></a>:null}
     {organization.is_accepting_volunteers?<div className="mt-4 rounded-2xl border border-primary/15 bg-primary/5 p-4"><div className="flex items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><HandHeart aria-hidden="true" className="size-4"/></span><div><p className="font-semibold text-foreground">Volunteers welcome</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Reach out to ask how you can contribute.</p></div></div></div>:null}
     <div className="mt-6 space-y-4 border-t border-border/70 pt-6 text-sm">
      {organization.email?<a href={`mailto:${organization.email}`} className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4 transition hover:border-primary/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><Mail aria-hidden="true" className="size-4"/></span><span className="min-w-0"><span className="block text-xs text-muted-foreground">Email</span><span className="mt-1 block break-words font-semibold text-foreground">{organization.email}</span></span></a>:null}
      {organization.phone?<a href={`tel:${organization.phone}`} className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4 transition hover:border-primary/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><Phone aria-hidden="true" className="size-4"/></span><span><span className="block text-xs text-muted-foreground">Phone</span><span className="mt-1 block break-all font-semibold text-foreground">{organization.phone}</span></span></a>:null}
      {location?<div className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><MapPin aria-hidden="true" className="size-4"/></span><div className="min-w-0"><p className="text-xs text-muted-foreground">Location</p><p className="mt-1 break-words font-semibold text-foreground">{location}</p></div></div>:null}
     </div>
    </aside>
   </div>
  </section>
 </div></main>;
}