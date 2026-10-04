import { NextResponse } from "next/server";
import { z } from "zod";

import { inferAssistantIntent } from "@/lib/assistant/intents";
import { MentorshipSearchScopeError, searchAssistantCatalog } from "@/lib/assistant/search";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({
  query: z.string().trim().min(2).max(120),
  entityType: z
    .enum(["profile", "business", "organization", "opportunity", "event"])
    .optional(),
  limit: z.number().int().min(1).max(12).optional(),
});

export async function POST(request: Request) {
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
    const inferred = inferAssistantIntent(parsed.data.query);
    const entityType = parsed.data.entityType ?? inferred.entityType;
    const results = await searchAssistantCatalog(supabase, parsed.data.query, {
      entityType,
      memberSignal: inferred.memberSignal,
      limit: parsed.data.limit,
    });

    return NextResponse.json({
      query: parsed.data.query,
      intent: inferred.intent,
      entityType: entityType ?? null,
      memberSignal: inferred.memberSignal ?? null,
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
