"use server";

import { revalidatePath } from "next/cache";
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

function parseDateTime(value: string | null) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toISOString();
}

export async function createEvent(formData: FormData) {
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
  const startsAtValue = getOptionalString(formData, "starts_at");

  if (!title) {
    redirect("/events/new?error=Title%20is%20required");
  }

  if (!summary) {
    redirect("/events/new?error=Summary%20is%20required");
  }

  if (!description) {
    redirect("/events/new?error=Description%20is%20required");
  }

  const startsAt = parseDateTime(startsAtValue);

  if (!startsAt) {
    redirect("/events/new?error=Valid%20start%20date%20is%20required");
  }

  const endsAtValue = getOptionalString(formData, "ends_at");
  const endsAt = parseDateTime(endsAtValue);

  if (endsAtValue && !endsAt) {
    redirect("/events/new?error=Invalid%20end%20date");
  }

  if (endsAt && new Date(endsAt) < new Date(startsAt)) {
    redirect(
      "/events/new?error=End%20date%20cannot%20be%20before%20start%20date",
    );
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
      redirect("/events/new?error=Invalid%20organization");
    }
  }

  const capacityValue = getOptionalString(formData, "capacity");
  let capacity: number | null = null;

  if (capacityValue) {
    capacity = Number.parseInt(capacityValue, 10);

    if (!Number.isInteger(capacity) || capacity < 1) {
      redirect("/events/new?error=Invalid%20capacity");
    }
  }

  const baseSlug = createSlug(title) || "event";
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const { data: existingEvent } = await supabase
      .from("events")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!existingEvent) {
      break;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const { error } = await supabase.from("events").insert({
    creator_id: user.id,
    organization_id: organizationId,
    title,
    slug,
    summary,
    description,
    starts_at: startsAt,
    ends_at: endsAt,
    venue_name: getOptionalString(formData, "venue_name"),
    address_line: getOptionalString(formData, "address_line"),
    city: getOptionalString(formData, "city"),
    province_state: getOptionalString(formData, "province_state"),
    country: getOptionalString(formData, "country"),
    is_online: formData.get("is_online") === "on",
    online_url: getOptionalString(formData, "online_url"),
    capacity,
    status: "draft",
    updated_at: new Date().toISOString(),
  });

  if (error) {
    redirect(`/events/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/events/${slug}`);
}

export async function updateEvent(formData: FormData) {
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
  const startsAtValue = getOptionalString(formData, "starts_at");

  if (!originalSlug) {
    redirect("/events?error=Missing%20event");
  }

  if (!title || !summary || !description) {
    redirect(
      `/events/${originalSlug}/edit?error=Please%20complete%20all%20required%20fields`,
    );
  }

  const startsAt = parseDateTime(startsAtValue);

  if (!startsAt) {
    redirect(
      `/events/${originalSlug}/edit?error=Valid%20start%20date%20is%20required`,
    );
  }

  const endsAtValue = getOptionalString(formData, "ends_at");
  const endsAt = parseDateTime(endsAtValue);

  if (endsAtValue && !endsAt) {
    redirect(`/events/${originalSlug}/edit?error=Invalid%20end%20date`);
  }

  if (endsAt && new Date(endsAt) < new Date(startsAt)) {
    redirect(
      `/events/${originalSlug}/edit?error=End%20date%20cannot%20be%20before%20start%20date`,
    );
  }

  const { data: existingEvent } = await supabase
    .from("events")
    .select("id")
    .eq("slug", originalSlug)
    .eq("creator_id", user.id)
    .maybeSingle();

  if (!existingEvent) {
    redirect("/events?error=Event%20not%20found");
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
        `/events/${originalSlug}/edit?error=Invalid%20organization`,
      );
    }
  }

  const capacityValue = getOptionalString(formData, "capacity");
  let capacity: number | null = null;

  if (capacityValue) {
    capacity = Number.parseInt(capacityValue, 10);

    if (!Number.isInteger(capacity) || capacity < 1) {
      redirect(
        `/events/${originalSlug}/edit?error=Invalid%20capacity`,
      );
    }
  }

  const { error } = await supabase
    .from("events")
    .update({
      organization_id: organizationId,
      title,
      summary,
      description,
      starts_at: startsAt,
      ends_at: endsAt,
      venue_name: getOptionalString(formData, "venue_name"),
      address_line: getOptionalString(formData, "address_line"),
      city: getOptionalString(formData, "city"),
      province_state: getOptionalString(formData, "province_state"),
      country: getOptionalString(formData, "country"),
      is_online: formData.get("is_online") === "on",
      online_url: getOptionalString(formData, "online_url"),
      capacity,
      status: "draft",
      updated_at: new Date().toISOString(),
    })
    .eq("id", existingEvent.id)
    .eq("creator_id", user.id);

  if (error) {
    redirect(
      `/events/${originalSlug}/edit?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  redirect(`/events/${originalSlug}`);
}

export async function deleteEvent(formData: FormData) {
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
    redirect("/events?error=Missing%20event");
  }

  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("slug", slug)
    .eq("creator_id", user.id)
    .maybeSingle();

  if (!event) {
    redirect(
      `/events/${slug}?error=You%20cannot%20delete%20this%20event`,
    );
  }

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", event.id)
    .eq("creator_id", user.id);

  if (error) {
    redirect(
      `/events/${slug}?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect("/events");
}


export async function rsvpEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const eventId = getOptionalString(formData, "event_id");
  const slug = getOptionalString(formData, "slug");

  if (!eventId || !slug) {
    redirect("/events");
  }

  const { error } = await supabase.rpc("rsvp_to_event", {
    target_event_id: eventId,
  });

  if (error) {
    const result =
      error.message.includes("event_full")
        ? "full"
        : error.message.includes("event_has_started")
          ? "started"
          : "error";

    redirect(`/events/${slug}?rsvp=${result}`);
  }

  revalidatePath(`/events/${slug}`);
  redirect(`/events/${slug}?rsvp=joined`);
}

export async function cancelEventRsvp(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const eventId = getOptionalString(formData, "event_id");
  const slug = getOptionalString(formData, "slug");

  if (!eventId || !slug) {
    redirect("/events");
  }

  const { error } = await supabase
    .from("event_rsvps")
    .delete()
    .eq("event_id", eventId)
    .eq("profile_id", user.id);

  if (error) {
    redirect(`/events/${slug}?rsvp=error`);
  }

  revalidatePath(`/events/${slug}`);
  redirect(`/events/${slug}?rsvp=cancelled`);
}
