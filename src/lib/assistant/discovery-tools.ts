import "server-only";
import { getPublicListings } from "@/lib/public-content";
import { publicHref } from "@/lib/public-catalog";
import { discoveryPlanSchema } from "./public-discovery-contract";
import { discoveryTerms, rankDiscoveryListing } from "./public-discovery";
import type { DiscoveryTool } from "./discovery-orchestrator";

export const searchPublicCatalog: DiscoveryTool = async (input, signal) => {
  const plan = discoveryPlanSchema.parse(input);
  signal.throwIfAborted();
  // Anonymous publishable-key reads enforce RLS and publication/current filters.
  // This allowlist never reads profiles, contact details or member-only tables.
  const feeds = await Promise.all(plan.kinds.map(async kind => ({ kind, feed: await getPublicListings(kind, { limit: 24, discoveryTerms: discoveryTerms(plan.topic), discoveryLocation: plan.location, signal }) })));
  signal.throwIfAborted();
  const unavailable = feeds.filter(({ feed }) => feed.unavailable).map(({ kind }) => kind);
  if (unavailable.length === feeds.length) throw new Error("Public catalog unavailable");
  const ranked = feeds.flatMap(({ kind, feed }) => feed.items.map(item => ({
    title: item.title.slice(0, 200), summary: item.summary?.slice(0, 240) ?? null, location: item.location.slice(0, 160), kind,
    href: publicHref(kind, item.slug), rank: rankDiscoveryListing(item, plan.topic, plan.location, plan.thisMonth, kind),
  }))).filter(item => item.rank > 0).sort((a, b) => b.rank - a.rank);
  const results: typeof ranked = [];
  const byKind = plan.kinds.map(kind => ranked.filter(item => item.kind === kind));
  for (let i = 0; i < 8 && results.length < 8; i++) for (const rows of byKind) {
    if (rows[i] && results.length < 8) results.push(rows[i]);
  }
  return { results, unavailable };
};
