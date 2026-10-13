// Bound database reads only. Auth refresh, uploads and downloads retain their
// own cancellation/lifetime contracts.
export function createBoundedDatabaseFetch(upstream: typeof fetch = fetch, timeoutMs = 10_000): typeof fetch {
  return async (request, init) => {
    const url = new URL(request instanceof Request ? request.url : String(request));
    if (!url.pathname.startsWith("/rest/v1/")) return upstream(request, init);
    const caller = init?.signal !== undefined ? init.signal : request instanceof Request ? request.signal : undefined;
    const controller = new AbortController();
    const cancel = () => controller.abort(caller?.reason);
    let deadline: ReturnType<typeof setTimeout> | undefined;
    try {
      if (caller?.aborted) cancel();
      else {
        caller?.addEventListener("abort", cancel, { once: true });
        // AbortError is deliberately used: postgrest-js does not retry it.
        deadline = setTimeout(() => controller.abort(), timeoutMs);
      }
      const response = await upstream(request, { ...init, signal: controller.signal });
      // PostgREST parses the body after fetch resolves. Keep the deadline alive
      // through body consumption too; headers alone are not a completed query.
      if (!response.body) return response;
      const body = await response.arrayBuffer();
      return new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers });
    } finally {
      if (deadline !== undefined) clearTimeout(deadline);
      caller?.removeEventListener("abort", cancel);
    }
  };
}
