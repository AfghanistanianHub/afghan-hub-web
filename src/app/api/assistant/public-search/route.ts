import { NextResponse } from "next/server";
import { isSameOriginRequest } from "@/lib/http/request-origin";
import { discoveryRequestSchema } from "@/lib/assistant/public-discovery-contract";
import { discover } from "@/lib/assistant/discovery-orchestrator";
import { discoveryPlanner } from "@/lib/assistant/discovery-provider";
import { searchPublicCatalog } from "@/lib/assistant/discovery-tools";

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
      if (bytes > 4096) { await reader.cancel(); return response({ error: "Request is too large." }, 413); }
      raw += decoder.decode(chunk.value, { stream: true });
    }
    raw += decoder.decode();
  } catch { return response({ error: "Invalid request." }, 400); }
  let payload: unknown;
  try { payload = JSON.parse(raw); } catch { return response({ error: "Invalid JSON body." }, 400); }
  const parsed = discoveryRequestSchema.safeParse(payload);
  if (!parsed.success) return response({ error: "Enter a search of 2–120 characters." }, 400);
  inFlight++;
  const started = Date.now();
  try {
    const data = await discover(parsed.data, searchPublicCatalog, request.signal, discoveryPlanner());
    console.info("public_navigator_search", { durationMs: Date.now() - started, resultCount: data.results.length, unavailableCount: data.unavailable.length, engine: data.engine, fallback: data.fallback });
    return response(data);
  } catch {
    console.error("public_navigator_search_unavailable", { durationMs: Date.now() - started });
    return response({ error: "Discovery is temporarily unavailable." }, 503);
  } finally { inFlight--; }
}
