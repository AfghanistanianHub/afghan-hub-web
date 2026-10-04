import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const realRequire = createRequire(import.meta.url);

function transpile(path) {
  return ts.transpileModule(
    fs.readFileSync(new URL(path, import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } },
  ).outputText;
}

function loadOriginGuard() {
  const exports = {};
  vm.runInNewContext(
    transpile("../src/lib/http/request-origin.ts"),
    { exports, URL },
  );
  return exports.isSameOriginRequest;
}

function loadRoute(path) {
  const exports = {};
  let authCalls = 0;
  const isSameOriginRequest = loadOriginGuard();

  class TestNextResponse extends Response {
    static json(body, init) {
      return Response.json(body, init);
    }
  }

  class TestMentorshipSearchScopeError extends Error {}

  vm.runInNewContext(transpile(path), {
    exports,
    Response,
    Request,
    URL,
    console,
    require(name) {
      if (name === "next/server") {
        return { NextResponse: TestNextResponse };
      }
      if (name === "zod") {
        return realRequire("zod");
      }
      if (name === "@/lib/http/request-origin") {
        return { isSameOriginRequest };
      }
      if (name === "@/lib/supabase/server") {
        return {
          async createClient() {
            authCalls++;
            return {
              auth: {
                async getUser() {
                  return { data: { user: null }, error: null };
                },
              },
            };
          },
        };
      }
      if (name === "@/lib/assistant/intents") {
        return {
          inferAssistantIntent() {
            throw new Error("Intent inference must not run for unauthenticated origin-policy tests");
          },
        };
      }
      if (name === "@/lib/assistant/search") {
        return {
          MentorshipSearchScopeError: TestMentorshipSearchScopeError,
          searchAssistantCatalog() {
            throw new Error("Catalogue search must not run for unauthenticated origin-policy tests");
          },
        };
      }
      throw new Error(`Unexpected dependency in ${path}: ${name}`);
    },
  });

  return {
    POST: exports.POST,
    authCalls: () => authCalls,
  };
}

function request(path, origin) {
  return new Request(`https://app.apnbc.ca${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(origin ? { origin } : {}),
    },
    body: JSON.stringify({ query: "mentor", event: "assistant_open", language: "en" }),
  });
}

test("same-origin guard accepts exact origin and rejects missing or foreign origins", () => {
  const isSameOriginRequest = loadOriginGuard();

  assert.equal(
    isSameOriginRequest(request("/api/assistant/search", "https://app.apnbc.ca")),
    true,
  );
  assert.equal(
    isSameOriginRequest(request("/api/assistant/search", "https://evil.example")),
    false,
  );
  assert.equal(
    isSameOriginRequest(request("/api/assistant/search")),
    false,
  );
});

for (const [label, path, modulePath] of [
  ["search", "/api/assistant/search", "../src/app/api/assistant/search/route.ts"],
  ["analytics", "/api/assistant/analytics", "../src/app/api/assistant/analytics/route.ts"],
]) {
  test(`Assistant ${label} rejects foreign and missing origins before authentication`, async () => {
    for (const origin of ["https://evil.example", null]) {
      const app = loadRoute(modulePath);
      const response = await app.POST(request(path, origin));

      assert.equal(response.status, 403);
      assert.equal(app.authCalls(), 0);
      assert.deepEqual(
        await response.json(),
        { error: "Request origin is not allowed." },
      );
    }
  });

  test(`Assistant ${label} accepts same-origin requests into the authentication boundary`, async () => {
    const app = loadRoute(modulePath);
    const response = await app.POST(
      request(path, "https://app.apnbc.ca"),
    );

    assert.equal(app.authCalls(), 1);
    assert.equal(response.status, 401);
    assert.deepEqual(
      await response.json(),
      { error: "Authentication required." },
    );
  });
}

test("origin rejection copy does not echo request details", () => {
  const searchRoute = fs.readFileSync(
    new URL("../src/app/api/assistant/search/route.ts", import.meta.url),
    "utf8",
  );
  const analyticsRoute = fs.readFileSync(
    new URL("../src/app/api/assistant/analytics/route.ts", import.meta.url),
    "utf8",
  );

  for (const source of [searchRoute, analyticsRoute]) {
    assert.match(source, /Request origin is not allowed\./);
    assert.doesNotMatch(
      source,
      /headers\.get\("origin"\).*console|console.*headers\.get\("origin"\)/s,
    );
  }
});
