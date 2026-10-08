import { z } from "zod";

const kind = z.enum(["businesses", "organizations", "opportunities", "events"]);
export const publicDiscoveryResponseSchema = z.object({
  mode: z.literal("public-catalog"),
  limited: z.boolean(),
  plan: z.object({ kinds: z.array(kind).max(4), people: z.boolean(), topic: z.string().max(80), location: z.string().max(60), thisMonth: z.boolean() }),
  unavailable: z.array(kind).max(4),
  results: z.array(z.object({ kind, title: z.string(), summary: z.string().nullable(), location: z.string(), href: z.string().regex(/^\/explore\/(businesses|organizations|opportunities|events)\/[^/]+$/), rank: z.number().finite().nonnegative() })).max(8),
});
export type PublicDiscoveryResponse = z.infer<typeof publicDiscoveryResponseSchema>;
