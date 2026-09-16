import { BadgeCheck, ShieldCheck } from "lucide-react";

export const VERIFICATION_EXPLANATION =
  "Afghan Hub administrators have marked this listing as verified. Verification is not an endorsement or guarantee.";

type VerificationBadgeProps = {
  compact?: boolean;
};

export function VerificationBadge({ compact = false }: VerificationBadgeProps) {
  if (compact) {
    return (
      <span
        className="inline-flex shrink-0 items-center text-primary"
        aria-label={`Verified listing. ${VERIFICATION_EXPLANATION}`}
        title={VERIFICATION_EXPLANATION}
      >
        <BadgeCheck aria-hidden="true" className="size-4" />
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-background/90 px-3 py-1 text-xs font-semibold text-primary"
      title={VERIFICATION_EXPLANATION}
    >
      <BadgeCheck aria-hidden="true" className="size-4" />
      Verified listing
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
        <span className="font-semibold text-foreground">What verification means: </span>
        {VERIFICATION_EXPLANATION}
      </p>
    </div>
  );
}
