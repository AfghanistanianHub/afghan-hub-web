"use client";

import { useFormStatus } from "react-dom";

type PendingSubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
  disabled?: boolean;
  "aria-pressed"?: boolean;
};

export function PendingSubmitButton({
  children,
  pendingLabel,
  className = "",
  disabled = false,
  "aria-pressed": pressed,
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      aria-disabled={pending || disabled}
      aria-pressed={pressed}
      className={`${className} disabled:opacity-60 ${pending ? "cursor-wait" : disabled ? "cursor-not-allowed" : ""}`}
    >
      <span role="status" aria-live="polite">
        {pending ? pendingLabel : children}
      </span>
    </button>
  );
}
