import Link from "next/link";
import { MapPin } from "lucide-react";
import { ExternalImage } from "@/components/ui/external-image";
import { VerificationBadge } from "@/components/ui/verification-badge";

type Organization = { id:string; name:string; slug:string; short_description:string|null; organization_type:string|null; city:string|null; province_state:string|null; country:string|null; logo_url:string|null; is_verified:boolean; is_accepting_volunteers:boolean };
type OrganizationDirectoryProps = { organizations: Organization[] };

export function OrganizationDirectory({ organizations }: OrganizationDirectoryProps) {
  if (!organizations.length) return <div className="surface-panel mt-10 rounded-2xl p-8 text-center"><h2 className="text-xl font-semibold text-foreground">No organizations yet</h2><p className="mt-2 text-muted-foreground">Community organizations will appear here once they are added.</p></div>;
  return <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{organizations.map((organization) => {
    const location=[organization.city,organization.province_state,organization.country].filter(Boolean).join(", ");
    return <Link key={organization.id} href={`/organizations/${organization.slug}`} className="surface-panel group rounded-2xl p-6 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start gap-4">{organization.logo_url ? <ExternalImage src={organization.logo_url} alt={`${organization.name} logo`} width={56} height={56} className="size-14 rounded-2xl border border-border object-cover"/> : <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">{organization.name.charAt(0).toUpperCase()}</div>}
        <div className="min-w-0"><div className="flex items-center gap-2"><h2 className="truncate text-lg font-semibold text-foreground transition group-hover:text-primary">{organization.name}</h2>{organization.is_verified ? <VerificationBadge compact/> : null}</div>{organization.organization_type ? <p className="mt-1 text-sm text-muted-foreground">{organization.organization_type}</p> : null}</div>
      </div>
      {organization.short_description ? <p className="mt-5 line-clamp-3 leading-6 text-muted-foreground">{organization.short_description}</p> : <p className="mt-5 text-sm text-muted-foreground">No description provided.</p>}
      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">{location ? <span className="inline-flex items-center gap-1.5"><MapPin className="size-4 text-primary"/>{location}</span> : null}{organization.is_accepting_volunteers ? <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Accepting volunteers</span> : null}</div>
    </Link>;
  })}</div>;
}
