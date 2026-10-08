import "server-only";
import { PlannerUnavailable } from "./discovery-orchestrator";

// Atomic global ceilings shared by all instances using this Redis database.
// Fixed keys contain no query, user identifier, IP, or conversation data.
export const budgetScript = `
local minute = tonumber(redis.call('GET', KEYS[1]) or '0')
local day = tonumber(redis.call('GET', KEYS[2]) or '0')
if minute >= 10 or day >= 200 then return 0 end
redis.call('INCR', KEYS[1]); if minute == 0 then redis.call('EXPIRE', KEYS[1], 60) end
redis.call('INCR', KEYS[2]); if day == 0 then redis.call('EXPIRE', KEYS[2], 86400) end
return 1`;

export async function claimDiscoveryBudget(signal: AbortSignal) {
  const endpoint = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!endpoint || !token) throw new PlannerUnavailable("not-configured");
  let url: URL;
  try { url = new URL(endpoint); } catch { throw new PlannerUnavailable("not-configured"); }
  if (url.protocol !== "https:" || !url.hostname.endsWith(".upstash.io") || url.username || url.password || url.search || url.hash || url.pathname !== "/") throw new PlannerUnavailable("not-configured");
  const environment = process.env.VERCEL_ENV === "production" ? "production" : "preview";
  try {
    const response = await fetch(url, {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, cache: "no-store", redirect: "error",
      body: JSON.stringify(["EVAL", budgetScript, 2, `afghan-hub:navigator:${environment}:minute`, `afghan-hub:navigator:${environment}:day`]),
      signal: AbortSignal.any([signal, AbortSignal.timeout(1500)]),
    });
    if (!response.ok) throw new PlannerUnavailable("unavailable");
    const value: unknown = await response.json();
    if (!value || typeof value !== "object" || !("result" in value) || (value.result !== 0 && value.result !== 1) || "error" in value) throw new PlannerUnavailable("unavailable");
    if (value.result === 0) throw new PlannerUnavailable("capacity");
  } catch (error) {
    signal.throwIfAborted();
    throw error instanceof PlannerUnavailable ? error : new PlannerUnavailable("unavailable");
  }
}
