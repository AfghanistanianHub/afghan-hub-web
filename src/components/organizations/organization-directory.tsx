import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { ExternalImage } from "@/components/ui/external-image";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { DirectoryEmptyState } from "@/components/catalog/member-page-header";
import { B } from "@/components/i18n/browse";

type Organization = { id: string; name: string; slug: string; short_description: string | null; organization_type: string | null; city: string | null; province_state: string | null; country: string | null; logo_url: string | null; is_verified: boolean; is_accepting_volunteers: boolean };

export function OrganizationDirectory({ organizations }: { organizations: Organization[] }) {
  if (!organizations.length) return <DirectoryEmptyState title={<B k="organizations.empty" />} description={<B k="organizations.emptyBody" />} href="/organizations/new" action={<B k="organizations.emptyAction" />} />;
  return (
    <div className="mt-4 divide-y divide-border border-y border-border bg-card">
      {organizations.map((organization) => {
        const location = [organization.city, organization.province_state, organization.country].filter(Boolean).join(", ");
        return (
          <Link key={organization.id} href={`/organizations/${organization.slug}`} className="group flex items-start gap-3 px-4 py-5 transition hover:bg-muted/40 focus-visible:relative focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary sm:gap-4">
            {organization.logo_url ? <ExternalImage src={organization.logo_url} alt="" width={48} height={48} className="size-12 shrink-0 rounded-full border border-border object-cover" /> : <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-lg font-semibold text-primary">{organization.name.charAt(0).toUpperCase()}</span>}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><h2 className="break-words text-lg font-semibold group-hover:text-primary">{organization.name}</h2>{organization.is_verified ? <VerificationBadge compact /> : null}{organization.is_accepting_volunteers ? <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary"><B k="common.acceptingVolunteers" /></span> : null}</div>
              {organization.organization_type ? <p className="mt-1 text-sm text-muted-foreground">{organization.organization_type}</p> : null}
              {organization.short_description ? <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-muted-foreground">{organization.short_description}</p> : null}
              {location ? <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><span className="break-words">{location}</span></p> : null}
            </div>
            <ArrowUpRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground rtl:-scale-x-100" />
          </Link>
        );
      })}
    </div>
  );
}
