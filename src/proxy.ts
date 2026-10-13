import { NextResponse, type NextRequest } from "next/server";
import { parseLocale } from "@/lib/i18n/locale";
import { isPublicPath } from "@/lib/public-catalog";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  // Locale hints only: no catch-all locale redirects, and no auth/API interception.
  const pathname = request.nextUrl.pathname;
  request.headers.delete("x-afghan-hub-locale");
  const homeLocale = /^\/(en|fa|ps)\/?$/.exec(pathname)?.[1];
  if (homeLocale || (!/^\/(api|auth|language|_next)(\/|$)/.test(pathname) && parseLocale(request.nextUrl.searchParams.get("lang")))) {
    request.headers.set("x-afghan-hub-locale", homeLocale ?? parseLocale(request.nextUrl.searchParams.get("lang"))!);
  }
  if (homeLocale || pathname === "/language/select") return NextResponse.next({ request });
  // Exact public catalogue endpoint; member assistant endpoints keep session handling.
  if (request.nextUrl.pathname === "/api/assistant/public-search") return NextResponse.next({ request });
  if (isPublicPath(request.nextUrl.pathname)) return NextResponse.next({ request });
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
