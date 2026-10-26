import { PendingSubmitButton } from "@/components/forms/pending-submit-button";
import { MemberListingArtwork } from "@/components/public/member-listing-artwork";
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
import { B } from "@/components/i18n/browse";
import { verificationActionErrorKey } from "@/lib/i18n/browse-copy";
import { getMyAccessContext } from "@/lib/profile-access";
import { createClient } from "@/lib/supabase/server";

type OrganizationPageProps={params:Promise<{slug:string}>;searchParams:Promise<{error?:string}>};
export default async function OrganizationPage({params,searchParams}:OrganizationPageProps){
 const {slug}=await params; const {error:actionError}=await searchParams; const supabase=await createClient();
 const {data:organization,error}=await supabase.from("organizations").select(`id,name,slug,short_description,description,organization_type,mission,programs,website_url,email,phone,city,province_state,country,logo_url,cover_url,is_verified,is_accepting_volunteers,status,owner_id`).eq("slug",slug).maybeSingle();
 if(error||!organization)notFound();
 const {data:{user}}=await supabase.auth.getUser();
 const {data:viewerProfile}=user?await getMyAccessContext(supabase,user.id):{data:null};
 const {data: ownerModerationNote}=user?.id===organization.owner_id && organization.status!=="published" ? await supabase.rpc("get_owned_listing_moderation_note",{target_entity_type:"organization",target_entity_id:organization.id}) : {data:null};
 const canEdit=user?.id===organization.owner_id; const canVerify=viewerProfile?.role==="admin"&&organization.status==="published";
 const programs=Array.isArray(organization.programs)?organization.programs.filter((program:unknown):program is string=>typeof program==="string"):[];
 const location=[organization.city,organization.province_state,organization.country].filter(Boolean).join(", ");
 return <main data-illustration-focus-scope className="px-4 py-8 md:px-8"><div className="mx-auto max-w-6xl">
  <Link href="/organizations" className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium text-primary transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180"/><B k="detail.backToOrganizations" /></Link>
  {actionError?<div role="alert" aria-live="assertive" className="mt-6 rounded-[var(--radius)] border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"><B k={verificationActionErrorKey(actionError)} /></div>:null}
  {organization.status!=="published"?<div role="status" aria-live="polite" className="mt-6 rounded-[var(--radius)] border border-accent/50 bg-accent/40 p-4 text-sm leading-6 text-accent-foreground">{organization.status==="draft"?<B k="organizationDetail.draft" />:ownerModerationNote?<B k="organizationDetail.rejectedReason" values={{reason:ownerModerationNote}} />:<B k="organizationDetail.rejected" />}</div>:null}

  <section data-illustration-trigger className="relative mt-6 overflow-hidden rounded-sm border border-border bg-card">
   <div className="relative">{organization.cover_url?<ExternalImage src={organization.cover_url} alt="" width={1200} height={400} className="h-44 w-full object-cover md:h-64"/>:<MemberListingArtwork kind="organizations" />}<div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card/70 to-transparent"/></div>

   <div className="relative z-10 px-6 pb-8 md:px-10 md:pb-10">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
     <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start"><div className="-mt-14 shrink-0">
      {organization.logo_url?<ExternalImage src={organization.logo_url} alt="" width={112} height={112} className="size-28 rounded-[var(--radius)] border-4 border-card object-cover"/>:<div className="flex size-28 items-center justify-center rounded-[var(--radius)] border-4 border-card bg-primary/10 text-4xl font-bold text-primary">{organization.name.charAt(0).toUpperCase()}</div>}</div>
      <div className="min-w-0 pt-1 sm:pt-5"><div className="flex flex-wrap items-center gap-2">{organization.organization_type?<span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{organization.organization_type}</span>:null}{organization.is_verified?<VerificationBadge/>:null}{organization.is_accepting_volunteers?<span className="inline-flex items-center gap-1 rounded-full bg-accent/60 px-3 py-1 text-xs font-semibold text-accent-foreground"><HandHeart aria-hidden="true" className="size-3.5"/><B k="organizationDetail.volunteersWelcome" /></span>:null}</div><h1 className="mt-3 break-words text-3xl font-medium tracking-[-0.03em] text-foreground md:text-4xl">{organization.name}</h1>{location?<p className="mt-2 flex items-start gap-2 text-sm leading-6 text-muted-foreground"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary"/><span className="min-w-0 break-words">{location}</span></p>:null}</div>
     </div>
     {canEdit||canVerify?<div className="flex shrink-0 flex-wrap gap-3 pb-1 sm:pt-5">{canEdit?<Link href={`/organizations/${organization.slug}/edit`} className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius)] border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors motion-reduce:transition-none active:brightness-95 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><B k="organizationDetail.edit" /></Link>:null}{canVerify?<form action={setOrganizationVerification}><input type="hidden" name="organization_id" value={organization.id}/><input type="hidden" name="slug" value={organization.slug}/><input type="hidden" name="verified" value={organization.is_verified?"false":"true"}/><PendingSubmitButton pendingLabel={<B k="businessDetail.updating" />} className="inline-flex min-h-11 min-w-48 items-center justify-center rounded-[var(--radius)] border border-primary/25 bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary transition-colors motion-reduce:transition-none active:brightness-95 hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{organization.is_verified?<B k="organizationDetail.removeVerification" />:<B k="organizationDetail.verify" />}</PendingSubmitButton></form>:null}</div>:null}
    </div>
    {organization.short_description?<p className="mt-7 max-w-3xl break-words text-lg leading-8 text-muted-foreground">{organization.short_description}</p>:null}
    {organization.is_verified?<VerificationNote/>:null}
   </div>

   <div className="grid border-t border-border/70 lg:grid-cols-[minmax(0,1fr)_340px]">
    <div className="space-y-9 px-6 py-8 md:px-10 md:py-10 lg:border-r lg:border-border/70">
     {organization.description?<section><B k="organizationDetail.about" className="text-xs font-semibold uppercase tracking-[0.18em] text-primary" /><p className="mt-5 whitespace-pre-line break-words text-[1.02rem] leading-8 text-foreground/88">{organization.description}</p></section>:null}
     {organization.mission?<section className="relative overflow-hidden rounded-[var(--radius)] border border-primary/10 bg-primary/[0.045] p-6 md:p-7"><div aria-hidden="true" className="absolute -right-10 -top-10 size-32 rounded-full border border-primary/10"/><div className="relative flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-[var(--radius)] bg-secondary text-primary"><UsersRound aria-hidden="true" className="size-4.5"/></span><div><B k="organizationDetail.why" className="text-xs font-semibold uppercase tracking-[0.16em] text-primary" /><h2 className="mt-1 text-xl font-semibold text-foreground"><B k="organizationDetail.mission" /></h2></div></div><p className="relative mt-5 whitespace-pre-line break-words leading-8 text-foreground/82">{organization.mission}</p></section>:null}
     {programs.length?<section className="border-t border-border/70 pt-8"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-[var(--radius)] bg-secondary text-primary"><Sparkles aria-hidden="true" className="size-4.5"/></span><div><B k="organizationDetail.whatTheyDo" className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground" /><h2 className="mt-1 text-xl font-semibold text-foreground"><B k="organizationDetail.programs" /></h2></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{programs.map(program=><div key={program} className="break-words rounded-[var(--radius)] border border-border bg-muted/30 px-4 py-3.5 text-sm font-medium text-foreground">{program}</div>)}</div></section>:null}
    </div>

    <aside className="bg-muted/25 px-6 py-8 md:px-8 lg:sticky lg:top-20 lg:h-fit">
     <B k="organizationDetail.connect" className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground" />
     {organization.website_url?<a href={organization.website_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[var(--radius)] bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground transition-colors motion-reduce:transition-none active:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><B k="organizationDetail.visitWebsite" /><ExternalLink aria-hidden="true" className="size-4"/></a>:null}
     {organization.is_accepting_volunteers?<div className="mt-4 rounded-[var(--radius)] border border-primary/15 bg-primary/5 p-4"><div className="flex items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius)] bg-secondary text-primary"><HandHeart aria-hidden="true" className="size-4"/></span><div><p className="font-semibold text-foreground"><B k="organizationDetail.volunteersWelcome" /></p><p className="mt-1 text-xs leading-5 text-muted-foreground"><B k="organizationDetail.volunteerBody" /></p></div></div></div>:null}
     <div className="mt-6 space-y-4 border-t border-border/70 pt-6 text-sm">
      {organization.email?<a href={`mailto:${organization.email}`} className="flex items-start gap-3 rounded-[var(--radius)] border border-border bg-background p-4 transition-colors motion-reduce:transition-none active:bg-secondary hover:border-primary/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius)] bg-secondary text-primary"><Mail aria-hidden="true" className="size-4"/></span><span className="min-w-0"><B k="common.email" className="block text-xs text-muted-foreground" /><span dir="ltr" className="mt-1 block break-words font-semibold text-foreground">{organization.email}</span></span></a>:null}
      {organization.phone?<a href={`tel:${organization.phone}`} className="flex items-start gap-3 rounded-[var(--radius)] border border-border bg-background p-4 transition-colors motion-reduce:transition-none active:bg-secondary hover:border-primary/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius)] bg-secondary text-primary"><Phone aria-hidden="true" className="size-4"/></span><span><B k="common.phone" className="block text-xs text-muted-foreground" /><span dir="ltr" className="mt-1 block font-semibold text-foreground">{organization.phone}</span></span></a>:null}
      {location?<div className="flex items-start gap-3 rounded-[var(--radius)] border border-border bg-background p-4"><span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius)] bg-secondary text-primary"><MapPin aria-hidden="true" className="size-4"/></span><div className="min-w-0"><B k="common.location" className="text-xs text-muted-foreground" /><p className="mt-1 break-words font-semibold text-foreground">{location}</p></div></div>:null}
     </div>
    </aside>
   </div>
  </section>
 </div></main>;
}
