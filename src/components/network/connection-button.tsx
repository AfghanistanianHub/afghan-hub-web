"use client";

import Link from "next/link";
import { startConversation } from "@/app/(dashboard)/messages/actions";
import {
  removeConnection,
  sendConnectionRequest,
} from "@/app/(dashboard)/network/actions";

type ConnectionButtonProps = {
  currentUserId: string;
  memberId: string;
  connection: {
    id: string;
    requester_id: string;
    recipient_id: string;
    status: string;
  } | null;
};

export function ConnectionButton({
  currentUserId,
  memberId,
  connection,
}: ConnectionButtonProps) {
  if (currentUserId === memberId) return null;

  const primaryButton =
    "inline-flex min-h-11 items-center justify-center rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";
  const secondaryButton =
    "inline-flex min-h-11 items-center justify-center rounded-2xl border border-border/80 bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

  if (!connection) {
    return (
      <form action={sendConnectionRequest}>
        <input type="hidden" name="recipient_id" value={memberId} />
        <button type="submit" className={primaryButton}>Connect</button>
      </form>
    );
  }

  if (connection.status === "accepted") {
    return (
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex min-h-11 items-center rounded-2xl border border-primary/20 bg-primary/[0.07] px-4 py-2.5 text-sm font-semibold text-primary">
          Connected
        </span>

        <form action={startConversation}>
          <input type="hidden" name="member_id" value={memberId} />
          <button type="submit" className={primaryButton}>Message</button>
        </form>

        <form
          action={removeConnection}
          onSubmit={(event) => {
            if (!window.confirm("Remove this connection?")) event.preventDefault();
          }}
        >
          <input type="hidden" name="connection_id" value={connection.id} />
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-destructive/25 bg-card px-4 py-2.5 text-sm font-semibold text-destructive transition hover:-translate-y-0.5 hover:bg-destructive/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-destructive"
          >
            Disconnect
          </button>
        </form>
      </div>
    );
  }

  if (connection.status === "pending") {
    if (connection.requester_id === currentUserId) {
      return (
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex min-h-11 items-center rounded-2xl border border-border bg-muted/70 px-4 py-2.5 text-sm font-semibold text-muted-foreground">
            Request sent
          </span>

          <form action={removeConnection}>
            <input type="hidden" name="connection_id" value={connection.id} />
            <button type="submit" className={secondaryButton}>Cancel request</button>
          </form>
        </div>
      );
    }

    return (
      <Link href="/network" className={primaryButton}>
        Respond to request
      </Link>
    );
  }

  if (connection.status === "declined") {
    return (
      <span className="inline-flex min-h-11 items-center rounded-2xl border border-border bg-muted/60 px-4 py-2.5 text-sm font-semibold text-muted-foreground">
        Request declined
      </span>
    );
  }

  return null;
}
