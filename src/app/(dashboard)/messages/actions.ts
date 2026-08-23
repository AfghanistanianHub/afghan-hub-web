"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function startConversation(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const memberId = formData.get("member_id");

  if (
    typeof memberId !== "string" ||
    !memberId ||
    memberId === user.id
  ) {
    redirect("/network");
  }

  const { data: conversationId, error } = await supabase.rpc(
    "start_direct_conversation",
    { target_member_id: memberId },
  );

  if (error || !conversationId) {
    redirect(`/members/${memberId}?error=Unable%20to%20start%20conversation`);
  }

  revalidatePath("/messages");
  redirect(`/messages/${conversationId}`);
}

export async function sendMessage(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const conversationId = formData.get("conversation_id");
  const messageValue = formData.get("message");

  if (
    typeof conversationId !== "string" ||
    !conversationId ||
    typeof messageValue !== "string"
  ) {
    redirect("/messages");
  }

  const message = messageValue.trim();

  if (!message || message.length > 4000) {
    redirect(`/messages/${conversationId}`);
  }

  const { data: membership } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!membership) {
    redirect("/messages");
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: message,
  });

  if (error) {
    throw new Error("Unable to send the message.");
  }

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
}

export async function markConversationRead(conversationId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !conversationId) {
    return;
  }

  const { data: updated, error } = await supabase.rpc(
    "mark_conversation_read",
    { target_conversation_id: conversationId },
  );

  if (error) {
    throw new Error("Unable to mark the conversation as read.");
  }

  if (!updated) {
    return;
  }

  revalidatePath("/", "layout");
}
