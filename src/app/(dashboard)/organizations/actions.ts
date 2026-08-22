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

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createOrganization(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const name = getOptionalString(formData, "name");

  if (!name) {
    redirect("/organizations/new?error=Organization%20name%20is%20required");
  }

  const shortDescription = getOptionalString(
    formData,
    "short_description",
  );
  const description = getOptionalString(formData, "description");
  const organizationType = getOptionalString(
    formData,
    "organization_type",
  );
  const mission = getOptionalString(formData, "mission");
  const websiteUrl = getOptionalString(formData, "website_url");
  const email = getOptionalString(formData, "email");
  const phone = getOptionalString(formData, "phone");
  const city = getOptionalString(formData, "city");
  const provinceState = getOptionalString(formData, "province_state");
  const country = getOptionalString(formData, "country");

  const programs =
    getOptionalString(formData, "programs")
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) ?? [];

  const baseSlug = createSlug(name) || "organization";
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const { data: existingOrganization } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!existingOrganization) {
      break;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const { error } = await supabase.from("organizations").insert({
    owner_id: user.id,
    name,
    slug,
    short_description: shortDescription,
    description,
    organization_type: organizationType,
    mission,
    website_url: websiteUrl,
    email,
    phone,
    city,
    province_state: provinceState,
    country,
    programs,
    status: "published",
    updated_at: new Date().toISOString(),
  });

  if (error) {
    redirect(
      `/organizations/new?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(`/organizations/${slug}`);
}


export async function updateOrganization(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const slug = getOptionalString(formData, "slug");
  const name = getOptionalString(formData, "name");

  if (!slug || !name) {
    redirect("/organizations?error=Missing%20organization%20information");
  }

  const programs =
    getOptionalString(formData, "programs")
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) ?? [];

  const isAcceptingVolunteers =
    formData.get("is_accepting_volunteers") === "on";

  const { error } = await supabase
    .from("organizations")
    .update({
      name,
      organization_type: getOptionalString(formData, "organization_type"),
      short_description: getOptionalString(formData, "short_description"),
      description: getOptionalString(formData, "description"),
      mission: getOptionalString(formData, "mission"),
      programs,
      website_url: getOptionalString(formData, "website_url"),
      email: getOptionalString(formData, "email"),
      phone: getOptionalString(formData, "phone"),
      city: getOptionalString(formData, "city"),
      province_state: getOptionalString(formData, "province_state"),
      country: getOptionalString(formData, "country"),
      is_accepting_volunteers: isAcceptingVolunteers,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug)
    .eq("owner_id", user.id);

  if (error) {
    redirect(
      `/organizations/${slug}/edit?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(`/organizations/${slug}`);
}
