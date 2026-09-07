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
    "rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90";
  const secondaryButton =
    "rounded-xl border border-border bg-card px-4 py-3 font-semibold text-foreground transition hover:bg-muted";

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
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-xl border border-primary/20 bg-primary/10 px-5 py-3 font-semibold text-primary">
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
            className="rounded-xl border border-destructive/25 bg-card px-4 py-3 font-semibold text-destructive transition hover:bg-destructive/10"
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
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-xl border border-border bg-muted/70 px-5 py-3 font-semibold text-muted-foreground">
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
      <span className="rounded-xl border border-border bg-muted/60 px-5 py-3 font-semibold text-muted-foreground">
        Request declined
      </span>
    );
  }

  return null;
}
