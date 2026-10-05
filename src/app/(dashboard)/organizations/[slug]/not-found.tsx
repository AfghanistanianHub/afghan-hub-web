import Link from "next/link";
import { UsersRound } from "lucide-react";

export default function OrganizationNotFound() {
  return (
    <main className="px-4 py-16 md:px-8">
      <div className="surface-panel relative mx-auto max-w-2xl overflow-hidden rounded-[var(--radius)] px-6 py-14 text-center shadow-[0_18px_55px_rgb(15_23_42/0.045)] md:px-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-60 rounded-full bg-primary/[0.06] blur-3xl" /><div className="relative mx-auto flex size-14 items-center justify-center rounded-[var(--radius-control)] bg-primary/[0.08] text-primary">
          <UsersRound aria-hidden="true" className="size-6" />
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground">
          Organization not found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          This organization does not exist or is not publicly available.
        </p>
        <Link
          href="/organizations"
          className="relative mt-8 inline-flex rounded-[var(--radius-control)] bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          View organizations
        </Link>
      </div>
    </main>
  );
}
