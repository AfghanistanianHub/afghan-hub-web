"use client";

import { useFormStatus } from "react-dom";

type PendingSubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  value?: string;
  "aria-pressed"?: boolean;
  formNoValidate?: boolean;
};

export function PendingSubmitButton({
  children,
  pendingLabel,
  className = "",
  disabled = false,
  name,
  value,
  "aria-pressed": pressed,
  formNoValidate = false,
}: PendingSubmitButtonProps) {
  const { pending, data } = useFormStatus();
  const isSubmitting = pending && (!name || value === undefined || data?.get(name) === value);

  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending || disabled}
      aria-disabled={pending || disabled}
      aria-pressed={pressed}
      formNoValidate={formNoValidate}
      className={`${className} disabled:opacity-60 ${pending ? "cursor-wait" : disabled ? "cursor-not-allowed" : ""}`}
    >
      <span role="status" aria-live="polite">
        {isSubmitting ? pendingLabel : children}
      </span>
    </button>
  );
}
