"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type SendMessageState = {
  error: string | null;
  sentAt: number | null;
};

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

export async function sendMessage(
  _previousState: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
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
    !uuidPattern.test(conversationId) ||
    typeof messageValue !== "string"
  ) {
    return {
      error: "Unable to identify this conversation.",
      sentAt: null,
    };
  }

  const message = messageValue.trim();

  if (!message || message.length > 4000) {
    return {
      error: "Enter a message between 1 and 4,000 characters.",
      sentAt: null,
    };
  }

  const { data: membership } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!membership) {
    return {
      error: "You no longer have access to this conversation.",
      sentAt: null,
    };
  }

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: message,
  });

  if (error) {
    return {
      error: "Your message could not be sent. Please try again.",
      sentAt: null,
    };
  }

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
  return { error: null, sentAt: Date.now() };
}

export async function markConversationRead(
  conversationId: string,
  readThroughMessageId: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user ||
    !uuidPattern.test(conversationId) ||
    !uuidPattern.test(readThroughMessageId)
  ) {
    return;
  }

  const { data: updated, error } = await supabase.rpc(
    "mark_conversation_read",
    {
      target_conversation_id: conversationId,
      read_through_message_id: readThroughMessageId,
    },
  );

  if (error) {
    throw new Error("Unable to mark the conversation as read.");
  }

  if (!updated) {
    return;
  }

  revalidatePath("/", "layout");
}
