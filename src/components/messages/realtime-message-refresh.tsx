"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type RealtimeMessageRefreshProps = {
  conversationId?: string;
};

export function RealtimeMessageRefresh({
  conversationId,
}: RealtimeMessageRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(
        conversationId
          ? `messages:${conversationId}`
          : "messages:inbox",
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
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, router]);

  return null;
}
