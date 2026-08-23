"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function revalidateDashboardLayout() {
  revalidatePath("/(dashboard)", "layout");
}

export async function markNotificationRead(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const notificationId = formData.get("notification_id");

  if (
    typeof notificationId !== "string" ||
    !uuidPattern.test(notificationId)
  ) {
    redirect("/");
  }

  const { data: notification, error: notificationError } =
    await supabase
      .from("notifications")
      .select("id, type, conversation_id, content_type, content_slug")
      .eq("id", notificationId)
      .eq("recipient_id", user.id)
      .maybeSingle();

  if (notificationError) {
    throw new Error("Unable to load the notification.");
  }

  if (!notification) {
    redirect("/");
  }

  let destination = "/";

  if (notification.type === "new_message" && notification.conversation_id) {
    destination = `/messages/${notification.conversation_id}`;
  } else if (
    notification.type === "connection_request" ||
    notification.type === "connection_accepted"
  ) {
    destination = "/network";
  } else if (
    (notification.type === "content_approved" ||
      notification.type === "content_rejected") &&
    notification.content_slug
  ) {
    destination =
      notification.content_type === "event"
        ? `/events/${notification.content_slug}`
        : `/opportunities/${notification.content_slug}`;
  }

  const { error } = await supabase.rpc("mark_notification_read", {
    target_notification_id: notification.id,
  });

  if (error) {
    throw new Error("Unable to mark the notification as read.");
  }

  revalidateDashboardLayout();
  redirect(destination);
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { error } = await supabase.rpc(
    "mark_all_notifications_read",
  );

  if (error) {
    throw new Error("Unable to mark notifications as read.");
  }

  revalidateDashboardLayout();
}
