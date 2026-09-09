import Link from "next/link";
import { Building2 } from "lucide-react";

export default function BusinessNotFound() {
  return (
    <main className="px-4 py-16 md:px-8">
      <div className="surface-panel mx-auto max-w-2xl rounded-3xl px-6 py-14 text-center md:px-10">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
          <Building2 className="size-6" />
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground">
          Business not found
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          This business does not exist or is not publicly available.
        </p>
        <Link
          href="/businesses"
          className="mt-8 inline-flex rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
        >
          View businesses
        </Link>
      </div>
    </main>
  );
}
