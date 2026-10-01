import type { PublicKind } from "@/lib/public-catalog";
import { CatalogIllustration } from "./catalog-illustration";

export function MemberListingArtwork({ kind }: { kind: PublicKind }) {
  return <div aria-hidden="true" className="flex h-44 items-center justify-center border-b border-border bg-background md:h-64">
    <div className="w-60 max-w-[80%] md:w-72"><CatalogIllustration interactive kind={kind} /></div>
  </div>;
}
