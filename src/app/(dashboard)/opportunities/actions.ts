"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const opportunityTypes = [
  "job",
  "volunteer",
  "scholarship",
  "mentorship",
  "investment",
  "housing",
  "event",
  "education",
] as const;

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

export async function createOpportunity(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const title = getOptionalString(formData, "title");
  const summary = getOptionalString(formData, "summary");
  const description = getOptionalString(formData, "description");
  const type = getOptionalString(formData, "type");

  if (!title) {
    redirect("/opportunities/new?error=Title%20is%20required");
  }

  if (!summary) {
    redirect("/opportunities/new?error=Summary%20is%20required");
  }

  if (!description) {
    redirect("/opportunities/new?error=Description%20is%20required");
  }

  if (
    !type ||
    !opportunityTypes.includes(
      type as (typeof opportunityTypes)[number],
    )
  ) {
    redirect("/opportunities/new?error=Invalid%20opportunity%20type");
  }

  const organizationId = getOptionalString(
    formData,
    "organization_id",
  );

  if (organizationId) {
    const { data: organization, error: organizationError } =
      await supabase
        .from("organizations")
        .select("id")
        .eq("id", organizationId)
        .eq("owner_id", user.id)
        .maybeSingle();

    if (organizationError || !organization) {
      redirect(
        "/opportunities/new?error=Invalid%20organization",
      );
    }
  }

  const deadlineValue = getOptionalString(formData, "deadline");
  let deadline: string | null = null;

  if (deadlineValue) {
    const parsedDeadline = new Date(deadlineValue);

    if (Number.isNaN(parsedDeadline.getTime())) {
      redirect("/opportunities/new?error=Invalid%20deadline");
    }

    deadline = parsedDeadline.toISOString();
  }

  const baseSlug = createSlug(title) || "opportunity";
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const { data: existingOpportunity } = await supabase
      .from("opportunities")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!existingOpportunity) {
      break;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const { error } = await supabase.from("opportunities").insert({
    author_id: user.id,
    organization_id: organizationId,
    title,
    slug,
    summary,
    description,
    type,
    city: getOptionalString(formData, "city"),
    province_state: getOptionalString(formData, "province_state"),
    country: getOptionalString(formData, "country"),
    is_remote: formData.get("is_remote") === "on",
    external_url: getOptionalString(formData, "external_url"),
    contact_email: getOptionalString(formData, "contact_email"),
    deadline,
    status: "draft",
    updated_at: new Date().toISOString(),
  });

  if (error) {
    redirect(
      `/opportunities/new?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(`/opportunities/${slug}`);
}

export async function updateOpportunity(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const originalSlug = getOptionalString(formData, "original_slug");
  const title = getOptionalString(formData, "title");
  const summary = getOptionalString(formData, "summary");
  const description = getOptionalString(formData, "description");
  const type = getOptionalString(formData, "type");

  if (!originalSlug) {
    redirect("/opportunities?error=Missing%20opportunity");
  }

  if (!title || !summary || !description) {
    redirect(
      `/opportunities/${originalSlug}/edit?error=Please%20complete%20all%20required%20fields`,
    );
  }

  if (
    !type ||
    !opportunityTypes.includes(
      type as (typeof opportunityTypes)[number],
    )
  ) {
    redirect(
      `/opportunities/${originalSlug}/edit?error=Invalid%20opportunity%20type`,
    );
  }

  const { data: existingOpportunity } = await supabase
    .from("opportunities")
    .select("id, author_id")
    .eq("slug", originalSlug)
    .eq("author_id", user.id)
    .maybeSingle();

  if (!existingOpportunity) {
    redirect("/opportunities?error=Opportunity%20not%20found");
  }

  const organizationId = getOptionalString(
    formData,
    "organization_id",
  );

  if (organizationId) {
    const { data: organization } = await supabase
      .from("organizations")
      .select("id")
      .eq("id", organizationId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!organization) {
      redirect(
        `/opportunities/${originalSlug}/edit?error=Invalid%20organization`,
      );
    }
  }

  const deadlineValue = getOptionalString(formData, "deadline");
  let deadline: string | null = null;

  if (deadlineValue) {
    const parsedDeadline = new Date(`${deadlineValue}T12:00:00`);

    if (Number.isNaN(parsedDeadline.getTime())) {
      redirect(
        `/opportunities/${originalSlug}/edit?error=Invalid%20deadline`,
      );
    }

    deadline = parsedDeadline.toISOString();
  }

  const { error } = await supabase
    .from("opportunities")
    .update({
      title,
      summary,
      description,
      type,
      organization_id: organizationId,
      city: getOptionalString(formData, "city"),
      province_state: getOptionalString(formData, "province_state"),
      country: getOptionalString(formData, "country"),
      is_remote: formData.get("is_remote") === "on",
      external_url: getOptionalString(formData, "external_url"),
      contact_email: getOptionalString(formData, "contact_email"),
      deadline,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existingOpportunity.id)
    .eq("author_id", user.id);

  if (error) {
    redirect(
      `/opportunities/${originalSlug}/edit?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  redirect(`/opportunities/${originalSlug}`);
}

export async function deleteOpportunity(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const slug = getOptionalString(formData, "slug");

  if (!slug) {
    redirect("/opportunities?error=Missing%20opportunity");
  }

  const { data: opportunity } = await supabase
    .from("opportunities")
    .select("id")
    .eq("slug", slug)
    .eq("author_id", user.id)
    .maybeSingle();

  if (!opportunity) {
    redirect(
      `/opportunities/${slug}?error=You%20cannot%20delete%20this%20opportunity`,
    );
  }

  const { error } = await supabase
    .from("opportunities")
    .delete()
    .eq("id", opportunity.id)
    .eq("author_id", user.id);

  if (error) {
    redirect(
      `/opportunities/${slug}?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect("/opportunities");
}
