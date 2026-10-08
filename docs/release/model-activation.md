# Controlled Navigator activation

Model calls remain disabled. No live model, live Upstash request or paid provider usage was exercised. Atomic Redis reservations were separately exercised in a disposable offline Redis container. The current product uses explicitly labeled structured public search. Provider and SDK tests use offline stubs only.

## Owner configuration after a credential is available

1. Choose `openai` or `gateway`, a structured-output-compatible model ID, a processing region and a reviewed privacy policy. Only search text and bounded previous filters/clarification go to the planner; catalog records do not.
2. Separately configure the corresponding server-only secret in **Vercel Preview**: `OPENAI_API_KEY` or `AI_GATEWAY_API_KEY`. Never use a `NEXT_PUBLIC_` name, chat, source control or logs. This phase does not request or provision that credential.
3. Configure a reviewed shared Upstash Redis budget store using server-only `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Only HTTPS `*.upstash.io` root endpoints are accepted, with redirects rejected. The adapter makes one atomic EVAL reservation on fixed minute/day counters containing no query, user ID or IP. Missing configuration, timeout, invalid response or exhausted capacity prevents the model call and preserves structured search.
4. Set Preview `NAVIGATOR_MODEL_PROVIDER`, `NAVIGATOR_MODEL_ID` and `NAVIGATOR_MODEL_ENABLED=true`. Set provider spending caps and alerts independently. Application ceilings are ten model calls per 60-second window and 200 per 24-hour window, shared across instances using that database. Preview/development share a namespace; production is separate. These are request ceilings, not a currency budget. Reservations are not refunded after provider failure. Eviction, flushing or separate Redis databases can reset/separate the counters; verify the chosen store's retention and availability.
5. Redeploy Preview and evaluate the [case set](navigator-evaluation-cases.json) against real authorized records. Capture only sanitized decisions, fixture references, latency and aggregate token/cost metrics. Confirm provider timeout/cancellation, 600 output-token cap, one call/no retries, shared exhaustion and fallback labels. SDK output limits do not guarantee a dollar cap or account-wide spend ceiling.
6. Review native-language behavior, prompt-injection attempts, private information requests and all resulting links. Invalid model tables/kinds, extra SQL/results/URLs must fail validation; database access remains application controlled and subject to public RLS. Model restatements/clarifications also require live semantic review: schema validation alone cannot prove factual or linguistic quality.
7. Resolve the security scan quota, authenticated browser coverage and other release gates. Production activation requires separate explicit approval. Roll back paid calls using `NAVIGATOR_MODEL_ENABLED=false` or `NAVIGATOR_MODEL_PROVIDER=structured`, then redeploy the approved environment.

## Reproducible offline checks

`node --test tests/discovery-provider.test.mjs tests/discovery-budget.test.mjs tests/public-navigator.test.mjs tests/guided-discovery.test.mjs`

These tests validate configurable activation, SDK request bounds/cancellation, strict plan/output schemas, private-kind and arbitrary-URL rejection, empty/partial feeds, shared-budget request behavior, locale aliases and conversational follow-ups with stubs. They never establish live intent accuracy, model latency/cost, native language quality or configured Upstash service behavior. The isolated CI job executes the actual reservation Lua against Redis 7.4: exactly ten of thirty concurrent attempts succeed, the daily ceiling holds and existing expirations remain intact. Live transport, shared deployment store configuration and multi-instance activation still require verification before paid activation.

The public endpoint's general request limiter remains per instance. The new shared limiter protects model cost; deployment-wide public-search abuse protection still requires a reviewed WAF/edge policy.
