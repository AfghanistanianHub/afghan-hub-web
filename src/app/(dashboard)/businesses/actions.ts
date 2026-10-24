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

export async function createBusiness(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const name = getOptionalString(formData, "name");
  const category = getOptionalString(formData, "category");

  if (!name || name.length < 2 || name.length > 120) {
    redirect("/businesses/new?error=name-invalid");
  }

  if (!category || category.length > 120) {
    redirect("/businesses/new?error=category-invalid");
  }

  const shortDescription = getOptionalString(
    formData,
    "short_description",
  );

  if (shortDescription && shortDescription.length > 200) {
    redirect("/businesses/new?error=short-description-too-long");
  }

  const description = getOptionalString(formData, "description");
  const websiteUrl = getOptionalString(formData, "website_url");
  const email = getOptionalString(formData, "email");

  if (websiteUrl && !isValidHttpUrl(websiteUrl)) {
    redirect("/businesses/new?error=url-invalid");
  }

  if (email && !isValidEmail(email)) {
    redirect("/businesses/new?error=email-invalid");
  }

  const services = (
    getOptionalString(formData, "services")
      ?.split(",")
      .map((service) => service.trim())
      .filter(Boolean) ?? []
  );

  if (
    services.length > 20 ||
    services.some((service) => service.length > 100)
  ) {
    redirect("/businesses/new?error=services-invalid");
  }

  const businessValues = {
    owner_id: user.id,
    name,
    category,
    short_description: shortDescription,
    description,
    services,
    website_url: websiteUrl,
    email,
    phone: getOptionalString(formData, "phone"),
    address_line: getOptionalString(formData, "address_line"),
    city: getOptionalString(formData, "city"),
    province_state: getOptionalString(formData, "province_state"),
    country: getOptionalString(formData, "country"),
    is_hiring: formData.get("is_hiring") === "on",
    status: "draft" as const,
    updated_at: new Date().toISOString(),
  };

  const baseSlug = createSlug(name) || "business";

  for (let suffix = 1; suffix <= 50; suffix += 1) {
    const slug = suffix === 1 ? baseSlug : `${baseSlug}-${suffix}`;
    const { error } = await supabase.from("businesses").insert({
      ...businessValues,
      slug,
    });

    if (!error) {
      redirect(`/businesses/${slug}`);
    }

    if (error.code !== "23505") {
      redirect("/businesses/new?error=create-failed");
    }
  }

  redirect("/businesses/new?error=slug-exhausted");
}

export async function updateBusiness(formData: FormData) {
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
  const category = getOptionalString(formData, "category");

  if (!slug) {
    redirect("/businesses");
  }

  const errorPath = `/businesses/${slug}/edit?error=`;

  if (!name || name.length < 2 || name.length > 120) {
    redirect(`${errorPath}name-invalid`);
  }

  if (!category || category.length > 120) {
    redirect(`${errorPath}category-invalid`);
  }

  const shortDescription = getOptionalString(
    formData,
    "short_description",
  );

  if (shortDescription && shortDescription.length > 200) {
    redirect(`${errorPath}short-description-too-long`);
  }

  const websiteUrl = getOptionalString(formData, "website_url");
  const email = getOptionalString(formData, "email");

  if (websiteUrl && !isValidHttpUrl(websiteUrl)) {
    redirect(`${errorPath}url-invalid`);
  }

  if (email && !isValidEmail(email)) {
    redirect(`${errorPath}email-invalid`);
  }

  const services =
    getOptionalString(formData, "services")
      ?.split(",")
      .map((service) => service.trim())
      .filter(Boolean) ?? [];

  if (
    services.length > 20 ||
    services.some((service) => service.length > 100)
  ) {
    redirect(`${errorPath}services-invalid`);
  }

  const { data: updatedBusiness, error } = await supabase
    .from("businesses")
    .update({
      name,
      category,
      short_description: shortDescription,
      description: getOptionalString(formData, "description"),
      services,
      website_url: websiteUrl,
      email,
      phone: getOptionalString(formData, "phone"),
      address_line: getOptionalString(formData, "address_line"),
      city: getOptionalString(formData, "city"),
      province_state: getOptionalString(formData, "province_state"),
      country: getOptionalString(formData, "country"),
      is_hiring: formData.get("is_hiring") === "on",
      status: "draft",
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .select("slug")
    .maybeSingle();

  if (error) {
    redirect(`${errorPath}update-failed`);
  }

  if (!updatedBusiness) {
    redirect("/businesses");
  }

  redirect(`/businesses/${updatedBusiness.slug}`);
}


export async function setBusinessVerification(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const businessId = getOptionalString(formData, "business_id");
  const slug = getOptionalString(formData, "slug");
  const verified = formData.get("verified") === "true";

  if (!businessId || !slug) {
    redirect("/businesses");
  }

  const { data: accessContext } = await getMyAccessContext(supabase, user.id);

  if (accessContext?.role !== "admin") {
    redirect("/");
  }

  const { data: business, error } = await supabase
    .from("businesses")
    .update({ is_verified: verified })
    .eq("id", businessId)
    .eq("slug", slug)
    .eq("status", "published")
    .select("slug")
    .maybeSingle();

  if (error || !business) {
    redirect(`/businesses/${slug}?error=verification-failed`);
  }

  revalidatePath("/businesses");
  revalidatePath(`/businesses/${slug}`);
  revalidatePath("/search");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/explore", "layout");
  redirect(`/businesses/${slug}`);
}
