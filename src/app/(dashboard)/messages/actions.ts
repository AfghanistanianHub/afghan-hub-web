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

  const { data: connection } = await supabase
    .from("connections")
    .select("id")
    .eq("status", "accepted")
    .or(
      `and(requester_id.eq.${user.id},recipient_id.eq.${memberId}),and(requester_id.eq.${memberId},recipient_id.eq.${user.id})`,
    )
    .limit(1)
    .maybeSingle();

  if (!connection) {
    redirect(`/members/${memberId}`);
  }

  const { data: myMemberships } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("profile_id", user.id);

  const conversationIds = [
    ...new Set(
      (myMemberships ?? []).map(
        (membership) => membership.conversation_id,
      ),
    ),
  ];

  if (conversationIds.length > 0) {
    const { data: membershipRows } = await supabase
      .from("conversation_members")
      .select("conversation_id, profile_id")
      .in("conversation_id", conversationIds);

    const membersByConversation = new Map<string, string[]>();

    for (const membership of membershipRows ?? []) {
      const members =
        membersByConversation.get(membership.conversation_id) ?? [];

      members.push(membership.profile_id);
      membersByConversation.set(membership.conversation_id, members);
    }

    const existingConversationId = conversationIds.find(
      (conversationId) => {
        const members =
          membersByConversation.get(conversationId) ?? [];

        return (
          members.length === 2 &&
          members.includes(user.id) &&
          members.includes(memberId)
        );
      },
    );

    if (existingConversationId) {
      redirect(`/messages/${existingConversationId}`);
    }
  }

  const conversationId = crypto.randomUUID();

  const { error: conversationError } = await supabase
    .from("conversations")
    .insert({
      id: conversationId,
      created_by: user.id,
    });

  if (conversationError) {
    throw new Error("Unable to start the conversation.");
  }

  const { error: creatorMemberError } = await supabase
    .from("conversation_members")
    .insert({
      conversation_id: conversationId,
      profile_id: user.id,
    });

  if (creatorMemberError) {
    throw new Error("Unable to add the conversation creator.");
  }

  const { error: otherMemberError } = await supabase
    .from("conversation_members")
    .insert({
      conversation_id: conversationId,
      profile_id: memberId,
    });

  if (otherMemberError) {
    throw new Error("Unable to add the conversation member.");
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

  const { data: membership } = await supabase
    .from("conversation_members")
    .select("last_read_at")
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!membership) {
    return;
  }

  const { data: latestMessage } = await supabase
    .from("messages")
    .select("created_at")
    .eq("conversation_id", conversationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (
    !latestMessage ||
    (membership.last_read_at &&
      new Date(membership.last_read_at).getTime() >=
        new Date(latestMessage.created_at).getTime())
  ) {
    return;
  }

  const { error } = await supabase
    .from("conversation_members")
    .update({ last_read_at: latestMessage.created_at })
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id);

  if (error) {
    throw new Error("Unable to mark the conversation as read.");
  }

  revalidatePath("/", "layout");
}

