"use client";

import { useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";

import {
  sendMessage,
  type SendMessageState,
} from "@/app/(dashboard)/messages/actions";

type MessageComposerProps = {
  conversationId: string;
};

const initialState: SendMessageState = {
  error: null,
  sentAt: null,
};

export function MessageComposer({
  conversationId,
}: MessageComposerProps) {
  const [state, formAction, isPending] = useActionState(
    sendMessage,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state.sentAt) {
      formRef.current?.reset();
      textareaRef.current?.focus();
    }
  }, [state.sentAt]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="border-t border-slate-800 bg-slate-950/60 p-4"
    >
      <input
        type="hidden"
        name="conversation_id"
        value={conversationId}
      />

      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          name="message"
          required
          maxLength={4000}
          rows={1}
          disabled={isPending}
          aria-describedby={state.error ? "message-error" : undefined}
          placeholder="Write a message..."
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing &&
              !isPending
            ) {
              event.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
          className="min-h-12 flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500 disabled:cursor-wait disabled:opacity-70"
        />

        <button
          type="submit"
          disabled={isPending}
          aria-label={isPending ? "Sending message" : "Send message"}
          className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-500 disabled:cursor-wait disabled:opacity-60"
        >
          {isPending ? (
            <span className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <Send className="size-5" />
          )}
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-4 text-xs">
        {state.error ? (
          <p id="message-error" role="alert" className="text-red-300">
            {state.error}
          </p>
        ) : (
          <p className="text-slate-600">Enter to send · Shift+Enter for a new line</p>
        )}
        <span className="ml-auto text-slate-600">Maximum 4,000 characters</span>
      </div>
    </form>
  );
}
