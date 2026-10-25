"use client";

import { useUiCopy } from "@/components/i18n/localized";
import type { PublicKind } from "@/lib/public-catalog";
import type { UiCopyKey } from "@/lib/i18n/ui-copy";

/** Sentences whose category noun must itself be translated (All…, About this…, Discover more…). */
export function CatalogCategoryLine({
  kind,
  k,
}: {
  kind: PublicKind;
  k: "detail.all" | "detail.about" | "detail.keepExploringBody";
}) {
  const { language, t } = useUiCopy();
  const nounKey = (k === "detail.about"
    ? `categories.${kind}.singular`
    : `categories.${kind}.label`) as UiCopyKey;
  const noun = t(nounKey);
  return <>{t(k, { category: language === "en" ? noun.toLowerCase() : noun })}</>;
}
