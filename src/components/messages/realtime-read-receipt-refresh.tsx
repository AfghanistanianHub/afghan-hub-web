"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { subscribeMemberChannel } from "@/lib/supabase/member-realtime";

type RealtimeReadReceiptRefreshProps = {
  conversationId: string;
};

export function RealtimeReadReceiptRefresh({
  conversationId,
}: RealtimeReadReceiptRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`read-receipts:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversation_members",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          router.refresh();
        },
      )
      .on("system", {}, (payload) => {
        // A joined socket can precede PostgreSQL readiness. Refetch once the
        // stream is ready, including after rejoining, to recover missed changes.
        if (payload.extension === "postgres_changes" && payload.status === "ok") {
          router.refresh();
        }
      });

    return subscribeMemberChannel(supabase, channel);
  }, [conversationId, router]);

  return null;
}
