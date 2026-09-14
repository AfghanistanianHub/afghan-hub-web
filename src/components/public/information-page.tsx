import { SupportLinks } from "@/components/public/support-links";
import { siteContact } from "@/lib/site-contact";

export function InformationPage({ title, description, sections }: {
  title: string;
  description: string;
  sections: { title: string; text: string }[];
}) {
  return (
    <main id="main-content" className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Afghan Hub</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">{description}</p>
      </div>
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          {sections.map((section) => (
            <section key={section.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{section.text}</p>
            </section>
          ))}
        </div>
        <aside className="rounded-3xl border border-border bg-muted/35 p-6">
          <h2 className="text-xl font-semibold">Contact</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div><dt className="text-muted-foreground">Responsible operator</dt><dd className="mt-1 font-medium">{siteContact.operator}</dd></div>
            <div><dt className="text-muted-foreground">Support and privacy questions</dt><dd className="mt-1"><a href={siteContact.mailto} className="break-all font-medium text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4">{siteContact.email}</a></dd></div>
          </dl>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">Do not send passwords, sign-in links, session tokens or sensitive identity documents by email.</p>
          <div className="mt-6 border-t border-border pt-5"><SupportLinks /></div>
        </aside>
      </div>
    </main>
  );
}
