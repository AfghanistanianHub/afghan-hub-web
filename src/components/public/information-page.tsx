import { SupportLinks } from "@/components/public/support-links";
import { siteContact } from "@/lib/site-contact";

export function InformationPage({ title, description, sections }: {
  title: string;
  description: string;
  sections: { title: string; text: string }[];
}) {
  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card px-6 py-8 shadow-[0_18px_55px_rgb(15_23_42/0.045)] sm:px-8 sm:py-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary/[0.07] blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-accent/45 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Afghan Hub</p>
          <h1 className="mt-4 break-words text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
          <p className="mt-5 break-words text-lg leading-8 text-muted-foreground">{description}</p>
        </div>
      </section>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-[0_10px_32px_rgb(15_23_42/0.035)] sm:p-8">
              <h2 className="break-words text-xl font-semibold tracking-tight">{section.title}</h2>
              <p className="mt-3 break-words leading-7 text-muted-foreground">{section.text}</p>
            </section>
          ))}
        </div>
        <aside className="rounded-[1.75rem] border border-border/80 bg-muted/35 p-6 shadow-[0_10px_32px_rgb(15_23_42/0.035)] lg:sticky lg:top-24">
          <h2 className="text-xl font-semibold">Contact</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div><dt className="text-muted-foreground">Responsible operator</dt><dd className="mt-1 break-words font-medium">{siteContact.operator}</dd></div>
            <div><dt className="text-muted-foreground">Support and privacy questions</dt><dd className="mt-1"><a href={siteContact.mailto} className="break-all rounded-sm font-medium text-primary underline underline-offset-4 transition hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{siteContact.email}</a></dd></div>
          </dl>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">Do not send passwords, sign-in links, session tokens or sensitive identity documents by email.</p>
          <div className="mt-6 border-t border-border pt-5"><SupportLinks /></div>
        </aside>
      </div>
    </main>
  );
}
