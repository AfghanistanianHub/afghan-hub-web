import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedNextPaths = new Set(["/dashboard", "/update-password"]);

function getSafeNextPath(value: string | null) {
  return value && allowedNextPaths.has(value) ? value : "/dashboard";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const flow = request.nextUrl.searchParams.get("flow") === "signup" ? "signup" : "recovery";
  const nextPath = getSafeNextPath(request.nextUrl.searchParams.get("next"));

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = nextPath;
  redirectTo.search = "";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
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
