"use client";

import { Trash2 } from "lucide-react";
import { PendingSubmitButton } from "@/components/forms/pending-submit-button";

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

      <PendingSubmitButton
        pendingLabel="Deleting…"
        className="inline-flex min-h-11 min-w-28 items-center justify-center gap-2 rounded-[var(--radius)] border border-destructive/25 bg-destructive/[0.04] px-4 py-2 text-sm font-semibold text-destructive transition-colors motion-reduce:transition-none active:bg-destructive/15 hover:bg-destructive/[0.08] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-destructive"
      >
        <span className="inline-flex items-center gap-2">
          <Trash2 aria-hidden="true" className="size-4" />
          Delete
        </span>
      </PendingSubmitButton>
    </form>
  );
}
