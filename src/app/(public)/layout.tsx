import { getLocale } from "@/lib/i18n/server";
import { translate } from "@/lib/i18n/messages";
import { Suspense } from "react";
import Link from "next/link";
import { Brand } from "@/components/public/brand";
import { communityAreas } from "@/components/public/community-areas";
import { PublicNavigation } from "@/components/public/public-navigation";
import styles from "@/components/public/public-navigation.module.css";

// Public reads remain fresh when a listing is unpublished or edited.
export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const t = (text: string) => translate(locale, text);
  return <div className="public-shell flex min-h-screen flex-col font-sans [&>main]:flex-1">
    <a href="#main-content" className="sr-only fixed left-4 top-4 z-50 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground focus:not-sr-only focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{t("Skip to content")}</a>
    <Suspense><PublicNavigation /></Suspense>
    {children}
    <footer className={styles.footer}>
      <div><Brand /><p>{t("A more connected Afghan future. A place for people, possibilities, and meaningful connections.")}</p></div>
      <nav aria-label="Explore footer"><h2>{t("Explore")}</h2>{communityAreas.map(area => <Link key={area.key} href={area.href}>{t(area.label)}</Link>)}</nav>
      <nav aria-label="Platform footer"><h2>{t("Platform")}</h2><Link href="/about">{t("About")}</Link><Link href="/#how-it-works">{t("How it works")}</Link><Link href="/#ai-navigator">{t("AI Navigator")}</Link><Link href="/login?mode=join">{t("Get started")}</Link><Link href="/login">{t("Sign in")}</Link></nav>
      <nav aria-label="Support and legal"><h2>{t("Support")}</h2><Link href="/support">{t("Contact & help")}</Link><Link href="/privacy">{t("Privacy")}</Link><Link href="/terms">{t("Terms")}</Link><Link href="/support">{t("Accessibility help")}</Link></nav>
      <p className={styles.copyright}>© {new Date().getFullYear()} {t("Afghan Hub. All rights reserved.")}</p>
    </footer>
  </div>;
}
