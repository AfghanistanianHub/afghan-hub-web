import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import {
  getProfileCompleteness,
  type ProfileCompletenessInput,
} from "@/lib/profile-completeness";

type ProfileStrengthProps = {
  profile: ProfileCompletenessInput | null | undefined;
  compact?: boolean;
  showAction?: boolean;
};

export function ProfileStrength({
  profile,
  compact = false,
  showAction = true,
}: ProfileStrengthProps) {
  const strength = getProfileCompleteness(profile);
  const nextSteps = strength.missing.slice(0, compact ? 2 : 3);

  return (
    <div className="relative overflow-hidden rounded-[1.65rem] border border-border/80 bg-card p-5 shadow-[0_12px_38px_rgb(15_23_42/0.04)]">
      <div
        aria-hidden="true"
        className="absolute -right-12 -top-12 size-36 rounded-full border border-primary/10"
      />

      <div className="relative flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Profile strength
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] text-foreground">
            {strength.complete ? "You are ready to be discovered" : "Make your profile work harder"}
          </h2>
        </div>
        <span className="shrink-0 text-2xl font-bold tracking-tight text-foreground">
          {strength.percent}%
        </span>
      </div>

      <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-muted" aria-label={`Profile ${strength.percent}% complete`}>
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${strength.percent}%` }}
        />
      </div>

      {strength.complete ? (
        <div className="relative mt-5 flex items-start gap-3 rounded-2xl bg-primary/[0.06] p-4 text-sm leading-6 text-foreground">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4.5 shrink-0 text-primary" />
          Your profile includes the core signals members use to understand and discover you.
        </div>
      ) : (
        <div className="relative mt-5 space-y-3">
          {nextSteps.map((step) => (
            <div key={step.key} className="flex items-start gap-3">
              <Circle aria-hidden="true" className="mt-1 size-3.5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">{step.label}</p>
                {!compact ? (
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                    {step.description}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAction && !strength.complete ? (
        <Link
          href="/profile"
          className="relative mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          Complete profile
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}
