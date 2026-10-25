"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { getPasswordPolicyError } from "@/lib/password-policy";

const loginErrorMessage = "We could not sign you in. Check your email and password and try again.";
const signupErrorMessage = "We could not create your account right now. Please try again shortly.";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(loginErrorMessage)}`);
  }

  redirect("/dashboard");
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
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordPolicyError = getPasswordPolicyError(password);

  if (passwordPolicyError) {
    redirect(
      `/login?mode=join&error=${encodeURIComponent(passwordPolicyError)}`
    );
  }

  const emailRedirectTo = `${getSiteUrl()}/auth/callback?next=/dashboard&flow=signup`;
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
