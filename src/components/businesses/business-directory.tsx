import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { ExternalImage } from "@/components/ui/external-image";
import { VerificationBadge } from "@/components/ui/verification-badge";

type Business={id:string;name:string;slug:string;category:string;short_description:string|null;city:string|null;province_state:string|null;country:string|null;services:string[];logo_url:string|null;is_verified:boolean;is_hiring:boolean};
type BusinessDirectoryProps={businesses:Business[]};
export function BusinessDirectory({businesses}:BusinessDirectoryProps){
 if(!businesses.length)return <div className="surface-panel mt-10 rounded-2xl p-8 text-center"><h2 className="text-xl font-semibold text-foreground">No businesses yet</h2><p className="mt-2 text-muted-foreground">Community businesses will appear here once they are added.</p></div>;
 return <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{businesses.map((business)=>{const location=[business.city,business.province_state,business.country].filter(Boolean).join(", ");return <Link key={business.id} href={`/businesses/${business.slug}`} className="surface-panel group relative overflow-hidden rounded-[1.75rem] p-6 transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_42px_rgb(15_23_42/0.07)]">
  <div aria-hidden="true" className="absolute -right-10 -top-10 size-28 rounded-full border border-primary/10"/>
  <div className="relative flex items-start gap-4">{business.logo_url?<ExternalImage src={business.logo_url} alt={`${business.name} logo`} width={56} height={56} className="size-14 rounded-2xl border border-border object-cover"/>:<div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">{business.name.charAt(0).toUpperCase()}</div>}<div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="truncate text-lg font-semibold text-foreground transition group-hover:text-primary">{business.name}</h2>{business.is_verified?<VerificationBadge compact/>:null}</div><p className="mt-1 text-sm text-muted-foreground">{business.category}</p></div><ArrowUpRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"/></div>
  {business.short_description?<p className="relative mt-5 line-clamp-3 leading-6 text-muted-foreground">{business.short_description}</p>:<p className="relative mt-5 text-sm text-muted-foreground">No description provided.</p>}
  {business.services.length?<div className="relative mt-5 flex flex-wrap gap-2">{business.services.slice(0,4).map((service)=><span key={service} className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">{service}</span>)}</div>:null}
  <div className="relative mt-5 flex flex-wrap items-center gap-2 border-t border-border/70 pt-4 text-sm text-muted-foreground">{location?<span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-primary"/>{location}</span>:null}{business.is_hiring?<span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Hiring now</span>:null}</div>
 </Link>})}</div>;
}
