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
    <section className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
      <h2 className="text-xl font-bold text-white">
        Connection requests
      </h2>

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
              className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <Link
                href={"/members/" + requester.id}
                className="flex items-center gap-3"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-slate-800 font-bold text-emerald-400">
                  {name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="font-semibold text-white">{name}</p>

                  {requester.headline ? (
                    <p className="mt-1 text-sm text-slate-400">
                      {requester.headline}
                    </p>
                  ) : null}
                </div>
              </Link>

              <form
                action={respondConnectionRequest}
                className="flex gap-3"
              >
                <input
                  type="hidden"
                  name="connection_id"
                  value={request.id}
                />

                <button
                  type="submit"
                  name="decision"
                  value="accepted"
                  className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500"
                >
                  Accept
                </button>

                <button
                  type="submit"
                  name="decision"
                  value="declined"
                  className="rounded-lg border border-slate-700 px-4 py-2 font-semibold text-slate-300 hover:bg-slate-800"
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
