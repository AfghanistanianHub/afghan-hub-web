"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const passwordConfirmation = String(
    formData.get("passwordConfirmation") ?? ""
  );

  if (password.length < 8) {
    redirect(
      `/update-password?error=${encodeURIComponent(
        "Password must be at least 8 characters."
      )}`
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
      `/update-password?error=${encodeURIComponent(error.message)}`
    );
  }

  await supabase.auth.signOut();

  redirect(
    `/login?message=${encodeURIComponent(
      "Password updated successfully. Sign in with your new password."
    )}`
  );
}
