import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

function redirectTo(path: string) {
  const response = NextResponse.redirect(new URL(path, getSiteUrl()), 303);
  // A verification response can set a session cookie. Never share or retain it.
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get("type");
  const tokenHash = params.get("token_hash");
  const isRecovery = type === "recovery";

  if (
    (type === "signup" || isRecovery) &&
    params.getAll("type").length === 1 &&
    params.getAll("token_hash").length === 1 &&
    tokenHash &&
    tokenHash.length <= 512 &&
    /^[A-Za-z0-9_-]+$/.test(tokenHash)
  ) {
    try {
      const supabase = await createClient();
      // Use explicit signup: the generic email mode also accepts recovery tokens.
      // Token verification creates the session in this browser's cookie store;
      // it does not need a PKCE verifier from the browser that sent the email.
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });
      if (!error && data.user && data.session) {
        // Destinations are tied to the verified flow, never URL input.
        return redirectTo(isRecovery ? "/update-password" : "/dashboard");
      }
    } catch {
      // Do not log bearer tokens, provider details or callback parameters.
    }
  }

  const path = isRecovery ? "/forgot-password" : "/login";
  const error = isRecovery
    ? "The password reset link is invalid or has expired. Request a new link and try again."
    : "The confirmation link is invalid or has expired. Please sign in if your account is already confirmed, or create the account again.";
  return redirectTo(`${path}?${new URLSearchParams({ error })}`);
}

// Email scanners and link previews must not consume a one-time token via HEAD.
export async function HEAD() {
  return new NextResponse(null, {
    status: 405,
    headers: { Allow: "GET", "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" },
  });
}
