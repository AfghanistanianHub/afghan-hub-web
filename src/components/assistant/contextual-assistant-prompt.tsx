"use client";

import { Sparkles } from "lucide-react";

export const ASSISTANT_OPEN_EVENT = "afghan-hub:assistant-open";

type ContextualAssistantPromptProps = {
  label: string;
  query: string;
  className?: string;
};

export function ContextualAssistantPrompt({
  label,
  query,
  className,
}: ContextualAssistantPromptProps) {
  function openAssistant() {
    window.dispatchEvent(
      new CustomEvent(ASSISTANT_OPEN_EVENT, {
        detail: { query },
      }),
    );
  }

  return (
    <button
      type="button"
      onClick={openAssistant}
      className={
        className ??
        "inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.055] px-3.5 py-2 text-sm font-semibold text-primary transition hover:border-primary/35 hover:bg-primary/[0.085] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary"
      }
    >
      <Sparkles aria-hidden="true" className="size-3.5" />
      {label}
    </button>
  );
}
