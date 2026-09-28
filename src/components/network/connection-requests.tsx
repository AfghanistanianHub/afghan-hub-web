import Link from "next/link";
import { respondConnectionRequest } from "@/app/(dashboard)/network/actions";

type Requester = {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  headline: string | null;
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
                className="flex items-center gap-3"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/[0.10] font-bold text-primary">
                  {name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="font-semibold text-foreground">{name}</p>

                  {requester.headline ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {requester.headline}
                    </p>
                  ) : null}
                </div>
              </Link>

              <form action={respondConnectionRequest} className="flex gap-3">
                <input
                  type="hidden"
                  name="connection_id"
                  value={request.id}
                />

                <button
                  type="submit"
                  name="decision"
                  value="accepted"
                  className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Accept
                </button>

                <button
                  type="submit"
                  name="decision"
                  value="declined"
                  className="rounded-lg border border-border bg-background px-4 py-2 font-semibold text-foreground transition hover:bg-muted"
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
