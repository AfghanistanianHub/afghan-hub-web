"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const allowedRoles = ["member", "moderator", "admin"] as const;
type ManagedRole = (typeof allowedRoles)[number];

export async function updateMemberRole(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const targetProfileId = formData.get("profile_id");
  const requestedRole = formData.get("role");

  if (
    typeof targetProfileId !== "string" ||
    typeof requestedRole !== "string" ||
    !allowedRoles.includes(requestedRole as ManagedRole)
  ) {
    redirect("/moderation/team?error=Invalid%20role%20request");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  const { data: changed, error } = await supabase.rpc("set_profile_role", {
    target_profile_id: targetProfileId,
    target_role: requestedRole as ManagedRole,
  });

  if (error || !changed) {
    redirect(
      `/moderation/team?error=${encodeURIComponent(
        error?.message ?? "Unable to update member role",
      )}`,
    );
  }

  revalidatePath("/moderation/team");
  revalidatePath("/moderation");
  redirect("/moderation/team?saved=1");
}
