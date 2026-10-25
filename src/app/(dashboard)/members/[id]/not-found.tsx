import Link from "next/link";
import { ArrowLeft, UserRoundX } from "lucide-react";

import { B } from "@/components/i18n/browse";
import { DocumentLanguage } from "@/components/i18n/localized";

export default function MemberNotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <DocumentLanguage />
      <div className="surface-panel relative w-full max-w-lg overflow-hidden rounded-[var(--radius)] p-8 text-center shadow-[0_18px_55px_rgb(15_23_42/0.045)] md:p-12">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-60 rounded-full bg-primary/[0.06] blur-3xl" /><div className="relative mx-auto flex size-16 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
          <UserRoundX aria-hidden="true" className="size-8" />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-foreground">
          <B k="notFound.memberTitle" />
        </h1>

        <p className="mt-3 leading-7 text-muted-foreground">
          <B k="notFound.memberBody" />
        </p>

        <Link
          href="/network"
          className="relative mt-7 inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
          <B k="notFound.returnToNetwork" />
        </Link>
      </div>
    </main>
  );
}
