import { NextResponse, type NextRequest } from "next/server";
import { localeCookie, parseLocale, switchDestination } from "@/lib/i18n/locale";
export function GET(request: NextRequest) {
  const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
  if (!locale) return new Response("Unsupported language", { status: 400 });
  const response = NextResponse.redirect(new URL(switchDestination(request.nextUrl.searchParams.get("next") ?? "/", locale), request.url), 303);
  response.cookies.set(localeCookie, locale, { path: "/", maxAge: 31536000, sameSite: "lax", secure: request.nextUrl.protocol === "https:" });
  response.cookies.set("afghan-hub-navigator-language", locale, { path: "/", maxAge: 31536000, sameSite: "lax", secure: request.nextUrl.protocol === "https:" });
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
