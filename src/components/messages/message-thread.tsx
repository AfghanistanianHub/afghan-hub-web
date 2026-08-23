"use client";

import { useEffect, useRef } from "react";

type MessageThreadProps = {
  children: React.ReactNode;
  latestMessageId: string | null;
  scrollToLatest: boolean;
};

export function MessageThread({
  children,
  latestMessageId,
  scrollToLatest,
}: MessageThreadProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!scrollToLatest) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const container = containerRef.current;

      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [latestMessageId, scrollToLatest]);

  return (
    <section
      ref={containerRef}
      className="flex-1 space-y-4 overflow-y-auto px-5 py-6"
    >
      {children}
    </section>
  );
}
