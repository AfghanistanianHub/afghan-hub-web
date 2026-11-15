import { NextResponse, type NextRequest } from "next/server";
import { isPublicPath } from "@/lib/public-catalog";
import { updateSession } from "@/lib/supabase/proxy";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Per-request nonce-based Content-Security-Policy.
 *
 * `script-src` carries a fresh nonce and no `'unsafe-inline'`, so an injected
 * inline <script> cannot execute. Next.js reads the nonce out of the forwarded
 * `Content-Security-Policy` request header and stamps it on the framework
 * chunks and the inline bootstrap it renders itself.
 *
 * `'self'` stays in `script-src` on purpose: same-origin script files (Next
 * chunks, /_vercel/speed-insights/script.js) must keep loading. Adding
 * `'strict-dynamic'` instead would ignore `'self'` and require a nonce on every
 * third-party script tag as well.
 *
 * `style-src` keeps `'unsafe-inline'` because React inline `style` attributes
 * cannot carry a nonce and Tailwind ships its runtime styles inline.
 */
function buildContentSecurityPolicy(nonce: string): string {
  const scriptSrc = [
    "script-src",
    "'self'",
    `'nonce-${nonce}'`,
    ...(isDev ? ["'unsafe-eval'"] : []),
  ].join(" ");

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    [
      "connect-src",
      "'self'",
      "https://*.supabase.co",
      "wss://*.supabase.co",
      "https://vitals.vercel-insights.com",
      ...(isDev ? ["ws://localhost:*", "ws://127.0.0.1:*"] : []),
    ].join(" "),
    "frame-src 'self' https:",
    "media-src 'self' https://*.supabase.co",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export async function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce);

  // The nonce has to travel on the request so Next.js can stamp it on the
  // scripts it renders; it also goes on the response for the browser to enforce.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  let response: NextResponse;

  // Exact public catalogue endpoint; member assistant endpoints keep session handling.
  if (request.nextUrl.pathname === "/api/assistant/public-search") {
    response = NextResponse.next({ request: { headers: requestHeaders } });
  } else if (isPublicPath(request.nextUrl.pathname)) {
    response = NextResponse.next({ request: { headers: requestHeaders } });
  } else {
    // updateSession builds its own response from the request it is given, so it
    // receives a clone carrying the extra headers. Cookie handling is unchanged.
    response = await updateSession(new NextRequest(request, { headers: requestHeaders }));
  }

  response.headers.set("Content-Security-Policy", contentSecurityPolicy);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
