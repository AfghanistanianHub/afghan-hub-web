import { discoveryDecisionSchema, discoveryRequestSchema, publicDiscoveryResponseSchema, type DiscoveryPlan, type DiscoveryRequest, type PublicDiscoveryResponse } from "./public-discovery-contract";
import { planPublicDiscovery } from "./public-discovery";

export type DiscoveryPlanner = (request: DiscoveryRequest, signal: AbortSignal) => Promise<unknown>;
export type DiscoveryTool = (plan: DiscoveryPlan, signal: AbortSignal) => Promise<Pick<PublicDiscoveryResponse, "results" | "unavailable">>;
export class PlannerUnavailable extends Error {
  constructor(public readonly reason: "not-configured" | "unavailable" | "capacity") { super(reason); }
}

// One bounded planning call, followed by an application-controlled read tool.
// No model can choose a table, SQL, URL, user ID, or arbitrary tool execution.
export async function discover(input: unknown, tool: DiscoveryTool, signal: AbortSignal, planner?: DiscoveryPlanner): Promise<PublicDiscoveryResponse> {
  const request = discoveryRequestSchema.parse(input);
  let plan = planPublicDiscovery(request.query, request.filters, request.context);
  let engine: PublicDiscoveryResponse["engine"] = "structured-search";
  let fallback: PublicDiscoveryResponse["fallback"] = "disabled";
  let understanding = "";
  let clarification: string | null = null;
  if (planner) {
    try {
      const decision = discoveryDecisionSchema.parse(await planner(request, signal));
      // Explicit guided answers take precedence over inferred model filters.
      plan = request.filters ? { ...decision.plan, ...plan } : decision.plan;
      understanding = decision.understanding;
      clarification = request.filters ? null : decision.clarification;
      engine = "model-assisted"; fallback = null;
    } catch (error) {
      if (signal.aborted) throw error;
      fallback = error instanceof PlannerUnavailable ? error.reason : "unavailable";
    }
  }
  signal.throwIfAborted();
  const feed = clarification ? { results: [], unavailable: [] } : await tool(plan, signal);
  return publicDiscoveryResponseSchema.parse({ ...feed, plan, mode: "public-catalog", limited: true, engine, fallback, understanding, clarification });
}
