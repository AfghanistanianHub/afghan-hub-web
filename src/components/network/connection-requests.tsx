import Link from "next/link";
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
    <section className="relative mt-8 overflow-hidden rounded-[1.75rem] border border-primary/15 bg-primary/[0.04] p-6">
      <div aria-hidden="true" className="absolute -right-12 -top-12 size-32 rounded-full border border-primary/10" />
      <div className="relative"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">New activity</p><h2 className="mt-1 text-xl font-bold text-foreground">Connection requests</h2></div>

      <div className="mt-5 space-y-4">
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
              className="relative flex flex-col gap-4 rounded-2xl border border-border/80 bg-card p-4 shadow-[0_8px_24px_rgb(15_23_42/0.03)] sm:flex-row sm:items-center sm:justify-between"
            >
              <Link
                href={"/members/" + requester.id}
                className="min-w-0 flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                {requester.avatar_url ? (
                  <ExternalImage
                    src={requester.avatar_url}
                    alt={name}
                    width={48}
                    height={48}
                    className="size-12 shrink-0 rounded-2xl border border-border/70 object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/[0.10] font-bold text-primary">
                    {name.charAt(0).toUpperCase() || <UserRound aria-hidden="true" className="size-5" />}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="break-words font-semibold text-foreground">{name}</p>

                  {requester.headline ? (
                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">
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

                <button
                  type="submit"
                  name="decision"
                  value="accepted"
                  className="min-h-10 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  Accept
                </button>

                <button
                  type="submit"
                  name="decision"
                  value="declined"
                  className="min-h-10 rounded-xl border border-border/80 bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  Decline
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </section>
  );
}
