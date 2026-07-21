"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getOptionalString(formData: FormData, field: string) {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return null;
  }

  const cleanedValue = value.trim();
  return cleanedValue.length > 0 ? cleanedValue : null;
}

export async function saveProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const firstName = getOptionalString(formData, "first_name");
  const lastName = getOptionalString(formData, "last_name");
  const profession = getOptionalString(formData, "profession");
  const company = getOptionalString(formData, "company");
  const city = getOptionalString(formData, "city");
  const provinceState = getOptionalString(formData, "province_state");
  const country = getOptionalString(formData, "country");
  const bio = getOptionalString(formData, "bio");

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || user.email || "Member";

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      first_name: firstName,
      last_name: lastName,
      display_name: displayName,
      profession,
      company,
      city,
      province_state: provinceState,
      country,
      bio,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "id",
    },
  );

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/");
}
