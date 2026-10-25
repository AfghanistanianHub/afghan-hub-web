"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isValidHttpUrl } from "@/lib/validation";

function getOptionalString(formData: FormData, field: string) {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return null;
  }

  const cleanedValue = value.trim();
  return cleanedValue.length > 0 ? cleanedValue : null;
}

function getMentorshipTopics(formData: FormData) {
  const value = getOptionalString(formData, "mentorship_topics");

  if (!value) {
    return [];
  }

  const seen = new Set<string>();
  const topics: string[] = [];

  for (const rawTopic of value.split(",")) {
    const topic = rawTopic.trim().normalize("NFC");

    if (!topic) {
      continue;
    }

    const normalized = topic.toLocaleLowerCase();

    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    topics.push(topic);
  }

  return topics;
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
  const headline = getOptionalString(formData, "headline");
  const linkedinUrl = getOptionalString(formData, "linkedin_url");
  const websiteUrl = getOptionalString(formData, "website_url");

  if (linkedinUrl && !isValidHttpUrl(linkedinUrl)) {
    redirect("/profile?error=linkedin-url-invalid");
  }

  if (websiteUrl && !isValidHttpUrl(websiteUrl)) {
    redirect("/profile?error=website-url-invalid");
  }

  const languages = getOptionalString(formData, "languages")
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const skills = getOptionalString(formData, "skills")
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const profession = getOptionalString(formData, "profession");
  const company = getOptionalString(formData, "company");
  const city = getOptionalString(formData, "city");
  const provinceState = getOptionalString(formData, "province_state");
  const country = getOptionalString(formData, "country");
  const bio = getOptionalString(formData, "bio");
  const mentorshipTopics = getMentorshipTopics(formData);
  const openToMentoring = formData.get("open_to_mentoring") === "on";
  const lookingForMentor = formData.get("looking_for_mentor") === "on";

  if (
    mentorshipTopics.length > 12 ||
    mentorshipTopics.some((topic) => topic.length > 60)
  ) {
    redirect("/profile?error=mentorship-topics-invalid");
  }

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || "Member";

  const editableProfile = {
    first_name: firstName,
    last_name: lastName,
    headline,
    display_name: displayName,
    profession,
    company,
    city,
    province_state: provinceState,
    country,
    bio,
    linkedin_url: linkedinUrl,
    website_url: websiteUrl,
    languages: languages ?? [],
    skills: skills ?? [],
    onboarding_completed: true,
  };

  const mentorshipUpdate = {
    open_to_mentoring: openToMentoring,
    looking_for_mentor: lookingForMentor,
    mentorship_topics: mentorshipTopics,
  };

  // Identity columns are insert-only; the database maintains updated_at.
  const { data: updatedProfile, error: updateError } = await supabase
    .from("profiles")
    .update({ ...editableProfile, ...mentorshipUpdate })
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (updateError) {
    redirect("/profile?error=save-failed");
  }

  if (!updatedProfile) {
    const { error: insertError } = await supabase
      .from("profiles")
      .insert({ id: user.id, email: user.email ?? null, ...editableProfile })
      .select("id")
      .single();

    if (insertError) {
      redirect("/profile?error=save-failed");
    }

    const { error: mentorshipUpdateError } = await supabase
      .from("profiles")
      .update(mentorshipUpdate)
      .eq("id", user.id);

    if (mentorshipUpdateError) {
      redirect("/profile?error=mentorship-save-failed");
    }
  }

  // Dashboard may have been prefetched while onboarding was incomplete.
  // Invalidate that guarded payload only after the profile write succeeds.
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  redirect("/dashboard");
}
