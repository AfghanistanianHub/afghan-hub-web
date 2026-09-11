"use client";

import { useFormStatus } from "react-dom";

type Props = { children: React.ReactNode; pendingLabel: string };

export function SubmitButton({ children, pendingLabel }: Props) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-disabled={pending}
      className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60">
      <span role="status" aria-live="polite">{pending ? pendingLabel : children}</span>
    </button>
  );
}
