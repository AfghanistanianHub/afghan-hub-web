"use client";

import { BadgeCheck, ShieldCheck } from "lucide-react";

import { B, useBrowseCopy } from "@/components/i18n/browse";

type VerificationBadgeProps = {
  compact?: boolean;
};

export function VerificationBadge({ compact = false }: VerificationBadgeProps) {
  const { language, t } = useBrowseCopy();
  const explanation = t("verification.explanation");
  const label = t("verification.aria", { explanation });

  if (compact) {
    return (
      <span
        lang={language}
        className="inline-flex shrink-0 items-center text-primary"
        aria-label={label}
        title={explanation}
      >
        <BadgeCheck aria-hidden="true" className="size-4" />
      </span>
    );
  }

  return (
    <span
      lang={language}
      className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-background/90 px-3 py-1 text-xs font-semibold text-primary"
      title={explanation}
    >
      <BadgeCheck aria-hidden="true" className="size-4" />
      <B k="verification.label" />
    </span>
  );
}

export function VerificationNote() {
  return (
    <div className="mt-5 flex max-w-2xl items-start gap-3 rounded-2xl border border-primary/10 bg-primary/[0.045] px-4 py-3.5 text-sm leading-6 text-muted-foreground">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
        <ShieldCheck aria-hidden="true" className="size-4" />
      </span>
      <p>
        <B k="verification.meaning" className="font-semibold text-foreground" />{" "}
        <B k="verification.explanation" />
      </p>
    </div>
  );
}
