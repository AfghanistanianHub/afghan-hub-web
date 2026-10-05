import { PendingSubmitButton } from "@/components/forms/pending-submit-button";
import Link from "next/link";
import { CommunitySignature } from "@/components/public/community-signature";
import styles from "./network-surfaces.module.css";

import { UserRound } from "lucide-react";
import { ExternalImage } from "@/components/ui/external-image";
import { respondConnectionRequest } from "@/app/(dashboard)/network/actions";

type Requester = {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  headline: string | null;
  avatar_url: string | null;
};

type ConnectionRequest = {
  id: string;
  requester: Requester | Requester[] | null;
};

type ConnectionRequestsProps = {
  requests: ConnectionRequest[];
};

function getName(requester: Requester) {
  return (
    requester.display_name?.trim() ||
    [requester.first_name, requester.last_name]
      .filter(Boolean)
      .join(" ") ||
    "Afghan Hub Member"
  );
}

export function ConnectionRequests({
  requests,
}: ConnectionRequestsProps) {
  if (requests.length === 0) {
    return null;
  }

  return (
    <section className={`relative overflow-hidden border p-5 sm:p-6 ${styles.surface}`}>
      <CommunitySignature className={styles.signature} />
      <div className="relative"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">New activity</p><h2 className="mt-1 text-xl font-bold text-foreground">Connection requests</h2></div>

      <div className="mt-4 space-y-3">
        {requests.map((request) => {
          const requester = Array.isArray(request.requester)
            ? request.requester[0]
            : request.requester;

          if (!requester) {
            return null;
          }

          const name = getName(requester);

          return (
            <div
              key={request.id}
              className={`relative flex flex-col gap-4 border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between ${styles.surface}`}
            >
              <Link
                href={"/members/" + requester.id}
                className={`min-w-0 flex items-center gap-3 ${styles.profile}`}
              >
                {requester.avatar_url ? (
                  <ExternalImage
                    src={requester.avatar_url}
                    alt={name}
                    width={48}
                    height={48}
                    className="size-11 shrink-0 rounded-[var(--radius)] border border-border object-cover"
                  />
                ) : (
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius)] bg-secondary font-bold text-primary">
                    {name.charAt(0).toUpperCase() || <UserRound aria-hidden="true" className="size-5" />}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="break-words font-semibold text-foreground">{name}</p>

                  {requester.headline ? (
                    <p className="mt-1 line-clamp-2 break-words text-sm leading-5 text-muted-foreground">
                      {requester.headline}
                    </p>
                  ) : null}
                </div>
              </Link>

              <form action={respondConnectionRequest} className="flex flex-wrap gap-2.5 sm:justify-end">
                <input
                  type="hidden"
                  name="connection_id"
                  value={request.id}
                />

                <PendingSubmitButton
                  name="decision"
                  value="accepted"
                  pendingLabel="Accepting…"
                  className={`min-w-28 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 ${styles.control}`}
                >
                  Accept
                </PendingSubmitButton>

                <PendingSubmitButton
                  name="decision"
                  value="declined"
                  pendingLabel="Declining…"
                  className={`min-w-28 border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted ${styles.control}`}
                >
                  Decline
                </PendingSubmitButton>
              </form>
            </div>
          );
        })}
      </div>
    </section>
  );
}
