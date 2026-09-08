"use client";

import { Trash2 } from "lucide-react";

import { deleteOpportunity } from "@/app/(dashboard)/opportunities/actions";

type DeleteOpportunityButtonProps = {
  slug: string;
};

export function DeleteOpportunityButton({
  slug,
}: DeleteOpportunityButtonProps) {
  return (
    <form
      action={deleteOpportunity}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Are you sure you want to delete this opportunity? This action cannot be undone.",
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
