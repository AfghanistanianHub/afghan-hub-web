"use client";

import { startTransition, useEffect } from "react";

import { markConversationRead } from "@/app/(dashboard)/messages/actions";

type MarkConversationReadProps = {
  conversationId: string;
  readThroughMessageId: string;
};

export function MarkConversationRead({
  conversationId,
  readThroughMessageId,
}: MarkConversationReadProps) {
  useEffect(() => {
    const markReadWhenVisible = () => {
      if (document.visibilityState !== "visible" || !document.hasFocus()) {
        return;
      }

      startTransition(() => {
        void markConversationRead(conversationId, readThroughMessageId);
      });
    };

    markReadWhenVisible();
    document.addEventListener("visibilitychange", markReadWhenVisible);
    window.addEventListener("focus", markReadWhenVisible);

    return () => {
      document.removeEventListener("visibilitychange", markReadWhenVisible);
      window.removeEventListener("focus", markReadWhenVisible);
    };
  }, [conversationId, readThroughMessageId]);

  return null;
}
