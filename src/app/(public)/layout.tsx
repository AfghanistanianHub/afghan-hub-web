import { Suspense } from "react";
import Link from "next/link";
import { Brand } from "@/components/public/brand";
import { communityAreas } from "@/components/public/community-areas";
import { PublicNavigation } from "@/components/public/public-navigation";
import styles from "@/components/public/public-navigation.module.css";

// Public reads remain fresh when a listing is unpublished or edited.
export const dynamic = "force-dynamic";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="public-shell flex min-h-screen flex-col font-sans [&>main]:flex-1">
    <a href="#main-content" className="sr-only fixed left-4 top-4 z-50 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground focus:not-sr-only focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Skip to content</a>
    <Suspense><PublicNavigation /></Suspense>
    {children}
    <footer className={styles.footer}>
      <div><Brand /><p>A more connected Afghan future. A place for people, possibilities, and meaningful connections.</p></div>
      <nav aria-label="Explore footer"><h2>Explore</h2>{communityAreas.map(area => <Link key={area.key} href={area.href}>{area.label}</Link>)}</nav>
      <nav aria-label="Platform footer"><h2>Platform</h2><Link href="/about">About</Link><Link href="/#how-it-works">How it works</Link><Link href="/#ai-navigator">AI Navigator</Link><Link href="/login?mode=join">Get started</Link><Link href="/login">Sign in</Link></nav>
      <nav aria-label="Support and legal"><h2>Support</h2><Link href="/support">Contact &amp; help</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/support">Accessibility help</Link></nav>
      <p className={styles.copyright}>© {new Date().getFullYear()} Afghan Hub. All rights reserved.</p>
    </footer>
  </div>;
}
