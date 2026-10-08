import { NextResponse, type NextRequest } from "next/server";
import { isPublicPath } from "@/lib/public-catalog";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  // Exact public catalogue endpoint; member assistant endpoints keep session handling.
  if (request.nextUrl.pathname === "/api/assistant/public-search") return NextResponse.next();
  if (isPublicPath(request.nextUrl.pathname)) return NextResponse.next();
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
