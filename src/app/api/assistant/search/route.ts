import { NextResponse } from "next/server";
import { z } from "zod";

import { searchAssistantCatalog } from "@/lib/assistant/search";
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
    const results = await searchAssistantCatalog(supabase, parsed.data.query, {
      entityType: parsed.data.entityType,
      limit: parsed.data.limit,
    });

    return NextResponse.json({
      query: parsed.data.query,
      results,
      mode: "read-only",
    });
  } catch {
    return NextResponse.json(
      { error: "Assistant search is temporarily unavailable." },
      { status: 503 },
    );
  }
}
