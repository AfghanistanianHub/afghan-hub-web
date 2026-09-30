import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  MapPin,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { CommunityEcosystem } from "@/components/public/community-ecosystem";
import { ListingCard } from "@/components/public/listing-card";
import { publicCategories, publicKinds, publicHref, type PublicKind } from "@/lib/public-catalog";
import { getPublicListings } from "@/lib/public-content";

const description =
  "Find opportunities, events, Afghan businesses, and community organizations. Explore Afghan Hub and connect with your community.";

export const metadata: Metadata = {
  title: "A community to belong to. A place to grow.",
  description,
  alternates: { canonical: "https://app.apnbc.ca/" },
  openGraph: {
    title: "Afghan Hub — People, possibilities, belonging",
    description,
    url: "https://app.apnbc.ca/",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Afghan Hub — community, opportunities, organizations, businesses, and events",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Afghan Hub — People, possibilities, belonging",
    description,
    images: ["/opengraph-image"],
  },
};

const icons = {
  opportunities: BriefcaseBusiness,
  events: CalendarDays,
  businesses: Building2,
  organizations: UsersRound,
};

const categoryKicker: Record<PublicKind, string> = {
  opportunities: "Move forward",
  events: "Come together",
  businesses: "Shop local",
  organizations: "Find your people",
};

