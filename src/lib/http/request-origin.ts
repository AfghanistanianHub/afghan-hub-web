export function isSameOriginRequest(request: Request) {
  try {
    const origin = request.headers.get("origin");
    return Boolean(origin) && origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
