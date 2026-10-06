import Link from "next/link";
import styles from "./network-surfaces.module.css";

import { ArrowUpRight, MapPin, UserRound } from "lucide-react";
import { ExternalImage } from "@/components/ui/external-image";

type Member = {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  headline: string | null;
  city: string | null;
  country: string | null;
  avatar_url: string | null;
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
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Your network
          </p>
          <h2 className="mt-1.5 text-xl font-bold tracking-tight text-foreground">
            My connections
          </h2>
        </div>

        <span className="text-sm font-medium text-muted-foreground">
          {members.length} connected
        </span>
      </div>

      <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
        {members.map((member) => {
          const name = getName(member);
          const location = [member.city, member.country]
            .filter(Boolean)
            .join(", ");

          return (
            <Link
              key={member.id}
              href={"/members/" + member.id}
              className={`group relative overflow-hidden border px-5 py-4 ${styles.surface} ${styles.profile}`}
            >
              <div className="relative flex items-center gap-3">
                {member.avatar_url ? (
                  <ExternalImage
                    src={member.avatar_url}
                    alt={name}
                    width={44}
                    height={44}
                    className="size-11 shrink-0 rounded-[var(--radius-control)] border border-border object-cover"
                  />
                ) : (
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-secondary font-bold text-primary transition group-hover:bg-primary/[0.14]">
                    {name.charAt(0).toUpperCase() || (
                      <UserRound aria-hidden="true" className="size-5" />
                    )}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold leading-5 text-foreground">
                    {name}
                  </p>

                  {member.headline ? (
                    <p className="mt-0.5 line-clamp-1 break-words text-sm leading-5 text-muted-foreground">
                      {member.headline}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-sm leading-5 text-muted-foreground">
                      Community member
                    </p>
                  )}
                </div>

                <ArrowUpRight
                  aria-hidden="true"
                  data-profile-arrow
                  className="size-4 shrink-0 text-muted-foreground"
                />
              </div>

              {location ? (
                <p className="relative mt-3 flex items-start gap-2 border-t border-border/70 pt-3 text-xs leading-5 text-muted-foreground">
                  <MapPin
                    aria-hidden="true"
                    className="mt-0.5 size-3.5 shrink-0 text-primary"
                  />
                  <span className="min-w-0 truncate">{location}</span>
                </p>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
