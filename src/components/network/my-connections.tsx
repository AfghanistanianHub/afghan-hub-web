import Link from "next/link";
import { CommunitySignature } from "@/components/public/community-signature";
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
              className={`group relative overflow-hidden border p-5 ${styles.surface} ${styles.profile}`}
            >
              <CommunitySignature className={styles.signature} />
              <div className="relative flex items-center gap-3">
                {member.avatar_url ? (
                  <ExternalImage
                    src={member.avatar_url}
                    alt={name}
                    width={48}
                    height={48}
                    className="size-12 shrink-0 rounded-sm border border-border object-cover"
                  />
                ) : (
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-secondary font-bold text-primary transition group-hover:bg-primary/[0.14]">
                    {name.charAt(0).toUpperCase() || <UserRound aria-hidden="true" className="size-5" />}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 break-words font-semibold leading-5 text-foreground">
                    {name}
                  </p>

                  {member.headline ? (
                    <p className="mt-1 line-clamp-2 break-words text-sm leading-5 text-muted-foreground">
                      {member.headline}
                    </p>
                  ) : null}
                </div>
                <ArrowUpRight aria-hidden="true" data-profile-arrow className="size-4 shrink-0 text-muted-foreground" />
              </div>

              {location ? (
                <p className="relative mt-4 flex items-start gap-2 border-t border-border/70 pt-4 text-sm leading-5 text-muted-foreground">
                  <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  <span className="min-w-0 break-words">{location}</span>
                </p>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
