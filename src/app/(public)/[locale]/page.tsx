import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicHome from "../page";
import { PublicLocaleSync } from "@/components/i18n/public-locale-sync";
import type { SiteLanguage } from "@/lib/i18n/site-language";

const supported = ["en", "fa", "ps"] as const;
const titles = {
  en: "One network. Many ways to belong.",
  fa: "یک شبکه. راه‌های بسیار برای پیوستن.",
  ps: "یوه شبکه. د ګډون ډېرې لارې.",
};
const descriptions = {
  en: "Afghan Hub connects people, businesses, organizations, opportunities, and events.",
  fa: "افغان هاب افراد، کسب‌وکارها، سازمان‌ها، فرصت‌ها و رویدادها را به هم پیوند می‌دهد.",
  ps: "افغان هاب خلک، سوداګرۍ، سازمانونه، فرصتونه او پېښې سره نښلوي.",
};
function resolveLocale(raw: string): SiteLanguage | null {
  return supported.find(locale => locale === raw) ?? null;
}
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  if (!locale) return {};
  const canonical = `https://app.apnbc.ca/${locale}`;
  return {
    title: titles[locale],
    description: descriptions[locale],
    alternates: {
      canonical,
      languages: { en: "https://app.apnbc.ca/en", fa: "https://app.apnbc.ca/fa", ps: "https://app.apnbc.ca/ps", "x-default": "https://app.apnbc.ca/" },
    },
    openGraph: { title: titles[locale], description: descriptions[locale], url: canonical, locale: locale === "en" ? "en_CA" : locale === "fa" ? "fa_AF" : "ps_AF" },
  };
}
export default async function LocaleHomepage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = resolveLocale((await params).locale);
  if (!locale) notFound();
  return <><PublicLocaleSync locale={locale} /><PublicHome /></>;
}
