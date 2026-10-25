"use client";

import { useFormStatus } from "react-dom";

type Props = { children: React.ReactNode; pendingLabel: string; variant?: "primary" | "google"; label?: string };

export function SubmitButton({ children, pendingLabel, variant = "primary", label }: Props) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" aria-label={pending ? pendingLabel : label ?? (typeof children === "string" ? children : undefined)} disabled={pending} aria-disabled={pending}
      className={`min-h-12 w-full rounded-[var(--radius-control)] px-4 py-3 font-semibold transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60 ${variant === "google" ? "border border-[#747775] bg-white text-[#1f1f1f]" : "border border-transparent bg-primary text-primary-foreground"}`}>
      <span role="status" aria-live="polite">{pending ? pendingLabel : children}</span>
    </button>
  );
}
