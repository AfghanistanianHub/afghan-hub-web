"use client";

import styles from "@/components/network/network-surfaces.module.css";

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

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const [state, formAction, isPending] = useActionState(sendMessage, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state.sentAt) {
      formRef.current?.reset();
      textareaRef.current?.focus();
    }
  }, [state.sentAt]);

  return (
    <form ref={formRef} action={formAction} className="border-t border-border/80 bg-card p-3 sm:p-4">
      <input type="hidden" name="conversation_id" value={conversationId} />

      <div className="flex items-end gap-2 sm:gap-3">
        <textarea
          ref={textareaRef}
          name="message"
          aria-label="Message"
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
          className={`${styles.search} min-h-12 min-w-0 flex-1 resize-none border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground disabled:cursor-wait disabled:opacity-70`}
        />

        <button
          type="submit"
          disabled={isPending}
          aria-label={isPending ? "Sending message" : "Send message"}
          className={`flex size-12 shrink-0 items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60 ${styles.control}`}
        >
          {isPending ? (
            <span aria-hidden="true" className="size-5 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground motion-reduce:animate-none" />
          ) : (
            <Send aria-hidden="true" className="size-5" />
          )}
        </button>
      </div>

      <div className="mt-2 flex flex-col items-start gap-1.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {state.error ? (
          <p id="message-error" role="alert" aria-live="assertive" className="rounded-sm border border-destructive/20 bg-destructive/[0.05] px-2.5 py-1.5 text-destructive">
            {state.error}
          </p>
        ) : (
          <p className="text-muted-foreground">Enter to send · Shift+Enter for a new line</p>
        )}
        <span className="text-muted-foreground sm:ml-auto">Maximum 4,000 characters</span>
      </div>
    </form>
  );
}
