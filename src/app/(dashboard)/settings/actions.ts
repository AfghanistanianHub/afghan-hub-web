"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function updateAccountSettings(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: updatedProfile, error } = await supabase
    .from("profiles")
    .update({
      is_public: formData.get("is_public") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  if (!updatedProfile) {
    redirect("/settings?error=Unable%20to%20update%20your%20settings");
  }

  revalidatePath("/", "layout");
  redirect("/settings?saved=1");
}
