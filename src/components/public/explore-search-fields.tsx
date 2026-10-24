"use client";

import { useUiCopy } from "@/components/i18n/localized";
import type { PublicKind } from "@/lib/public-catalog";
import type { UiCopyKey } from "@/lib/i18n/ui-copy";

export function ExploreSearchFields({ kind, search }: { kind: PublicKind; search: string }) {
  const { language, t } = useUiCopy();
  const category = t(`categories.${kind}.label` as UiCopyKey);
  return (
    <>
      <label className="grid min-w-0 gap-2 text-sm font-medium" lang={language}>
        {t("explore.searchCategory", { category })}
        <input
          type="search"
          name="q"
          defaultValue={search}
          maxLength={100}
          placeholder={t("explore.searchPlaceholder")}
          dir={language === "en" ? "ltr" : "rtl"}
          className="min-w-0 rounded-md border border-input bg-card px-4 py-3 outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
        />
      </label>
      <button className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 active:bg-primary/80">
        {t("explore.search")}
      </button>
    </>
  );
}
