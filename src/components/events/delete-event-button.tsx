"use client";

import { deleteEvent } from "@/app/(dashboard)/events/actions";

type DeleteEventButtonProps = {
  slug: string;
};

export function DeleteEventButton({
  slug,
}: DeleteEventButtonProps) {
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
        className="rounded-lg border border-red-800 px-4 py-2 font-semibold text-red-400 hover:bg-red-950/50"
      >
        Delete
      </button>
    </form>
  );
}
