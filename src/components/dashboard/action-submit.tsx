"use client";

import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";

export function SignOutSubmit({
  className,
  label = "Sign out",
  pendingLabel = "Signing out…",
  signingOutAriaLabel = "Signing out",
}: {
  className: string;
  label?: string;
  pendingLabel?: string;
  signingOutAriaLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={pending ? signingOutAriaLabel : label}
      className={`${className} disabled:cursor-wait disabled:opacity-60`}
    >
      <LogOut aria-hidden="true" className="size-4 sm:hidden" />
      <span role="status" aria-live="polite" className="hidden sm:inline">
        {pending ? pendingLabel : label}
      </span>
      <span role="status" aria-live="polite" className="sr-only sm:hidden">
        {pending ? pendingLabel : ""}
      </span>
    </button>
  );
}

export function NotificationSubmit({
  children,
  className,
  preserveContent = false,
  pendingOpeningLabel = "Opening…",
  pendingMarkingLabel = "Marking…",
}: {
  children: React.ReactNode;
  className: string;
  preserveContent?: boolean;
  pendingOpeningLabel?: string;
  pendingMarkingLabel?: string;
}) {
  const { pending } = useFormStatus();
  const message = preserveContent ? pendingOpeningLabel : pendingMarkingLabel;

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${className} disabled:cursor-wait disabled:opacity-60`}
    >
      {preserveContent ? (
        <>
          {children}
          <span
            role="status"
            aria-live="polite"
            className="absolute bottom-0 right-5 text-xs leading-4 text-primary"
          >
            {pending ? message : ""}
          </span>
        </>
      ) : (
        <span role="status" aria-live="polite">
          {pending ? message : children}
        </span>
      )}
    </button>
  );
}
