import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicListing } from "@/lib/public-content";
import { isPublicKind, publicCategories, publicHref } from "@/lib/public-catalog";
import { ListingDate } from "@/components/public/listing-card";
import { getUtcDateKey, hasOpportunityDeadlinePassed } from "@/lib/opportunities";

type Props = { params: Promise<{ kind: string; slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kind, slug } = await params;
  if (!isPublicKind(kind)) notFound();
  const result = await getPublicListing(kind, slug);
  const item = result.items[0];
  if (result.unavailable) return { title: "Listing temporarily unavailable", robots: { index: false } };
  if (!item) notFound();
  const description = (item.summary || item.description || `${publicCategories[kind].singular} on Afghan Hub.`).slice(0, 160);
  const url = `https://app.apnbc.ca${publicHref(kind, slug)}`;
  const socialImage = "/opengraph-image";
  return {
    title: item.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: item.title,
      description,
      url,
      type: "website",
      images: [{ url: socialImage, width: 1200, height: 630, alt: `${item.title} — Afghan Hub` }],
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description,
      images: [socialImage],
    },
  };
}
export default async function PublicDetailPage({ params }: Props) {
  const { kind, slug } = await params;
  if (!isPublicKind(kind)) notFound();
  const result = await getPublicListing(kind, slug);
  const item = result.items[0];
  if (result.unavailable) return <main id="main-content" className="mx-auto max-w-3xl px-5 py-20"><h1 className="text-3xl font-semibold">We couldn’t load this listing.</h1><p className="mt-4 text-muted-foreground">Please try again shortly.</p><Link href={publicHref(kind, slug)} className="mt-6 inline-block text-primary underline">Try again</Link></main>;
  if (!item) notFound();
  const expired = kind === "opportunities" ? hasOpportunityDeadlinePassed(item.date, getUtcDateKey()) : kind === "events" && Boolean(item.date && new Date(item.endDate ?? item.date).getTime() < new Date().getTime());
  return <main id="main-content" className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
    <Link href={`/explore?type=${kind}`} className="text-sm font-medium text-primary hover:underline">← All {publicCategories[kind].label.toLowerCase()}</Link>
    <article className="mt-8"><p className="text-xs font-semibold uppercase tracking-widest text-primary">{item.category}</p><h1 className="mt-4 break-words text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{item.title}</h1><p className="mt-5 text-muted-foreground">{item.location}</p><p className="mt-2 text-sm text-muted-foreground"><ListingDate item={item} kind={kind} /></p>
      {expired && <p className="mt-5 rounded-xl bg-muted p-4 text-sm font-medium">{kind === "events" ? "This event has ended." : "The application deadline has passed."}</p>}
      {item.summary && <p className="mt-8 break-words text-xl leading-8 text-muted-foreground">{item.summary}</p>}
      <section className="mt-10 border-t border-border pt-8"><h2 className="text-xl font-semibold">About this {publicCategories[kind].singular.toLowerCase()}</h2><p className="mt-4 whitespace-pre-wrap break-words leading-8 text-muted-foreground">{item.description || "More information has not been added yet."}</p></section>
    </article>
    <aside className="mt-12 rounded-2xl border border-border bg-accent/30 p-6 sm:p-8"><h2 className="text-xl font-semibold">Take the next step with your community.</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Join Afghan Hub to connect with members and contribute. Already a member? Open this listing in your member workspace.</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/login?mode=join" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Join Afghan Hub</Link><Link href={`/${kind}/${encodeURIComponent(slug)}`} className="rounded-xl border border-border px-5 py-3 text-sm font-semibold hover:bg-muted">Open member view</Link></div></aside>
  </main>;
}
