"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { getPasswordPolicyError } from "@/lib/password-policy";
import { cookies } from "next/headers";
import { authLanguageCookie, getAuthDestination, getAuthLanguage } from "@/lib/auth-navigation";

async function rememberLanguage(formData: FormData) {
  const language = getAuthLanguage(formData.get("lang"));
  (await cookies()).set(authLanguageCookie, language, {
    httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30,
  });
  return language;
}

export async function continueWithGoogle(formData: FormData) {
  const language = await rememberLanguage(formData);
  const next = getAuthDestination(formData.get("next"));
  const callback = new URL("/auth/callback", getSiteUrl());
  callback.search = new URLSearchParams({ flow: "google", next, lang: language }).toString();
  const supabase = await createClient();
  let authorizationUrl: string | null = null;
  try {
    // The SDK generates an authorization URL even when the provider is disabled.
    // Check public settings first so users stay on an actionable error screen.
    const settingsResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! },
      cache: "no-store", signal: AbortSignal.timeout(5000),
    });
    const settings = settingsResponse.ok ? await settingsResponse.json() : null;
    if (!settings?.external?.google) throw new Error("Provider unavailable");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString(), skipBrowserRedirect: true },
    });
    if (!error && data.url) {
      const url = new URL(data.url);
      // The SDK must return our configured Supabase authorization endpoint.
      if (url.origin === new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin && url.pathname === "/auth/v1/authorize") {
        authorizationUrl = url.toString();
      }
    }
  } catch {
    // Provider details and callback parameters must not reach the UI or logs.
  }
  if (!authorizationUrl) redirect(`/login?${new URLSearchParams({ error: "Google sign-in could not be completed. Please try again or continue with email.", next, lang: language })}`);
  redirect(authorizationUrl);
}

const loginErrorMessage = "We could not sign you in. Check your email and password and try again.";
const signupErrorMessage = "We could not create your account right now. Please try again shortly.";

export async function login(formData: FormData) {
  await rememberLanguage(formData);
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(loginErrorMessage)}&next=${encodeURIComponent(getAuthDestination(formData.get("next")))}`);
  }

  redirect(getAuthDestination(formData.get("next")));
}

const googleErrorMessage = "Google sign-in could not be completed. Please try again or use your email and password.";

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createClient();
  const flow = String(formData.get("flow") ?? "") === "join" ? "join" : "login";
  const loginPath = flow === "join" ? "/login?mode=join" : "/login";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback?next=/dashboard&flow=oauth`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    redirect(`${loginPath}${loginPath.includes("?") ? "&" : "?"}error=${encodeURIComponent(googleErrorMessage)}`);
  }

  redirect(data.url);
}

export async function signup(formData: FormData) {
  const language = await rememberLanguage(formData);
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordPolicyError = getPasswordPolicyError(password);

  if (passwordPolicyError) {
    redirect(
      `/login?mode=join&error=${encodeURIComponent(passwordPolicyError)}`
    );
  }

  const emailRedirectTo = `${getSiteUrl()}/auth/callback?${new URLSearchParams({ next: getAuthDestination(formData.get("next")), flow: "signup", lang: language })}`;
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo },
  });

  if (error) {
    redirect(`/login?mode=join&error=${encodeURIComponent(signupErrorMessage)}`);
  }

  redirect(
    `/login?message=${encodeURIComponent(
      "Account created. Check your email if confirmation is required."
    )}`
  );
}
