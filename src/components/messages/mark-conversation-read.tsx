"use client";

import { startTransition, useEffect } from "react";

import { markConversationRead } from "@/app/(dashboard)/messages/actions";

type MarkConversationReadProps = {
  conversationId: string;
};

export function MarkConversationRead({
  conversationId,
}: MarkConversationReadProps) {
  useEffect(() => {
    startTransition(() => {
      void markConversationRead(conversationId);
    });
  }, [conversationId]);

  return null;
}
