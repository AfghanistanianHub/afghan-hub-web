import Link from "next/link";

/** The same home link throughout account access and password recovery. */
export function AuthBrand() {
  return (
    <header className="auth-brand">
      <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-semibold uppercase tracking-[0.22em] text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
        <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-[var(--radius-control)] bg-secondary text-primary">A</span>
        Afghan Hub
      </Link>
    </header>
  );
}
