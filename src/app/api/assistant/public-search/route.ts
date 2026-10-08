import { NextResponse } from "next/server";
import { z } from "zod";
import { getPublicListings } from "@/lib/public-content";
import { publicHref } from "@/lib/public-catalog";
import { discoveryTerms, planPublicDiscovery, rankDiscoveryListing } from "@/lib/assistant/public-discovery";
import { isSameOriginRequest } from "@/lib/http/request-origin";
import { publicDiscoveryResponseSchema } from "@/lib/assistant/public-discovery-contract";

const schema = z.object({
  query: z.string().trim().min(2).max(120),
  filters: z.object({ goal: z.string().trim().max(80).optional(), topic: z.string().trim().max(80).optional(), location: z.string().trim().max(60).optional() }).strict().optional(),
}).strict();

// Per-instance backpressure supplements bounded, timeout-protected public reads.
// A shared edge/WAF limit is still required before high-volume production use.
let inFlight = 0;
let windowStart = 0;
let requests = 0;
const response = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return response({ error: "Request origin is not allowed." }, 403);
  const now = Date.now();
  if (now - windowStart >= 60_000) { windowStart = now; requests = 0; }
  if (inFlight >= 6 || requests >= 60) return NextResponse.json({ error: "Please try again shortly." }, { status: 429, headers: { "Retry-After": "60", "Cache-Control": "no-store" } });
  requests++;
  // Bound body size even when Content-Length is absent or untrusted.
  const reader = request.body?.getReader();
  if (!reader) return response({ error: "Invalid request." }, 400);
  let bytes = 0;
  let raw = "";
  const decoder = new TextDecoder();
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 2048) { await reader.cancel(); return response({ error: "Request is too large." }, 413); }
      raw += decoder.decode(chunk.value, { stream: true });
    }
    raw += decoder.decode();
  } catch { return response({ error: "Invalid request." }, 400); }
  let payload: unknown;
  try { payload = JSON.parse(raw); } catch { return response({ error: "Invalid JSON body." }, 400); }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return response({ error: "Enter a search of 2–120 characters." }, 400);
  inFlight++;
  const started = Date.now();
  try {
    const plan = planPublicDiscovery(parsed.data.query, parsed.data.filters);
    // The existing anonymous publishable-key reader applies published/current
    // filters and anon RLS. It never uses session cookies or reads profiles.
    const feeds = await Promise.all(plan.kinds.map(async kind => ({ kind, feed: await getPublicListings(kind, { limit: 24, discoveryTerms: discoveryTerms(plan.topic), discoveryLocation: plan.location }) })));
    const unavailable = feeds.filter(({ feed }) => feed.unavailable).map(({ kind }) => kind);
    if (unavailable.length === feeds.length) return response({ error: "Discovery is temporarily unavailable." }, 503);
    const results = feeds.flatMap(({ kind, feed }) => feed.items.map(item => ({
      title: item.title, summary: item.summary?.slice(0, 240) ?? null, location: item.location, kind,
      href: publicHref(kind, item.slug), rank: rankDiscoveryListing(item, plan.topic, plan.location, plan.thisMonth, kind),
    }))).filter(item => item.rank > 0).sort((a, b) => b.rank - a.rank);
    // Round-robin preserves breadth when a request spans community areas.
    const balanced: typeof results = [];
    for (let i = 0; i < 6; i++) for (const kind of plan.kinds) {
      const item = results.filter(result => result.kind === kind)[i];
      if (item && balanced.length < 8) balanced.push(item);
    }
    console.info("public_navigator_search", { durationMs: Date.now() - started, resultCount: balanced.length, unavailableCount: unavailable.length });
    return response(publicDiscoveryResponseSchema.parse({ plan, results: balanced, unavailable, limited: true, mode: "public-catalog" }));
  } catch {
    console.error("public_navigator_search_unavailable", { durationMs: Date.now() - started });
    return response({ error: "Discovery is temporarily unavailable." }, 503);
  } finally { inFlight--; }
}
