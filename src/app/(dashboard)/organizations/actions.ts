"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getMyAccessContext } from "@/lib/profile-access";
import { createClient } from "@/lib/supabase/server";
import { isValidEmail, isValidHttpUrl } from "@/lib/validation";

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
    redirect("/organizations/new?error=name-required");
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
  const isAcceptingVolunteers =
    formData.get("is_accepting_volunteers") === "on";

  if (websiteUrl && !isValidHttpUrl(websiteUrl)) {
    redirect("/organizations/new?error=url-invalid");
  }

  if (email && !isValidEmail(email)) {
    redirect("/organizations/new?error=email-invalid");
  }

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
    is_accepting_volunteers: isAcceptingVolunteers,
    status: "draft",
    updated_at: new Date().toISOString(),
  });

  if (error) {
    redirect("/organizations/new?error=create-failed");
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
    redirect("/organizations");
  }

  const websiteUrl = getOptionalString(formData, "website_url");
  const email = getOptionalString(formData, "email");

  if (websiteUrl && !isValidHttpUrl(websiteUrl)) {
    redirect(`/organizations/${slug}/edit?error=url-invalid`);
  }

  if (email && !isValidEmail(email)) {
    redirect(`/organizations/${slug}/edit?error=email-invalid`);
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
      website_url: websiteUrl,
      email,
      phone: getOptionalString(formData, "phone"),
      city: getOptionalString(formData, "city"),
      province_state: getOptionalString(formData, "province_state"),
      country: getOptionalString(formData, "country"),
      is_accepting_volunteers: isAcceptingVolunteers,
      status: "draft",
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug)
    .eq("owner_id", user.id);

  if (error) {
    redirect(`/organizations/${slug}/edit?error=update-failed`);
  }

  redirect(`/organizations/${slug}`);
}


export async function setOrganizationVerification(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const organizationId = getOptionalString(formData, "organization_id");
  const slug = getOptionalString(formData, "slug");
  const verified = formData.get("verified") === "true";

  if (!organizationId || !slug) {
    redirect("/organizations");
  }

  const { data: accessContext } = await getMyAccessContext(supabase, user.id);

  if (accessContext?.role !== "admin") {
    redirect("/");
  }

  const { data: organization, error } = await supabase
    .from("organizations")
    .update({ is_verified: verified })
    .eq("id", organizationId)
    .eq("slug", slug)
    .eq("status", "published")
    .select("slug")
    .maybeSingle();

  if (error || !organization) {
    redirect(`/organizations/${slug}?error=verification-failed`);
  }

  revalidatePath("/organizations");
  revalidatePath(`/organizations/${slug}`);
  revalidatePath("/search");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/explore", "layout");
  redirect(`/organizations/${slug}`);
}
