// Read-only preflight for an explicitly approved, isolated Supabase target.
// Deliberately never calls mutation-capable RPCs.
import assert from "node:assert/strict";

export function validateTarget(env) {
  const ref = env.SECURITY_TEST_PROJECT_REF?.trim();
  const approved = env.SECURITY_TEST_APPROVED_ISOLATED_REF?.trim();
  const url = env.SECURITY_TEST_SUPABASE_URL?.trim();
  const key = env.SECURITY_TEST_PUBLISHABLE_KEY?.trim();
  assert.ok(ref && approved && url && key, "Missing required isolated-target configuration");
  assert.match(ref, /^[a-z]{20}$/, "Unexpected Supabase project reference");
  assert.notEqual(ref, "yussznmwjsvfvpabmwdc", "Production is prohibited");
  assert.notEqual(ref, "rurgmyiiytesknsfwjjl", "Existing shared secondary is prohibited");
  assert.equal(ref, approved, "Explicit independent approval for the target ref is required");
  const parsed = new URL(url);
  assert.equal(parsed.origin, `https://${ref}.supabase.co`, "Target origin mismatch");
  assert.equal(parsed.pathname, "/", "No URL path allowed");
  assert.equal(parsed.search, "", "No query parameters allowed");
  assert.equal(parsed.hash, "", "No fragment allowed");
  assert.equal(parsed.username, "", "No embedded credentials allowed");
  assert.equal(parsed.password, "", "No embedded credentials allowed");
  return { origin: parsed.origin, ref, key };
}

export async function probeTarget(target, fetchFn = fetch) {
  const response = await fetchFn(`${target.origin}/rest/v1/`, {
    method: "GET",
    headers: { apikey: target.key },
    redirect: "error",
    signal: AbortSignal.timeout(8000),
  });
  assert.ok(response.status < 500, `REST endpoint returned HTTP ${response.status}`);
  return response.status;
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const target = validateTarget(process.env);
  const status = await probeTarget(target);
  console.log(`PASS read-only target endpoint probe: ${target.ref} (HTTP ${status})`);
  console.log("Not proof of disposability, data isolation, schema parity, or persona authorization.");
}
