"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";

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

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    redirect(
      `/login?mode=join&error=${encodeURIComponent(
        "Password must be at least 8 characters."
      )}`
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
