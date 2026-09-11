"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const entityTypes = ["opportunity", "event", "business", "organization"] as const;
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
  const note = getString(formData, "moderation_note");

  if (
    !entityId ||
    !entityTypes.includes(entityType as (typeof entityTypes)[number]) ||
    !decisions.includes(decision as (typeof decisions)[number])
  ) {
    redirect("/moderation?error=Invalid%20moderation%20request");
  }

  if (decision === "reject" && (note.length < 10 || note.length > 1000)) {
    redirect(
      "/moderation?error=Please%20provide%20a%20rejection%20reason%20between%2010%20and%201000%20characters",
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin" && profile?.role !== "moderator") {
    redirect("/");
  }

  let updated = false;
  let moderationError: string | null = null;
  const targetNote = decision === "reject" ? note : null;

  if (entityType === "opportunity") {
    const { data, error } = await supabase.rpc("moderate_opportunity", {
      target_opportunity_id: entityId,
      target_decision: decision,
      target_note: targetNote,
    });
    updated = Boolean(data);
    moderationError = error?.message ?? null;
  } else if (entityType === "event") {
    const { data, error } = await supabase.rpc("moderate_event", {
      target_event_id: entityId,
      target_decision: decision,
      target_note: targetNote,
    });
    updated = Boolean(data);
    moderationError = error?.message ?? null;
  } else if (entityType === "business") {
    const { data, error } = await supabase.rpc("moderate_business", {
      target_business_id: entityId,
      target_decision: decision,
      target_note: targetNote,
    });
    updated = Boolean(data);
    moderationError = error?.message ?? null;
  } else {
    const { data, error } = await supabase.rpc("moderate_organization", {
      target_organization_id: entityId,
      target_decision: decision,
      target_note: targetNote,
    });
    updated = Boolean(data);
    moderationError = error?.message ?? null;
  }

  if (moderationError || !updated) {
    const message =
      moderationError ?? "Content is no longer pending review";
    redirect(`/moderation?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/moderation");
  revalidatePath("/opportunities");
  revalidatePath("/events");
  revalidatePath("/businesses");
  revalidatePath("/organizations");
  revalidatePath("/submissions");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/explore", "layout");
  redirect(`/moderation?success=${decision === "approve" ? "approved" : "rejected"}`);
}
