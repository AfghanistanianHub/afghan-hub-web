import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Editorial workspace heading: no decorative banner/card and one semantic h1.
 * Functional page actions stay visible and can wrap beneath the introduction.
 */
export function MemberPageHeader({ title, description, icon: Icon, children }: {
  title: string;
  description: string;
  icon: LucideIcon;
  children?: ReactNode;
}) {
  return (
    <header data-member-page-header className="relative mb-7 border-b border-border/70 pb-7 pt-3 sm:mb-9 sm:pb-9 sm:pt-5">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <div className="min-w-0 flex-1 basis-[19rem]">
          <p className="mb-4 inline-flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary">
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            Afghan Hub <span aria-hidden="true" className="text-muted-foreground/60">/</span> Community
          </p>
          <h1 className="max-w-[21ch] text-balance text-[clamp(2rem,3.4vw,3.4rem)] font-medium leading-[1.08] tracking-[-0.045em] text-foreground">
            {title}
          </h1>
          <p className="mt-4 max-w-[60ch] text-pretty text-base leading-7 text-muted-foreground">{description}</p>
        </div>
        {children ? <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2 pb-1">{children}</div> : null}
      </div>
    </header>
  );
}

export function DirectoryEmptyState({ title, description, href, action }: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <section className="mt-8 flex min-h-52 flex-col items-start justify-center border-y border-border/70 py-9 sm:py-12">
      <span aria-hidden="true" className="mb-4 h-px w-12 bg-primary/60" />
      <h2 className="text-xl font-medium tracking-[-0.025em] text-foreground">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">{description}</p>
      <Link href={href} className="mt-5 inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-border bg-card px-4 text-sm font-semibold text-primary transition-colors hover:border-primary/50 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{action} <span aria-hidden="true" className="ms-2">↗</span></Link>
    </section>
  );
}
