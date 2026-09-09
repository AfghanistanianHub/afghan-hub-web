"use client";

import { Trash2 } from "lucide-react";

import { deleteEvent } from "@/app/(dashboard)/events/actions";

type DeleteEventButtonProps = {
  slug: string;
};

export function DeleteEventButton({ slug }: DeleteEventButtonProps) {
  return (
    <form
      action={deleteEvent}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Are you sure you want to delete this event? This action cannot be undone.",
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="slug" value={slug} />

      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-xl border border-destructive/25 bg-destructive/[0.04] px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/[0.08]"
      >
        <Trash2 className="size-4" />
        Delete
      </button>
    </form>
  );
}
