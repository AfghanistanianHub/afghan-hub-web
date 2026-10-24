"use client";

import { useSiteLanguage } from "@/components/i18n/localized";
import { formatSiteDate } from "@/lib/i18n/format";

export function LocalizedDate({
  value,
  mode = "date",
}: {
  value: string;
  mode?: "date" | "datetime";
}) {
  const language = useSiteLanguage();
  const formatted = formatSiteDate(
    language,
    value,
    mode === "datetime"
      ? { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
      : { year: "numeric", month: "short", day: "numeric" },
  );
  return <time dateTime={value}>{formatted}</time>;
}