export default async function PublicHome() {
  const feeds = await Promise.all(
    publicKinds.map(kind => getPublicListings(kind, { limit: 3 })),
  );

  const pulseItems = publicKinds.flatMap((kind, index) =>
    feeds[index].items.slice(0, 1).map(item => ({ kind, item })),
  );

  return (
    <main id="main-content">
      <section className="relative overflow-hidden border-b border-border/70">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_12%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_28%),radial-gradient(circle_at_12%_88%,color-mix(in_oklab,var(--accent)_65%,transparent),transparent_32%)]"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] [background-size:42px_42px]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:gap-14 sm:px-8 sm:py-16 lg:grid-cols-[0.93fr_1.07fr] lg:items-center lg:gap-10 lg:py-20">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles aria-hidden="true" className="size-3.5" />
              People. Possibilities. Belonging.
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-[4rem]">
              Rooted in community.
              <span className="mt-1 block text-primary">Growing together.</span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-muted-foreground">
              One place to discover people, opportunities, gatherings, and Afghan-led work around you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/explore"
                className="inline-flex items-center gap-3 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Explore the community
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/login?mode=join"
                className="rounded-xl border border-border bg-background/72 px-6 py-3.5 font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Join Afghan Hub
              </Link>
            </div>
            <div className="mt-7 grid gap-1.5 text-xs font-medium text-muted-foreground sm:flex sm:flex-wrap sm:gap-x-5 sm:gap-y-2">
              <span>No account needed to explore</span>
              <span aria-hidden="true" className="hidden sm:inline">•</span>
              <span>Built for Afghan community connections</span>
            </div>
          </div>

          <CommunityEcosystem />
        </div>
      </section>

      <section className="relative border-b border-border bg-card/65" aria-label="Browse community categories">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden border-x border-border bg-border sm:grid-cols-4">
          {publicKinds.map(kind => {
            const Icon = icons[kind];
            return (
              <Link
                key={kind}
                href={`/explore?type=${kind}`}
                className="group flex min-h-36 flex-col justify-between bg-background px-5 py-5 transition-colors hover:bg-secondary/55 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary sm:min-h-40 sm:px-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-primary transition-transform group-hover:scale-105">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary">{categoryKicker[kind]}</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">{publicCategories[kind].label}</h2>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-b border-border/70 bg-background" aria-labelledby="community-pathways-heading">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">One hub, many paths</p>
              <h2 id="community-pathways-heading" className="mt-2 max-w-2xl text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
                Built for every part of the community.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-right">
              Find your next opportunity, grow a business, represent an organization, or simply stay connected to what is happening around you.
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                kicker: "People",
                title: "Professionals & members",
                copy: "Discover opportunities, people, and ways to grow your network.",
                href: "/explore?type=opportunities",
                icon: BriefcaseBusiness,
              },
              {
                kicker: "Business",
                title: "Entrepreneurs & businesses",
                copy: "Be discovered, find local businesses, and take part in the wider ecosystem.",
                href: "/explore?type=businesses",
                icon: Building2,
              },
              {
                kicker: "Organizations",
                title: "Groups & community leaders",
                copy: "Showcase your work, programs, events, and ways people can participate.",
                href: "/explore?type=organizations",
                icon: UsersRound,
              },
              {
                kicker: "Community",
                title: "Everyone who wants to connect",
                copy: "See gatherings, community activity, and what is happening around you.",
                href: "/explore?type=events",
                icon: CalendarDays,
              },
            ].map((pathway, index) => {
              const Icon = pathway.icon;
              return (
                <Link
                  key={pathway.title}
                  href={pathway.href}
                  className="group relative min-h-56 overflow-hidden rounded-[1.75rem] border border-border/80 bg-card p-5 transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_18px_42px_rgb(15_23_42/0.06)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  <div aria-hidden="true" className="absolute -right-12 -top-12 size-36 rounded-full border border-primary/10 transition-transform duration-300 group-hover:scale-110" />
                  <div aria-hidden="true" className="absolute right-8 top-8 size-14 rounded-full border border-dashed border-primary/10" />
                  <div className="relative flex h-full flex-col justify-between gap-8">
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary shadow-sm">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <span aria-hidden="true" className="text-3xl font-black tracking-[-0.06em] text-foreground/[0.07]">
                        0{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-primary">{pathway.kicker}</p>
                      <div className="mt-1.5 flex items-end justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold tracking-tight text-foreground">{pathway.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{pathway.copy}</p>
                        </div>
                        <ArrowUpRight aria-hidden="true" className="mb-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {pulseItems.length > 1 ? (
        <section className="overflow-hidden border-b border-border/70 bg-muted/35">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Community pulse</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">What is moving right now</h2>
              </div>
              <Link href="/explore" className="inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                See everything <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            <div className="grid auto-rows-[150px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {pulseItems.map(({ kind, item }, index) => {
                const Icon = icons[kind];
                const featured = index === 0;
                return (
                  <Link
                    key={`${kind}-${item.slug}`}
                    href={publicHref(kind, item.slug)}
                    className={`group relative overflow-hidden rounded-3xl border border-border/80 p-5 transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${featured ? "bg-primary text-primary-foreground sm:row-span-2 lg:col-span-2" : "bg-card"}`}
                  >
                    <div aria-hidden="true" className={`absolute -right-10 -top-10 size-32 rounded-full border ${featured ? "border-primary-foreground/15" : "border-primary/10"}`} />
                    <div aria-hidden="true" className={`absolute -right-2 top-6 size-16 rounded-full border ${featured ? "border-primary-foreground/10" : "border-primary/8"}`} />
                    <div className="relative flex h-full flex-col justify-between">
                      <div className="flex items-start justify-between gap-4">
                        <span className={`flex size-9 items-center justify-center rounded-xl ${featured ? "bg-primary-foreground/12" : "bg-secondary text-primary"}`}>
                          <Icon aria-hidden="true" className="size-4.5" />
                        </span>
                        <ArrowUpRight aria-hidden="true" className={`size-4 ${featured ? "opacity-70" : "text-muted-foreground group-hover:text-primary"}`} />
                      </div>
                      <div>
                        <p className={`text-[0.64rem] font-semibold uppercase tracking-[0.18em] ${featured ? "opacity-70" : "text-primary"}`}>
                          {publicCategories[kind].label}
                        </p>
                        <h3 className={`${featured ? "mt-2 max-w-md text-2xl sm:text-3xl" : "mt-1 line-clamp-2 text-base"} font-semibold leading-tight tracking-tight`}>
                          {item.title}
                        </h3>
                        {featured ? (
                          <p className="mt-3 flex items-start gap-1.5 text-xs leading-5 opacity-75">
                            <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                            <span className="min-w-0 break-words">{item.location}</span>
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <div className="mx-auto max-w-7xl space-y-12 px-5 py-16 sm:space-y-14 sm:px-8 sm:py-20">
        {publicKinds.map((kind, index) => (
          <section key={kind} aria-labelledby={`${kind}-heading`} className="relative">
            <div className={`grid gap-7 lg:items-start lg:grid-cols-[0.28fr_0.72fr] lg:gap-10 ${index % 2 ? "lg:grid-cols-[0.72fr_0.28fr]" : ""}`}>
              <div className={index % 2 ? "lg:order-2" : ""}>
                <div className="sticky top-24 rounded-3xl border border-border/80 bg-muted/45 p-6 sm:p-7">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                    {(() => {
                      const Icon = icons[kind];
                      return <Icon aria-hidden="true" className="size-5.5" />;
                    })()}
                  </span>
                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{categoryKicker[kind]}</p>
                  <h2 id={`${kind}-heading`} className="mt-2 text-2xl font-semibold tracking-tight">
                    {publicCategories[kind].label}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{publicCategories[kind].description}</p>
                  <Link
                    href={`/explore?type=${kind}`}
                    className="mt-6 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    Explore all <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </div>

              <div className={index % 2 ? "lg:order-1" : ""}>
                {feeds[index].unavailable ? (
                  <div role="status" aria-live="polite" className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 text-sm text-muted-foreground shadow-[0_10px_30px_rgb(15_23_42/0.03)]"><div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/[0.05] blur-3xl"/><p className="relative font-medium text-foreground">Listings are temporarily unavailable.</p><p className="relative mt-2 leading-6">Please try again shortly.</p></div>
                ) : feeds[index].items.length ? (
                  <div
                    className={`grid gap-5 ${
                      feeds[index].items.length === 1
                        ? "grid-cols-1"
                        : feeds[index].items.length === 2
                          ? "md:grid-cols-2"
                          : "md:grid-cols-2 xl:grid-cols-3"
                    }`}
                  >
                    {feeds[index].items.map(item => (
                      <div
                        key={item.slug}
                        className={
                          feeds[index].items.length === 1
                            ? `w-full max-w-md ${index % 2 ? "lg:ml-auto" : "lg:mr-auto"}`
                            : ""
                        }
                      >
                        <ListingCard item={item} kind={kind} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-3xl border border-dashed border-border bg-card p-8 sm:p-10">
                    <div aria-hidden="true" className="absolute -right-12 -top-12 size-40 rounded-full border border-primary/10" />
                    <div aria-hidden="true" className="absolute right-8 top-8 size-16 rounded-full border border-primary/10" />
                    <p className="relative text-lg font-semibold">
                      {kind === "events"
                        ? "New gatherings are on the horizon."
                        : kind === "opportunities"
                          ? "The next opportunity starts with someone sharing it."
                          : "Help this part of our community grow."}
                    </p>
                    <p className="relative mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                      {kind === "events" ? "No upcoming events are listed right now." : "No current listings yet. Check back soon or join to contribute."}
                    </p>
                    <Link href="/login?mode=join" className="relative mt-5 inline-flex items-center gap-2 rounded-sm text-sm font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                      Join and contribute <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="relative overflow-hidden border-t border-primary/10 bg-primary text-primary-foreground">
        <div aria-hidden="true" className="absolute -right-20 -top-32 size-80 rounded-full border border-primary-foreground/10" />
        <div aria-hidden="true" className="absolute -right-4 -top-8 size-48 rounded-full border border-primary-foreground/10" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-14 sm:px-8 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">Your community, your corner</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">You have a place here.</h2>
            <p className="mt-3 max-w-xl leading-7 opacity-85">
              Build your profile, connect with members, and add what is happening around you.
            </p>
          </div>
          <Link
            href="/login?mode=join"
            className="shrink-0 rounded-xl bg-background px-6 py-3.5 font-semibold text-primary transition hover:-translate-y-0.5 hover:bg-background/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Join Afghan Hub
          </Link>
        </div>
      </section>
    </main>
  );
}
