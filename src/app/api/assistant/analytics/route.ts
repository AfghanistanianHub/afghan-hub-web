import { NextResponse } from "next/server";
import { z } from "zod";

import { isSameOriginRequest } from "@/lib/http/request-origin";
import { createClient } from "@/lib/supabase/server";

const languageSchema = z.enum(["en", "fa-AF", "fa", "ps"]);
const entityTypeSchema = z.enum([
  "profile",
  "business",
  "organization",
  "opportunity",
  "event",
]);

const eventSchema = z.discriminatedUnion("event", [
  z
    .object({
      event: z.literal("assistant_open"),
      language: languageSchema,
    })
    .strict(),
  z
    .object({
      event: z.literal("assistant_language_change"),
      language: languageSchema,
    })
    .strict(),
  z
    .object({
      event: z.literal("assistant_search"),
      language: languageSchema,
      intent: z.string().trim().min(1).max(40),
      entityType: entityTypeSchema.nullable(),
      resultCount: z.number().int().min(0).max(12),
      hadResults: z.boolean(),
    })
    .strict(),
  z
    .object({
      event: z.literal("assistant_result_click"),
      language: languageSchema,
      entityType: entityTypeSchema,
    })
    .strict(),
  z
    .object({
      event: z.literal("assistant_recovery_click"),
      language: languageSchema,
      destination: z.enum(["network", "organizations", "opportunities", "events"]),
    })
    .strict(),
]);

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

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid analytics event." }, { status: 400 });
  }

  // Privacy-minimal telemetry:
  // - no raw query text
  // - no profile fields
  // - no email
  // - no user ID or per-session identifier in the emitted event
  console.info(
    "afghan_hub_assistant_event",
    JSON.stringify({
      ...parsed.data,
      recordedAt: new Date().toISOString(),
    }),
  );

  return new NextResponse(null, { status: 204 });
}
