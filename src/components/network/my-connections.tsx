import Link from "next/link";

type Member = {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  headline: string | null;
  city: string | null;
  country: string | null;
};

type AcceptedConnection = {
  id: string;
  requester_id: string;
  requester: Member | Member[] | null;
  recipient: Member | Member[] | null;
};

type MyConnectionsProps = {
  currentUserId: string;
  connections: AcceptedConnection[];
};

function getName(member: Member) {
  return (
    member.display_name?.trim() ||
    [member.first_name, member.last_name].filter(Boolean).join(" ") ||
    "Afghan Hub Member"
  );
}

function normalizeMember(member: Member | Member[] | null) {
  return Array.isArray(member) ? member[0] ?? null : member;
}

export function MyConnections({
  currentUserId,
  connections,
}: MyConnectionsProps) {
  const members = connections
    .map((connection) =>
      normalizeMember(
        connection.requester_id === currentUserId
          ? connection.recipient
          : connection.requester,
      ),
    )
    .filter((member): member is Member => member !== null);

  if (members.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">My connections</h2>

        <span className="text-sm text-muted-foreground">
          {members.length} connected
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => {
          const name = getName(member);
          const location = [member.city, member.country]
            .filter(Boolean)
            .join(", ");

          return (
            <Link
              key={member.id}
              href={"/members/" + member.id}
              className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/[0.10] font-bold text-primary transition group-hover:bg-primary/[0.14]">
                  {name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    {name}
                  </p>

                  {member.headline ? (
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {member.headline}
                    </p>
                  ) : null}
                </div>
              </div>

              {location ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  {location}
                </p>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
