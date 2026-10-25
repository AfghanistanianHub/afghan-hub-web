import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { ExternalImage } from "@/components/ui/external-image";
import { cleanPublicText } from "@/lib/public-content";
import { VerificationBadge } from "@/components/ui/verification-badge";
import { DirectoryEmptyState } from "@/components/catalog/member-page-header";
import { B } from "@/components/i18n/browse";

type Business = { id: string; name: string; slug: string; category: string; short_description: string | null; city: string | null; province_state: string | null; country: string | null; services: string[]; logo_url: string | null; is_verified: boolean; is_hiring: boolean };

export function BusinessDirectory({ businesses }: { businesses: Business[] }) {
  if (!businesses.length) return <DirectoryEmptyState title={<B k="businesses.empty" />} description={<B k="businesses.emptyBody" />} href="/businesses/new" action={<B k="businesses.add" />} />;
  return (
    <div className="mt-4 divide-y divide-border border-y border-border bg-card">
      {businesses.map((business) => {
        const location = [business.city, business.province_state, business.country].filter(Boolean).join(", ");
        return (
          <Link key={business.id} href={`/businesses/${business.slug}`} className="group flex items-start gap-3 px-4 py-5 transition hover:bg-muted/40 focus-visible:relative focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary sm:gap-4">
            {business.logo_url ? <ExternalImage src={business.logo_url} alt="" width={48} height={48} className="size-12 shrink-0 rounded-full border border-border object-cover" /> : <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-lg font-semibold text-primary">{business.name.charAt(0).toUpperCase()}</span>}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><h2 className="break-words text-lg font-semibold group-hover:text-primary">{business.name}</h2>{business.is_verified ? <VerificationBadge compact /> : null}{business.is_hiring ? <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary"><B k="common.hiringNow" /></span> : null}</div>
              <p className="mt-1 text-sm text-muted-foreground">{business.category}</p>
              {cleanPublicText(business.short_description) ? <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-muted-foreground">{cleanPublicText(business.short_description)}</p> : null}
              {location ? <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><span className="break-words">{location}</span></p> : null}
              {business.services.length ? <p className="mt-2 break-words text-xs text-muted-foreground">{business.services.slice(0, 3).join(" · ")}</p> : null}
            </div>
            <ArrowUpRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground rtl:-scale-x-100" />
          </Link>
        );
      })}
    </div>
  );
}
