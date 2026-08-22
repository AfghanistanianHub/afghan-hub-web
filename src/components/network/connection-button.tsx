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
  if (currentUserId === memberId) {
    return null;
  }

  if (!connection) {
    return (
      <form action={sendConnectionRequest}>
        <input type="hidden" name="recipient_id" value={memberId} />

        <button
          type="submit"
          className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-500"
        >
          Connect
        </button>
      </form>
    );
  }

  if (connection.status === "accepted") {
    return (
      <div className="flex items-center gap-3">
        <span className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 font-semibold text-emerald-300">
          Connected
        </span>

        <form action={startConversation}>
          <input type="hidden" name="member_id" value={memberId} />
          <button
            type="submit"
            className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-500"
          >
            Message
          </button>
        </form>

        <form
          action={removeConnection}
          onSubmit={(event) => {
            if (!window.confirm("Remove this connection?")) {
              event.preventDefault();
            }
          }}
        >
          <input
            type="hidden"
            name="connection_id"
            value={connection.id}
          />

          <button
            type="submit"
            className="rounded-xl border border-red-800 px-4 py-3 font-semibold text-red-400 hover:bg-red-950/50"
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
        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 font-semibold text-slate-300">
            Request sent
          </span>

          <form action={removeConnection}>
            <input
              type="hidden"
              name="connection_id"
              value={connection.id}
            />

            <button
              type="submit"
              className="rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel request
            </button>
          </form>
        </div>
      );
    }

    return (
      <Link
        href="/network"
        className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-500"
      >
        Respond to request
      </Link>
    );
  }

  if (connection.status === "declined") {
    return (
      <span className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 font-semibold text-slate-400">
        Request declined
      </span>
    );
  }

  return null;
}
