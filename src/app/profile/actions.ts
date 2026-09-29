"use server";

import { redirect } from "next/navigation";
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
  if (!value) return [];

  const seen = new Set<string>();
  const topics: string[] = [];

  for (const rawTopic of value.split(",")) {
    const topic = rawTopic.trim().normalize("NFC");
    if (!topic) continue;

    const normalized = topic.toLowerCase();
    if (seen.has(normalized)) continue;

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
    redirect("/profile?error=Enter%20a%20valid%20LinkedIn%20URL");
  }

  if (websiteUrl && !isValidHttpUrl(websiteUrl)) {
    redirect("/profile?error=Enter%20a%20valid%20website%20URL");
  }

  const languages = getOptionalString(formData, "languages")
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const skills = getOptionalString(formData, "skills")
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const mentorshipTopics = getMentorshipTopics(formData);

  if (
    mentorshipTopics.length > 12 ||
    mentorshipTopics.some((topic) => [...topic].length > 60)
  ) {
    redirect(
      "/profile?error=Add%20up%20to%2012%20mentorship%20topics%2C%20each%2060%20characters%20or%20less.",
    );
  }

  const profession = getOptionalString(formData, "profession");
  const company = getOptionalString(formData, "company");
  const city = getOptionalString(formData, "city");
  const provinceState = getOptionalString(formData, "province_state");
  const country = getOptionalString(formData, "country");
  const bio = getOptionalString(formData, "bio");
  const openToMentoring = formData.get("open_to_mentoring") === "on";
  const lookingForMentor = formData.get("looking_for_mentor") === "on";

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || "Member";

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
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
      open_to_mentoring: openToMentoring,
      looking_for_mentor: lookingForMentor,
      mentorship_topics: mentorshipTopics,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "id",
    },
  );

  if (error) {
    redirect("/profile?error=We%20could%20not%20save%20your%20profile.%20Please%20try%20again.");
  }

  redirect("/dashboard");
}
