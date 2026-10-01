import type { PublicKind } from "@/lib/public-catalog";
import { EventsIllustration, OpportunitiesIllustration, OrganizationsIllustration, PeopleIllustration } from "./community-illustrations";

import motion from "./illustration-motion.module.css";

// Public category covers use the same drawing vocabulary as discovery panels.
export function CatalogIllustration({ kind }: { kind: PublicKind | "people" }) {
  return <div className={motion.art} data-category-illustration={kind}><CategoryArtwork kind={kind} /></div>;
}

function CategoryArtwork({ kind }: { kind: PublicKind | "people" }) {
  if (kind === "people") return <PeopleIllustration />;
  if (kind === "events") return <EventsIllustration />;
  if (kind === "opportunities") return <OpportunitiesIllustration />;
  if (kind === "organizations") return <OrganizationsIllustration />;
  return (
    <svg viewBox="0 0 300 210" fill="none" aria-hidden="true">
      <g stroke="#9e978e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M37 160 148 196 270 151 M60 103l84 27 89-29v66l-89 28-84-27Z M144 130v65" />
        <path d="m60 103 12-32 84 26-12 33m12-33 89-28-12 32 M72 71l89-28 84 26" />
        <path d="M88 123v29l30 10v-29Z M172 141l38-12v30l-38 12Z" />
      </g>
      <path data-motion="shop-awning" d="m72 71 89-28 84 26-89 28Z" fill="#ede5f4" stroke="#624291" strokeWidth="1.7" />
      <path d="m107 64 84 26m-55-35 84 26 M172 141l38-12" stroke="#624291" strokeWidth="1.5" />
      <path data-motion="shop-door" d="m223 125 12-4v20l-12 4Z" fill="#dc754e" />
      <path data-motion="shop-route" pathLength="1" d="M37 160 144 195 233 167V132" stroke="#624291" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 54h18m-9-9v18" stroke="#b68c28" strokeWidth="1.5" />
    </svg>
  );
}
