import test from "node:test";
import assert from "node:assert/strict";
import { validateTarget, probeTarget } from "../scripts/security-readonly-target-preflight.mjs";

const ref = "abcdefghijklmnopqrst";
const base = {
  SECURITY_TEST_PROJECT_REF: ref,
  SECURITY_TEST_APPROVED_ISOLATED_REF: ref,
  SECURITY_TEST_SUPABASE_URL: `https://${ref}.supabase.co/`,
  SECURITY_TEST_PUBLISHABLE_KEY: "placeholder-public-test-key",
};

test("accepts only an explicitly approved isolated target", () => {
  assert.equal(validateTarget(base).ref, ref);
  for (const blocked of ["yussznmwjsvfvpabmwdc", "rurgmyiiytesknsfwjjl"]) {
    assert.throws(() => validateTarget({
      ...base, SECURITY_TEST_PROJECT_REF: blocked,
      SECURITY_TEST_APPROVED_ISOLATED_REF: blocked,
      SECURITY_TEST_SUPABASE_URL: `https://${blocked}.supabase.co/`,
    }));
  }
  assert.throws(() => validateTarget({ ...base, SECURITY_TEST_APPROVED_ISOLATED_REF: "other" }));
  assert.throws(() => validateTarget({ ...base, SECURITY_TEST_SUPABASE_URL: "https://evil.example/" }));
  assert.throws(() => validateTarget({ ...base, SECURITY_TEST_SUPABASE_URL: `https://${ref}.supabase.co/rest/v1/` }));
});

test("uses GET only, without invoking any RPC", async () => {
  let called = 0;
  const status = await probeTarget(validateTarget(base), async (url, options) => {
    called++;
    assert.equal(url, `https://${ref}.supabase.co/rest/v1/`);
    assert.equal(options.method, "GET");
    assert.equal(options.redirect, "error");
    return { status: 401 };
  });
  assert.equal(status, 401);
  assert.equal(called, 1);
  await assert.rejects(() => probeTarget(validateTarget(base), async () => ({ status: 503 })));
});
