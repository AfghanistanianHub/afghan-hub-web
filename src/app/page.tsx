import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LanguageEntry } from "@/components/i18n/language-entry";
import { localeCookie, parseLocale } from "@/lib/i18n/locale";
export const metadata: Metadata = { title: "Afghan Hub", alternates: { canonical: "https://app.apnbc.ca/", languages: { en: "https://app.apnbc.ca/en", fa: "https://app.apnbc.ca/fa", ps: "https://app.apnbc.ca/ps", "x-default": "https://app.apnbc.ca/" } } };
export default async function Entry({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const locale = parseLocale(params.lang) ?? parseLocale((await cookies()).get(localeCookie)?.value);
  if (locale) {
    const query = new URLSearchParams();
    for (const [key,value] of Object.entries(params)) if (key !== "lang") { if (Array.isArray(value)) value.forEach(item => query.append(key,item)); else if (value !== undefined) query.set(key,value); }
    redirect(`/${locale}${query.size ? `?${query}` : ""}`);
  }
  // Existing journey deep links go directly to the functional Navigator.
  if (params.journey) redirect(`/en?${new URLSearchParams({ journey: String(params.journey) })}#ai-navigator`);
  return <LanguageEntry />;
}
