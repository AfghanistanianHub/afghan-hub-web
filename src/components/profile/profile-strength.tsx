"use client";
import { useSiteLanguage } from "@/components/i18n/localized";
const strengthCopy = {
 en: ["Profile strength", "You are ready to be discovered", "Make your profile work harder", "Your profile includes the core signals members use to understand and discover you.", "Complete profile", "Profile completeness"],
 fa: ["تکمیل پروفایل", "پروفایل شما آماده نمایش است", "پروفایل خود را تکمیل کنید", "پروفایل شما اطلاعات اصلی لازم برای آشنایی دیگر اعضا با شما را دارد.", "تکمیل پروفایل", "میزان تکمیل پروفایل"],
 ps: ["د پروفایل بشپړتیا", "ستاسو پروفایل د موندلو لپاره چمتو دی", "خپل پروفایل بشپړ کړئ", "ستاسو پروفایل هغه بنسټیز معلومات لري چې نور غړي پرې تاسو پېژني.", "پروفایل بشپړ کړئ", "د پروفایل د بشپړتیا کچه"],
} as const;
import Link from "next/link";
import styles from "@/components/network/network-surfaces.module.css";
import { CommunitySignature } from "@/components/public/community-signature";
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
  const language = useSiteLanguage();
  const copy = strengthCopy[language];
  const strength = getProfileCompleteness(profile);
  const nextSteps = strength.missing.slice(0, compact ? 2 : 3);

  return (
    <div className={`${styles.surface} relative overflow-hidden rounded-[var(--radius)] border border-border/80 bg-card p-5`}>
      

      <CommunitySignature className={styles.signature} />
      <div className="relative flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {copy[0]}
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-[-0.02em] text-foreground">
            {strength.complete ? copy[1] : copy[2]}
          </h2>
        </div>
        <span className="shrink-0 text-2xl font-bold tracking-tight text-foreground">
          {strength.percent}%
        </span>
      </div>

      <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={copy[5]} aria-valuemin={0} aria-valuemax={100} aria-valuenow={strength.percent}>
        <div
          className="h-full rounded-full bg-primary transition-[width] motion-reduce:transition-none"
          style={{ width: `${strength.percent}%` }}
        />
      </div>

      {strength.complete ? (
        <div className="relative mt-5 flex items-start gap-3 rounded-[var(--radius)] bg-primary/[0.06] p-4 text-sm leading-6 text-foreground">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4.5 shrink-0 text-primary" />
          {copy[3]}
        </div>
      ) : (
        <div className="relative mt-5 space-y-3">
          {nextSteps.map((step) => (
            <div key={step.key} className="flex items-start gap-3">
              <Circle aria-hidden="true" className="mt-1 size-3.5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-foreground">{step.label}</p>
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
          className={`${styles.control} relative mt-5 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-primary transition hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}
>
          {copy[4]}
          <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
        </Link>
      ) : null}
    </div>
  );
}
