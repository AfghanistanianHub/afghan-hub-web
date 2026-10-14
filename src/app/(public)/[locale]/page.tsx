import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicHome from "@/components/public/localized-home";
import { parseLocale } from "@/lib/i18n/locale";
import { translate } from "@/lib/i18n/messages";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  if (!locale) return {};
  const title = translate(locale, "One network. Many ways to belong.");
  const description = translate(locale, "Afghan Hub connects people, businesses, organizations, opportunities, and events — creating space for meaningful connections, collaboration, and shared progress.");
  const canonical = `https://app.apnbc.ca/${locale}`;
  return { title, description, alternates: { canonical, languages: { en: "https://app.apnbc.ca/en", fa: "https://app.apnbc.ca/fa", ps: "https://app.apnbc.ca/ps", "x-default": "https://app.apnbc.ca/" } }, openGraph: { title, description, url: canonical, locale: locale === "en" ? "en_CA" : locale === "fa" ? "fa_AF" : "ps_AF", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Afghan Hub" }] }, twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] } };
}
export default async function LocalizedPage({ params }: { params: Promise<{ locale: string }> }) {
  const raw = (await params).locale;
  if (!["en", "fa", "ps"].includes(raw)) notFound();
  return <PublicHome />;
}
