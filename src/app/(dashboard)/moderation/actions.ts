"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const entityTypes = ["opportunity", "event"] as const;
const decisions = ["approve", "reject"] as const;

function getString(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export async function moderateContent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const entityType = getString(formData, "entity_type");
  const entityId = getString(formData, "entity_id");
  const decision = getString(formData, "decision");

  if (
    !entityId ||
    !entityTypes.includes(entityType as (typeof entityTypes)[number]) ||
    !decisions.includes(decision as (typeof decisions)[number])
  ) {
    redirect("/moderation?error=Invalid%20moderation%20request");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin" && profile?.role !== "moderator") {
    redirect("/");
  }

  const { data: updated, error } =
    entityType === "opportunity"
      ? await supabase.rpc("moderate_opportunity", {
          target_opportunity_id: entityId,
          target_decision: decision,
        })
      : await supabase.rpc("moderate_event", {
          target_event_id: entityId,
          target_decision: decision,
        });

  if (error || !updated) {
    const message = error?.message ?? "Content is no longer pending review";
    redirect(`/moderation?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/moderation");
  revalidatePath("/opportunities");
  revalidatePath("/events");
  revalidatePath("/");
  redirect(`/moderation?success=${decision === "approve" ? "approved" : "rejected"}`);
}
