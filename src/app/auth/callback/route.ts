import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

const allowedNextPaths = new Set(["/dashboard", "/update-password"]);

function getSafeNextPath(value: string | null) {
  return value && allowedNextPaths.has(value) ? value : "/dashboard";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const providerError = request.nextUrl.searchParams.get("error");
  const flowParam = request.nextUrl.searchParams.get("flow");
  const flow = flowParam === "signup" ? "signup" : flowParam === "oauth" ? "oauth" : "recovery";
  const nextPath = getSafeNextPath(request.nextUrl.searchParams.get("next"));

  // The upstream host can differ from the public URL behind a proxy.
  const redirectTo = new URL(nextPath, getSiteUrl());

  if (flow === "oauth" && (providerError || !code)) {
    // Cancelled consent or a provider failure: return to sign-in without a session.
    const loginUrl = new URL("/login", getSiteUrl());
    loginUrl.searchParams.set(
      "error",
      "Google sign-in could not be completed. Please try again or use your email and password."
    );
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  if (flow === "oauth") {
    const loginUrl = new URL("/login", getSiteUrl());
    loginUrl.searchParams.set(
      "error",
      "Google sign-in could not be completed. Please try again or use your email and password."
    );
    return NextResponse.redirect(loginUrl);
  }

  if (flow === "signup") {
    redirectTo.pathname = "/login";
    redirectTo.searchParams.set("mode", "join");
    redirectTo.searchParams.set(
      "error",
      "The confirmation link is invalid or has expired. Please sign in if your account is already confirmed, or create the account again."
    );
  } else {
    redirectTo.pathname = "/forgot-password";
    redirectTo.searchParams.set(
      "error",
      "The password reset link is invalid or has expired. Request a new link and try again."
    );
  }

  return NextResponse.redirect(redirectTo);
}
