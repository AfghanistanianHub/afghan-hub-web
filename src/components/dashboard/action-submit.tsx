"use client";

import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";

export function SignOutSubmit({ className }: { className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-label={pending ? "Signing out" : "Sign out"}
      className={`${className} disabled:cursor-wait disabled:opacity-60`}>
      <LogOut aria-hidden="true" className="size-4 sm:hidden" />
      <span role="status" aria-live="polite" className="hidden sm:inline">{pending ? "Signing out…" : "Sign out"}</span>
      <span role="status" aria-live="polite" className="sr-only sm:hidden">{pending ? "Signing out…" : ""}</span>
    </button>
  );
}

export function NotificationSubmit({ children, className, preserveContent = false }: {
  children: React.ReactNode;
  className: string;
  preserveContent?: boolean;
}) {
  const { pending } = useFormStatus();
  const message = preserveContent ? "Opening…" : "Marking…";
  return (
    <button type="submit" disabled={pending} aria-busy={pending}
      className={`${className} disabled:cursor-wait disabled:opacity-60`}>
      {preserveContent ? <>
        {children}
        <span role="status" aria-live="polite" className="absolute bottom-0 right-5 text-xs leading-4 text-primary">{pending ? message : ""}</span>
      </> : <span role="status" aria-live="polite">{pending ? message : children}</span>}
    </button>
  );
}
