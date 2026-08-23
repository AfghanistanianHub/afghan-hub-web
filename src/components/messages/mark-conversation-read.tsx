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
    const markReadWhenVisible = () => {
      if (document.visibilityState !== "visible" || !document.hasFocus()) {
        return;
      }

      startTransition(() => {
        void markConversationRead(conversationId);
      });
    };

    markReadWhenVisible();
    document.addEventListener("visibilitychange", markReadWhenVisible);
    window.addEventListener("focus", markReadWhenVisible);

    return () => {
      document.removeEventListener("visibilitychange", markReadWhenVisible);
      window.removeEventListener("focus", markReadWhenVisible);
    };
  }, [conversationId]);

  return null;
}
