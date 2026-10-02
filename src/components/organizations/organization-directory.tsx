import Link from "next/link";
import styles from "@/components/network/network-surfaces.module.css";
import { CommunitySignature } from "@/components/public/community-signature";
import { ArrowUpRight, MapPin, UsersRound } from "lucide-react";
import { ExternalImage } from "@/components/ui/external-image";
import { VerificationBadge } from "@/components/ui/verification-badge";

type Organization = { id:string; name:string; slug:string; short_description:string|null; organization_type:string|null; city:string|null; province_state:string|null; country:string|null; logo_url:string|null; is_verified:boolean; is_accepting_volunteers:boolean };
type OrganizationDirectoryProps = { organizations: Organization[] };

export function OrganizationDirectory({ organizations }: OrganizationDirectoryProps) {
  if (!organizations.length) return <div className={`${styles.surface} border border-border bg-card relative mt-10 overflow-hidden rounded-[var(--radius)] p-10 text-center `}><span className="relative mx-auto flex size-14 items-center justify-center rounded-[var(--radius)] bg-primary/10 text-primary"><UsersRound aria-hidden="true" className="size-7"/></span><h2 className="relative mt-5 text-xl font-semibold text-foreground">No organizations yet</h2><p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Community organizations will appear here once they are added.</p><Link href="/organizations/new" className={`${styles.control} inline-flex items-center relative mt-6 inline-flex rounded-[var(--radius)] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground  transition  hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}>Add an organization</Link></div>;
  return <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{organizations.map((organization) => {
    const location=[organization.city,organization.province_state,organization.country].filter(Boolean).join(", ");
    return <Link key={organization.id} href={`/organizations/${organization.slug}`} className={`${styles.surface} ${styles.profile} border border-border bg-card group relative overflow-hidden rounded-[var(--radius)] p-6 transition duration-200  hover:border-primary/30  focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}>
      
      <CommunitySignature className={styles.signature} />
  <div className="relative flex items-start gap-4">{organization.logo_url ? <ExternalImage src={organization.logo_url} alt={`${organization.name} logo`} width={56} height={56} className="size-14 rounded-[var(--radius)] border border-border object-cover"/> : <div className="flex size-14 shrink-0 items-center justify-center rounded-[var(--radius)] bg-primary/10 text-lg font-bold text-primary">{organization.name.charAt(0).toUpperCase()}</div>}
        <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="line-clamp-2 break-words text-lg font-semibold leading-6 text-foreground transition group-hover:text-primary">{organization.name}</h2>{organization.is_verified ? <VerificationBadge compact/> : null}</div>{organization.organization_type ? <p className="mt-1 text-sm text-muted-foreground">{organization.organization_type}</p> : null}</div><ArrowUpRight data-profile-arrow aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground"/>
      </div>
      {organization.short_description ? <p className="relative mt-5 line-clamp-3 break-words leading-6 text-muted-foreground">{organization.short_description}</p> : <p className="relative mt-5 text-sm text-muted-foreground">No description provided.</p>}
      <div className="relative mt-5 flex flex-wrap items-center gap-2 border-t border-border/70 pt-4 text-sm text-muted-foreground">{location ? <span className="inline-flex min-w-0 items-start gap-1.5"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary"/><span className="min-w-0 break-words">{location}</span></span> : null}{organization.is_accepting_volunteers ? <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Accepting volunteers</span> : null}</div>
    </Link>;
  })}</div>;
}
