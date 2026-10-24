import { CatalogIllustration } from "@/components/public/catalog-illustration";
import styles from "@/components/public/catalog.module.css";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Clock3,
  MapPin,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { getPublicListing } from "@/lib/public-content";
import { isPublicKind, publicCategories, publicHref } from "@/lib/public-catalog";
import { ListingDate } from "@/components/public/listing-card";
import { Localized } from "@/components/i18n/localized";
import { CatalogCategoryLine } from "@/components/public/catalog-category-line";
import { formatCopy, uiCopy } from "@/lib/i18n/ui-copy";
import { getUtcDateKey, hasOpportunityDeadlinePassed } from "@/lib/opportunities";

type Props = { params: Promise<{ kind: string; slug: string }> };

const icons = {
  opportunities: BriefcaseBusiness,
  events: CalendarDays,
  businesses: Building2,
  organizations: UsersRound,
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kind, slug } = await params;
  if (!isPublicKind(kind)) notFound();
  const result = await getPublicListing(kind, slug);
  const item = result.items[0];
  if (result.unavailable) return { title: uiCopy.en.detail.unavailableMetadata, robots: { index: false } };
  if (!item) notFound();
  const description = (item.summary || item.description || formatCopy(uiCopy.en.detail.metadataDescription, { category: publicCategories[kind].singular })).slice(0, 160);
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

  if (result.unavailable) {
    return (
      <main id="main-content" className="mx-auto max-w-3xl px-5 py-20 sm:px-8">
        <div className="relative overflow-hidden rounded-md border border-border/80 bg-card p-8 sm:p-10"><div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-60 rounded-full bg-primary/[0.07] blur-3xl"/><div aria-hidden="true" className="pointer-events-none absolute -bottom-20 left-1/3 size-52 rounded-full bg-accent/45 blur-3xl"/><p className="relative text-xs font-semibold uppercase tracking-[0.18em] text-primary">Afghan Hub</p>
          <h1 className="relative mt-3 text-3xl font-semibold tracking-tight"><Localized k="detail.unavailableTitle" /></h1>
          <p className="relative mt-4 leading-7 text-muted-foreground"><Localized k="detail.unavailableBody" /></p>
          <Link href={publicHref(kind, slug)} className="relative mt-6 inline-flex items-center gap-2 rounded-md border border-primary/15 bg-primary/[0.06] px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            <Localized k="detail.tryAgain" /> <ArrowRight aria-hidden="true" data-flip-rtl className="size-4" />
          </Link>
        </div>
      </main>
    );
  }

  if (!item) notFound();

  const expired = kind === "opportunities"
    ? hasOpportunityDeadlinePassed(item.date, getUtcDateKey())
    : kind === "events" && Boolean(item.date && new Date(item.endDate ?? item.date).getTime() < new Date().getTime());
  const Icon = icons[kind];

  return (
    <main id="main-content" data-illustration-focus-scope data-catalog className={styles.catalog}>
      <section data-illustration-trigger className="relative overflow-hidden border-b border-border/70">
        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
          <Link href={`/explore?type=${kind}`} className="inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            <ArrowLeft aria-hidden="true" data-flip-rtl className="size-4" />
            <CatalogCategoryLine kind={kind} k="detail.all" />
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <span className="rounded-full border border-border/80 bg-background/75 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  {item.category}
                </span>
                {expired && (
                  <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                    {kind === "events" ? <Localized k="detail.eventEnded" /> : <Localized k="detail.deadlinePassed" />}
                  </span>
                )}
              </div>

              <h1 className="mt-6 max-w-4xl break-words text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
                {item.title}
              </h1>

              {item.summary && (
                <p className="mt-6 max-w-3xl break-words text-lg leading-8 text-muted-foreground sm:text-xl">
                  {item.summary}
                </p>
              )}
            </div>

            <div>
              <div className={styles.detailArt}><CatalogIllustration interactive kind={kind} /></div>
              <div className="border-t border-border pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary"><Localized k="detail.atAGlance" /></p>
              <div className="mt-4 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground"><Localized k="detail.location" /></p>
                    <p className="mt-1 break-words leading-6 text-muted-foreground">{item.location}</p>
                  </div>
                </div>
                {item.date && (
                  <div className="flex items-start gap-3">
                    <Clock3 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{kind === "opportunities" ? <Localized k="detail.deadline" /> : <Localized k="detail.date" />}</p>
                      <p className="mt-1 leading-6 text-muted-foreground"><ListingDate item={item} kind={kind} /></p>
                    </div>
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <article className="min-w-0">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles aria-hidden="true" className="size-3.5" />
            <CatalogCategoryLine kind={kind} k="detail.about" />
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight"><Localized k="detail.details" /></h2>
          <div className="mt-6 rounded-md border border-border bg-card p-6 sm:p-8">
            <p className="whitespace-pre-wrap break-words leading-8 text-muted-foreground">
              {item.description || <Localized k="detail.noDescription" />}
            </p>
          </div>

          {expired && (
            <div className="mt-6 rounded-md border border-border bg-muted/45 p-5 text-sm font-medium text-muted-foreground">
              {kind === "events" ? <Localized k="detail.eventEndedBody" /> : <Localized k="detail.deadlinePassedBody" />}
            </div>
          )}
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-md border border-border bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary"><Localized k="detail.continueEyebrow" /></p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight"><Localized k="detail.continueTitle" /></h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              <Localized k="detail.continueBody" />
            </p>
            <div className="mt-5 grid gap-3">
              <Link href="/login?mode=join" className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                <Localized k="detail.join" /> <ArrowRight aria-hidden="true" data-flip-rtl className="size-4" />
              </Link>
              <Link href={`/${kind}/${encodeURIComponent(slug)}`} className="inline-flex items-center justify-center rounded-md border border-border px-5 py-3 text-sm font-semibold transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                <Localized k="detail.openMemberView" />
              </Link>
            </div>
          </div>

          <div className="rounded-md border border-border bg-muted/35 p-5">
            <p className="text-sm font-semibold"><Localized k="detail.keepExploring" /></p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              <CatalogCategoryLine kind={kind} k="detail.keepExploringBody" />
            </p>
            <Link href={`/explore?type=${kind}`} className="mt-4 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
              <Localized k="detail.browseAll" /> <ArrowRight aria-hidden="true" data-flip-rtl className="size-4" />
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
