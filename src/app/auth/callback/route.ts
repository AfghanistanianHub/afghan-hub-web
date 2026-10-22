import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { authLanguageCookie, getAuthDestination, getAuthLanguage } from "@/lib/auth-navigation";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const flow = params.get("flow") === "google" ? "google" : params.get("flow") === "signup" ? "signup" : "recovery";
  const nextPath = flow === "recovery" && params.get("next") === "/update-password"
    ? "/update-password" : getAuthDestination(params.get("next"));
  const redirectTo = new URL(nextPath, getSiteUrl());
  let succeeded = false;

  if (code && code.length <= 4096 && params.getAll("code").length === 1 && !params.has("error")) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      succeeded = !error;
    } catch {
      // Never log authorization codes or provider errors.
    }
  }

  if (!succeeded) {
    if (flow === "google") {
      redirectTo.pathname = "/login";
      redirectTo.searchParams.set("next", getAuthDestination(params.get("next")));
      redirectTo.searchParams.set("error", params.get("error") === "access_denied"
        ? "Google sign-in was cancelled. Please try again or continue with email."
        : "Google sign-in could not be completed. Please try again or continue with email.");
    } else if (flow === "signup") {
      redirectTo.pathname = "/login";
      redirectTo.searchParams.set("mode", "join");
      redirectTo.searchParams.set("error", "The confirmation link is invalid or has expired. Please sign in if your account is already confirmed, or create the account again.");
    } else {
      redirectTo.pathname = "/forgot-password";
      redirectTo.searchParams.set("error", "The password reset link is invalid or has expired. Request a new link and try again.");
    }
  }

  // Also carry locale to the trusted destination if proxy and canonical hosts differ.
  if (params.has("lang")) redirectTo.searchParams.set("lang", getAuthLanguage(params.get("lang")));
  const response = NextResponse.redirect(redirectTo, 303);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Referrer-Policy", "no-referrer");
  if (params.has("lang")) response.cookies.set(authLanguageCookie, getAuthLanguage(params.get("lang")), {
    secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export async function HEAD() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET", "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } });
}
