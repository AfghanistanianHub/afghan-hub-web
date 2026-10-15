import { Suspense } from "react";
import { PublicNavigation } from "@/components/public/public-navigation";
import { LocalizedPublicFooter } from "@/components/public/localized-public-footer";
import { LocalizedSkipLink } from "@/components/public/localized-skip-link";
import { FirstVisitLanguageGate } from "@/components/public/first-visit-language-gate";

// Public reads remain fresh when a listing is unpublished or edited.
export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="public-shell flex min-h-screen flex-col font-sans">
    <FirstVisitLanguageGate>
      <LocalizedSkipLink />
      <Suspense><PublicNavigation /></Suspense>
      {children}
      <LocalizedPublicFooter />
    </FirstVisitLanguageGate>
  </div>;
}
