import { NextResponse } from "next/server";
import { z } from "zod";

import { navigatorSearchQuery, resolveNavigatorContext } from "@/lib/assistant/conversation";
import { MentorshipSearchScopeError, searchAssistantCatalog } from "@/lib/assistant/search";
import { isSameOriginRequest } from "@/lib/http/request-origin";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  query: z.string().trim().min(2).max(120),
  entityType: z
    .enum(["profile", "business", "organization", "opportunity", "event"])
    .optional(),
  limit: z.number().int().min(1).max(12).optional(),
  context: z.object({
    topic: z.string().trim().max(120),
    city: z.string().trim().min(1).max(60).optional(),
    entityType: z.enum(["profile", "business", "organization", "opportunity", "event"]).optional(),
    memberSignal: z.enum(["open_to_mentoring", "looking_for_mentor"]).optional(),
  }).strict().optional(),
});

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a search query of at least two characters." },
      { status: 400 },
    );
  }

  try {
    const context = resolveNavigatorContext(parsed.data.query, parsed.data.context);
    const entityType = parsed.data.entityType ?? context.entityType;
    const memberSignal = entityType === "profile" ? context.memberSignal : undefined;
    const resolved = { ...context, entityType, memberSignal };
    const query = navigatorSearchQuery(resolved);
    const intent = entityType ? ({profile:"find_people",business:"find_businesses",organization:"find_organizations",opportunity:"find_opportunities",event:"find_events"} as const)[entityType] : "general";
    if (!query && entityType) {
      return NextResponse.json({ query: parsed.data.query, intent, entityType, memberSignal: null, context: resolved, groups: [], results: [], browseOnly: true, mode: "read-only" });
    }
    const limit = parsed.data.limit ?? 8;
    const showPeers = !!memberSignal && !!context.topic && limit >= 3;
    const primaryLimit = showPeers ? Math.ceil(limit * 2 / 3) : limit;
    const [primary, peers] = await Promise.allSettled([
      searchAssistantCatalog(supabase, query || parsed.data.query, {
        entityType, memberSignal, city: context.city, limit: primaryLimit,
      }),
      showPeers ? searchAssistantCatalog(supabase, navigatorSearchQuery({ ...context, memberSignal: undefined }), {
        entityType: "profile", city: context.city, limit,
      }) : Promise.resolve([]),
    ]);
    if (primary.status === "rejected") throw primary.reason;
    const primaryIds = new Set(primary.value.map(result => result.entityId));
    const related = peers.status === "fulfilled" ? peers.value.filter(result => !primaryIds.has(result.entityId)).slice(0, limit - primary.value.length) : [];
    const results = [...primary.value, ...related].slice(0, limit);
    const groups = [
      { memberSignal: memberSignal ?? null, results: primary.value },
      ...(related.length ? [{ memberSignal: null, results: related }] : []),
    ];

    return NextResponse.json({
      query: parsed.data.query,
      intent,
      entityType: entityType ?? null,
      memberSignal: memberSignal ?? null,
      context: resolved,
      groups,
      relatedUnavailable: peers.status === "rejected",
      results,
      mode: "read-only",
    });
  } catch (error) {
    if (error instanceof MentorshipSearchScopeError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    return NextResponse.json(
      { error: "Assistant search is temporarily unavailable." },
      { status: 503 },
    );
  }
}
