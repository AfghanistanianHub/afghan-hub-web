"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type RealtimeMessageRefreshProps = {
  currentUserId: string;
  conversationId?: string;
};

export function RealtimeMessageRefresh({
  currentUserId,
  conversationId,
}: RealtimeMessageRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(
        conversationId
          ? `messages:${conversationId}`
          : `messages:inbox:${currentUserId}`,
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          ...(conversationId
            ? { filter: `conversation_id=eq.${conversationId}` }
            : {}),
        },
        () => {
          router.refresh();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversation_members",
          filter: `profile_id=eq.${currentUserId}`,
        },
        () => {
          router.refresh();
        },
      )
      .subscribe((status) => {
        // Recover changes missed before joining or while disconnected.
        if (status === "SUBSCRIBED") {
          router.refresh();
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId, router]);

  return null;
}
