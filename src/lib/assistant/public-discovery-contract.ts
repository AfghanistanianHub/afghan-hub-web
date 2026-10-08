import { z } from "zod";

const kind = z.enum(["businesses", "organizations", "opportunities", "events"]);
export const discoveryPlanSchema = z.object({ kinds: z.array(kind).min(1).max(4).refine(values => new Set(values).size === values.length), people: z.boolean(), topic: z.string().max(80), location: z.string().max(60), thisMonth: z.boolean() }).strict();
export const discoveryRequestSchema = z.object({
  query: z.string().trim().min(2).max(120),
  language: z.enum(["en", "fa", "fa-AF", "ps"]).default("en"),
  filters: z.object({ goal: z.string().trim().max(80).optional(), topic: z.string().trim().max(80).optional(), location: z.string().trim().max(60).optional() }).strict().optional(),
  context: discoveryPlanSchema.optional(),
  clarification: z.string().trim().min(2).max(180).optional(),
}).strict();
export type DiscoveryRequest = z.infer<typeof discoveryRequestSchema>;
export type DiscoveryPlan = z.infer<typeof discoveryPlanSchema>;
// A model can only propose a search or one clarification, never records or URLs.
export const discoveryDecisionSchema = z.object({ plan: discoveryPlanSchema, understanding: z.string().trim().max(240), clarification: z.string().trim().min(2).max(180).nullable() }).strict();
export const publicDiscoveryResponseSchema = z.object({
  mode: z.literal("public-catalog"),
  engine: z.enum(["structured-search", "model-assisted"]),
  fallback: z.enum(["disabled", "not-configured", "unavailable", "capacity"]).nullable(),
  understanding: z.string().max(240),
  clarification: z.string().max(180).nullable(),
  limited: z.boolean(),
  plan: discoveryPlanSchema,
  unavailable: z.array(kind).max(4),
  results: z.array(z.object({ kind, title: z.string().max(200), summary: z.string().max(240).nullable(), location: z.string().max(160), href: z.string().max(600).regex(/^\/explore\/(businesses|organizations|opportunities|events)\/[^/]+$/), rank: z.number().finite().nonnegative() })).max(8),
});
export type PublicDiscoveryResponse = z.infer<typeof publicDiscoveryResponseSchema>;
