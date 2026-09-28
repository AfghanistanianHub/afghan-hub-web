import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, HandHeart, Network, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Our mission",
  description: "Afghan Hub brings people, opportunities, businesses, and organizations together in one shared community space.",
  alternates: { canonical: "https://app.apnbc.ca/about" },
};

const pillars = [
  {
    icon: Compass,
    title: "Make discovery easier.",
    description: "Useful information is often scattered. Afghan Hub brings community listings into one place so people can see what is happening and find a next step that matters.",
  },
  {
    icon: Network,
    title: "Turn introductions into connection.",
    description: "Members can build a profile, discover one another, connect, and start conversations. The goal is to make community easier to enter, not harder to navigate.",
  },
  {
    icon: HandHeart,
    title: "Grow through contribution.",
    description: "Share an opportunity, add a business or organization, or bring people together through an event. A stronger network grows when participation is simple and visible.",
  },
];

export default function AboutPage() {
  return (
    <main id="main-content">
      <section className="relative overflow-hidden border-b border-border/70">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_18%,color-mix(in_oklab,var(--primary)_11%,transparent),transparent_30%),radial-gradient(circle_at_12%_80%,color-mix(in_oklab,var(--accent)_55%,transparent),transparent_34%)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary shadow-sm backdrop-blur">
              <Sparkles aria-hidden="true" className="size-3.5" />
              Our mission
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.06] tracking-tight sm:text-6xl">More connected.<br /><span className="text-primary">More possible.</span></h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">Afghan Hub is a shared place for Afghan people to discover opportunities, support businesses, find organizations, meet one another, and contribute something of their own.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-5 lg:grid-cols-3">
          {pillars.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-7">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary"><Icon aria-hidden="true" className="size-5" /></span>
              <h2 className="mt-6 text-2xl font-semibold tracking-tight">{title}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-border bg-muted/35 p-7 sm:p-9">
          <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Built around participation</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">A useful community space should make it easier to show up.</h2>
              <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Explore first. Join when you are ready. Contribute when you have something to share.</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link href="/explore" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Explore Afghan Hub <ArrowRight aria-hidden="true" className="size-4" /></Link>
              <Link href="/login?mode=join" className="rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Join the community</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
