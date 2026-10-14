import { Suspense } from "react";
import { PublicNavigation } from "@/components/public/public-navigation";
import { LocalizedPublicFooter } from "@/components/public/localized-public-footer";

// Public reads remain fresh when a listing is unpublished or edited.
export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="public-shell flex min-h-screen flex-col font-sans [&>main]:flex-1">
    <a href="#main-content" className="sr-only fixed left-4 top-4 z-50 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground focus:not-sr-only focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Skip to content</a>
    <Suspense><PublicNavigation /></Suspense>
    {children}
    <LocalizedPublicFooter />
  </div>;
}
