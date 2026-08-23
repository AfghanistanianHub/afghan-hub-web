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

function isValidWebsiteUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
    redirect("/businesses/new?error=Business%20name%20must%20be%202%E2%80%93120%20characters");
  }

  if (!category || category.length > 120) {
    redirect("/businesses/new?error=A%20valid%20business%20category%20is%20required");
  }

  const shortDescription = getOptionalString(
    formData,
    "short_description",
  );

  if (shortDescription && shortDescription.length > 200) {
    redirect("/businesses/new?error=Short%20description%20must%20be%20200%20characters%20or%20fewer");
  }

  const description = getOptionalString(formData, "description");
  const websiteUrl = getOptionalString(formData, "website_url");
  const email = getOptionalString(formData, "email");

  if (websiteUrl && !isValidWebsiteUrl(websiteUrl)) {
    redirect("/businesses/new?error=Enter%20a%20valid%20website%20URL");
  }

  if (email && !isValidEmail(email)) {
    redirect("/businesses/new?error=Enter%20a%20valid%20email%20address");
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
    redirect("/businesses/new?error=Add%20up%20to%2020%20services%20with%20100%20characters%20each");
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
    status: "published" as const,
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
      redirect(
        `/businesses/new?error=${encodeURIComponent(error.message)}`,
      );
    }
  }

  redirect("/businesses/new?error=Unable%20to%20create%20a%20unique%20business%20URL");
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
    redirect(
      `${errorPath}Business%20name%20must%20be%202%E2%80%93120%20characters`,
    );
  }

  if (!category || category.length > 120) {
    redirect(
      `${errorPath}A%20valid%20business%20category%20is%20required`,
    );
  }

  const shortDescription = getOptionalString(
    formData,
    "short_description",
  );

  if (shortDescription && shortDescription.length > 200) {
    redirect(
      `${errorPath}Short%20description%20must%20be%20200%20characters%20or%20fewer`,
    );
  }

  const websiteUrl = getOptionalString(formData, "website_url");
  const email = getOptionalString(formData, "email");

  if (websiteUrl && !isValidWebsiteUrl(websiteUrl)) {
    redirect(`${errorPath}Enter%20a%20valid%20website%20URL`);
  }

  if (email && !isValidEmail(email)) {
    redirect(`${errorPath}Enter%20a%20valid%20email%20address`);
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
    redirect(
      `${errorPath}Add%20up%20to%2020%20services%20with%20100%20characters%20each`,
    );
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
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .select("slug")
    .maybeSingle();

  if (error) {
    redirect(`${errorPath}${encodeURIComponent(error.message)}`);
  }

  if (!updatedBusiness) {
    redirect("/businesses");
  }

  redirect(`/businesses/${updatedBusiness.slug}`);
}
