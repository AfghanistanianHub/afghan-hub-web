"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale, useMessages } from "./locale-provider";
import { locales } from "@/lib/i18n/locale";
const labels = { en: "English", fa: "فارسی", ps: "پښتو" };
export function LanguageSwitcher() {
  const locale = useLocale(); const t = useMessages();
  const pathname = usePathname(); const params = useSearchParams();
  const next = pathname + (params.size ? `?${params}` : "");
  return <details className="interface-language-switcher"><summary aria-label={t("Language")}>{labels[locale]}</summary><nav aria-label={t("Language")}>
    {locales.map(language => <a key={language} lang={language} dir={language === "en" ? "ltr" : "rtl"} aria-current={locale === language ? "true" : undefined} href={`/language/select?locale=${language}&next=${encodeURIComponent(next)}`} onClick={event => {
      // Hashes are client-only; include them while preserving the native no-JS destination.
      event.currentTarget.href = `/language/select?locale=${language}&next=${encodeURIComponent(next + window.location.hash)}`;
    }}>{labels[language]}</a>)}
  </nav></details>;
}
