import { setBusinessVerification } from "@/app/(dashboard)/businesses/actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import { ExternalImage } from "@/components/ui/external-image";
import { VerificationBadge, VerificationNote } from "@/components/ui/verification-badge";
import { getMyAccessContext } from "@/lib/profile-access";
import { createClient } from "@/lib/supabase/server";

type BusinessPageProps={params:Promise<{slug:string}>;searchParams:Promise<{error?:string}>};
export default async function BusinessPage({params,searchParams}:BusinessPageProps){
 const {slug}=await params; const {error:actionError}=await searchParams; const supabase=await createClient();
 const {data:business,error}=await supabase.from("businesses").select(`id,name,slug,category,short_description,description,services,website_url,email,phone,address_line,city,province_state,country,logo_url,cover_url,is_verified,is_hiring,status,moderation_note,owner_id`).eq("slug",slug).maybeSingle();
 if(error||!business)notFound();
 const {data:{user}}=await supabase.auth.getUser();
 const {data:viewerProfile}=user?await getMyAccessContext(supabase,user.id):{data:null};
 const canEdit=user?.id===business.owner_id; const canVerify=viewerProfile?.role==="admin"&&business.status==="published";
 const services=Array.isArray(business.services)?business.services.filter((service:unknown):service is string=>typeof service==="string"):[];
 const location=[business.city,business.province_state,business.country].filter(Boolean).join(", ");
 return <main className="px-4 py-8 md:px-8"><div className="mx-auto max-w-6xl">
  <Link href="/businesses" className="inline-flex items-center gap-2 rounded-sm text-sm font-medium text-primary transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><ArrowLeft aria-hidden="true" className="size-4"/>Back to businesses</Link>
  {actionError?<div role="alert" aria-live="assertive" className="mt-6 break-words rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm leading-6 text-destructive">{actionError}</div>:null}
  {business.status!=="published"?<div role="status" aria-live="polite" className="mt-6 break-words rounded-2xl border border-accent/50 bg-accent/40 p-4 text-sm leading-6 text-accent-foreground">{business.status==="draft"?"This business is waiting for moderator approval and is not visible to the community yet.":`This business was not approved.${business.moderation_note?` Reason: ${business.moderation_note}`:""} Edit it to submit it for review again.`}</div>:null}

  <section className="relative mt-6 overflow-hidden rounded-[2rem] border border-border/80 bg-card shadow-[0_18px_60px_rgb(15_23_42/0.055)]">
   <div className="relative">{business.cover_url?<ExternalImage src={business.cover_url} alt={`${business.name} cover`} width={1200} height={400} className="h-44 w-full object-cover md:h-64"/>:<div className="h-44 bg-[radial-gradient(circle_at_18%_20%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_30%),radial-gradient(circle_at_82%_70%,color-mix(in_oklab,var(--accent)_55%,transparent),transparent_30%),linear-gradient(to_right,var(--muted),var(--card))] md:h-64"/>}<div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card/70 to-transparent"/></div>

   <div className="relative z-10 px-6 pb-8 md:px-10 md:pb-10">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
     <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start"><div className="-mt-14 shrink-0">
      {business.logo_url?<ExternalImage src={business.logo_url} alt={`${business.name} logo`} width={112} height={112} className="size-28 rounded-[1.65rem] border-4 border-card object-cover shadow-md"/>:<div className="flex size-28 items-center justify-center rounded-[1.65rem] border-4 border-card bg-primary/10 text-4xl font-bold text-primary shadow-md">{business.name.charAt(0).toUpperCase()}</div>}</div>
      <div className="min-w-0 pt-1 sm:pt-5"><div className="flex flex-wrap items-center gap-2">{business.category?<span className="max-w-full break-words rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{business.category}</span>:null}{business.is_verified?<VerificationBadge/>:null}{business.is_hiring?<span className="inline-flex items-center gap-1 rounded-full bg-accent/60 px-3 py-1 text-xs font-semibold text-accent-foreground"><BriefcaseBusiness aria-hidden="true" className="size-3.5"/>Hiring</span>:null}</div><h1 className="mt-3 break-words text-3xl font-bold tracking-[-0.03em] text-foreground md:text-5xl">{business.name}</h1>{location?<p className="mt-2 flex items-start gap-2 text-sm leading-6 text-muted-foreground"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary"/><span className="min-w-0 break-words">{location}</span></p>:null}</div>
     </div>
     {canEdit||canVerify?<div className="flex shrink-0 flex-wrap gap-3 pb-1 sm:pt-5">{canEdit?<Link href={`/businesses/${business.slug}/edit`} className="inline-flex rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Edit business</Link>:null}{canVerify?<form action={setBusinessVerification}><input type="hidden" name="business_id" value={business.id}/><input type="hidden" name="slug" value={business.slug}/><input type="hidden" name="verified" value={business.is_verified?"false":"true"}/><button type="submit" className="inline-flex rounded-xl border border-primary/25 bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{business.is_verified?"Remove verification":"Verify business"}</button></form>:null}</div>:null}
    </div>
    {business.short_description?<p className="mt-7 max-w-3xl break-words text-lg leading-8 text-muted-foreground">{business.short_description}</p>:null}
    {business.is_verified?<VerificationNote/>:null}
   </div>

   <div className="grid border-t border-border/70 lg:grid-cols-[minmax(0,1fr)_340px]">
    <div className="space-y-8 px-6 py-8 md:px-10 md:py-10 lg:border-r lg:border-border/70">
     {business.description?<section><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">About the business</p><p className="mt-5 whitespace-pre-line break-words text-[1.02rem] leading-8 text-foreground/88">{business.description}</p></section>:null}
     {services.length?<section className="border-t border-border/70 pt-8"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-primary"><Sparkles aria-hidden="true" className="size-4.5"/></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">What they offer</p><h2 className="mt-1 text-xl font-semibold text-foreground">Services</h2></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{services.map(service=><div key={service} className="break-words rounded-2xl border border-border bg-muted/30 px-4 py-3.5 text-sm font-medium text-foreground">{service}</div>)}</div></section>:null}
    </div>

    <aside className="bg-muted/25 px-6 py-8 md:px-8 lg:sticky lg:top-20 lg:h-fit">
     <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Connect</p>
     {business.website_url?<a href={business.website_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Visit website<ExternalLink aria-hidden="true" className="size-4"/></a>:null}
     <div className="mt-6 space-y-4 border-t border-border/70 pt-6 text-sm">
      {business.email?<a href={`mailto:${business.email}`} className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4 transition hover:border-primary/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><Mail aria-hidden="true" className="size-4"/></span><span className="min-w-0"><span className="block text-xs text-muted-foreground">Email</span><span className="mt-1 block break-words font-semibold text-foreground">{business.email}</span></span></a>:null}
      {business.phone?<a href={`tel:${business.phone}`} className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4 transition hover:border-primary/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><Phone aria-hidden="true" className="size-4"/></span><span><span className="block text-xs text-muted-foreground">Phone</span><span className="mt-1 block break-all font-semibold text-foreground">{business.phone}</span></span></a>:null}
      {business.address_line||location?<div className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><MapPin aria-hidden="true" className="size-4"/></span><div className="min-w-0"><p className="text-xs text-muted-foreground">Location</p>{business.address_line?<p className="mt-1 break-words font-semibold text-foreground">{business.address_line}</p>:null}{location?<p className="mt-1 break-words text-muted-foreground">{location}</p>:null}</div></div>:null}
     </div>
    </aside>
   </div>
  </section>
 </div></main>;
}