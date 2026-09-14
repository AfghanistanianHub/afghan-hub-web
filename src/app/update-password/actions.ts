"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPasswordPolicyError } from "@/lib/password-policy";

const passwordUpdateErrorMessage =
  "We could not update your password right now. Request a new reset link and try again.";

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const passwordConfirmation = String(
    formData.get("passwordConfirmation") ?? ""
  );
  const passwordPolicyError = getPasswordPolicyError(password);

  if (passwordPolicyError) {
    redirect(
      `/update-password?error=${encodeURIComponent(passwordPolicyError)}`
    );
  }

  if (password !== passwordConfirmation) {
    redirect(
      `/update-password?error=${encodeURIComponent(
        "Passwords do not match."
      )}`
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent(
        "Your password reset session has expired. Request a new link."
      )}`
    );
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(
      `/update-password?error=${encodeURIComponent(passwordUpdateErrorMessage)}`
    );
  }

  await supabase.auth.signOut();

  redirect(
    `/login?message=${encodeURIComponent(
      "Password updated successfully. Sign in with your new password."
    )}`
  );
}
