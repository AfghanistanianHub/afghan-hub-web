"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function sendConnectionRequest(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const recipientId = formData.get("recipient_id");

  if (
    typeof recipientId !== "string" ||
    !recipientId ||
    recipientId === user.id
  ) {
    redirect("/network");
  }

  const { data: connectionId, error } = await supabase.rpc(
    "send_connection_request",
    { target_recipient_id: recipientId },
  );

  if (error || !connectionId) {
    throw new Error("Unable to send connection request.");
  }

  revalidatePath(`/members/${recipientId}`);
  revalidatePath("/network");
}


export async function respondConnectionRequest(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const connectionId = formData.get("connection_id");
  const decision = formData.get("decision");

  if (
    typeof connectionId !== "string" ||
    (decision !== "accepted" && decision !== "declined")
  ) {
    redirect("/network");
  }

  const { data: connection } = await supabase
    .from("connections")
    .select("id, requester_id")
    .eq("id", connectionId)
    .eq("recipient_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (!connection) {
    redirect("/network");
  }

  const { data: responseApplied, error } = await supabase.rpc(
    "respond_connection_request",
    {
      target_connection_id: connection.id,
      target_decision: decision,
    },
  );

  if (error || !responseApplied) {
    throw new Error("Unable to update connection request.");
  }

  const { data: requestNotification } = await supabase
    .from("notifications")
    .select("id")
    .eq("recipient_id", user.id)
    .eq("type", "connection_request")
    .eq("connection_id", connection.id)
    .is("read_at", null)
    .limit(1)
    .maybeSingle();

  if (requestNotification) {
    await supabase.rpc("mark_notification_read", {
      target_notification_id: requestNotification.id,
    });
  }

  revalidatePath("/(dashboard)", "layout");
  revalidatePath("/network");
  revalidatePath("/members/" + connection.requester_id);
}


export async function removeConnection(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const connectionId = formData.get("connection_id");

  if (typeof connectionId !== "string" || !connectionId) {
    redirect("/network");
  }

  const { data: connection } = await supabase
    .from("connections")
    .select("id, requester_id, recipient_id")
    .eq("id", connectionId)
    .or(
      "requester_id.eq." + user.id +
        ",recipient_id.eq." + user.id,
    )
    .maybeSingle();

  if (!connection) {
    redirect("/network");
  }

  const { error } = await supabase
    .from("connections")
    .delete()
    .eq("id", connection.id);

  if (error) {
    throw new Error("Unable to remove connection.");
  }

  const otherMemberId =
    connection.requester_id === user.id
      ? connection.recipient_id
      : connection.requester_id;

  revalidatePath("/network");
  revalidatePath("/members/" + otherMemberId);
}
