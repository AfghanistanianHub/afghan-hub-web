import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function MemberPageHeader({ title, description, icon: Icon, children }: {
  title: string;
  description: string;
  icon: LucideIcon;
  children?: ReactNode;
}) {
  return (
    <header data-member-page-header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
      <div className="flex min-w-0 basis-full items-start gap-3 md:flex-1 md:basis-auto">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <h1 className="workspace-heading">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
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
    <section className="mt-6 border-y border-border bg-card px-5 py-6">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      <Link href={href} className="mt-3 inline-flex min-h-11 items-center rounded-sm font-semibold text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{action}</Link>
    </section>
  );
}
