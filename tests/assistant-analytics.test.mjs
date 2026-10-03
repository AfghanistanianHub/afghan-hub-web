import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const route = fs.readFileSync(
  new URL("../src/app/api/assistant/analytics/route.ts", import.meta.url),
  "utf8",
);
const client = fs.readFileSync(
  new URL("../src/lib/assistant/analytics.ts", import.meta.url),
  "utf8",
);

test("assistant analytics never transmits raw query text or identity/session fields", () => {
  for (const source of [route, client]) {
    assert.doesNotMatch(
      source,
      /queryText\s*:|rawQuery\s*:|email\s*:|display_name\s*:|first_name\s*:|last_name\s*:|sessionId\s*:/,
    );
  }

  assert.doesNotMatch(client, /sessionStorage|randomUUID|afghan-hub-assistant-session/);
  assert.match(route, /no raw query text/);
  assert.match(route, /no user ID or per-session identifier/);
});

test("assistant analytics is authenticated and schema bounded", () => {
  assert.match(route, /supabase\.auth\.getUser\(\)/);
  assert.match(route, /status:\s*401/);
  assert.match(route, /resultCount: z\.number\(\)\.int\(\)\.min\(0\)\.max\(12\)/);
});

test("assistant analytics only captures discovery KPI events", () => {
  for (const event of [
    "assistant_open",
    "assistant_language_change",
    "assistant_search",
    "assistant_result_click",
    "assistant_recovery_click",
  ]) {
    assert.match(route, new RegExp(event));
    assert.match(client, new RegExp(event));
  }

  assert.doesNotMatch(route, /insert\(|update\(|delete\(|upsert\(/);
});


function loadAnalyticsClient() {
  const calls = [];
  const exports = {};
  const source = fs.readFileSync(
    new URL("../src/lib/assistant/analytics.ts", import.meta.url),
    "utf8",
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;

  vm.runInNewContext(compiled, {
    exports,
    fetch(url, init) {
      calls.push({ url, init });
      return Promise.resolve({ ok: true });
    },
    JSON,
    Promise,
  });

  return { track: exports.trackAssistantEvent, calls };
}

test("assistant analytics emits only event-scoped aggregate fields", () => {
  const cases = [
    {
      input: { event: "assistant_open", language: "en" },
      keys: ["event", "language"],
    },
    {
      input: { event: "assistant_language_change", language: "fa" },
      keys: ["event", "language"],
    },
    {
      input: {
        event: "assistant_search",
        language: "ps",
        intent: "find_people",
        entityType: "profile",
        resultCount: 2,
        hadResults: true,
      },
      keys: [
        "entityType",
        "event",
        "hadResults",
        "intent",
        "language",
        "resultCount",
      ],
    },
    {
      input: {
        event: "assistant_result_click",
        language: "en",
        entityType: "event",
      },
      keys: ["entityType", "event", "language"],
    },
    {
      input: {
        event: "assistant_recovery_click",
        language: "en",
        destination: "events",
      },
      keys: ["destination", "event", "language"],
    },
  ];

  for (const { input, keys } of cases) {
    const app = loadAnalyticsClient();
    app.track(input);
    assert.equal(app.calls.length, 1);
    assert.equal(app.calls[0].url, "/api/assistant/analytics");

    const payload = JSON.parse(app.calls[0].init.body);
    assert.deepEqual(Object.keys(payload).sort(), [...keys].sort());
    assert.deepEqual(payload, input);
  }
});
