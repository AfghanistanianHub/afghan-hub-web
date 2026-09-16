import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, MapPin, UserRound } from "lucide-react";
import { ExternalImage } from "@/components/ui/external-image";
import type { RecommendedMember } from "@/lib/member-recommendations";

type RecommendedMembersProps = {
  members: RecommendedMember[];
};

function getMemberName(member: RecommendedMember) {
  return (
    member.display_name?.trim() ||
    [member.first_name, member.last_name].filter(Boolean).join(" ") ||
    "Afghan Hub Member"
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function RecommendedMembers({ members }: RecommendedMembersProps) {
  if (!members.length) return null;

  return (
    <section className="rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-[0_12px_38px_rgb(15_23_42/0.04)] md:p-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            People worth meeting
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-[-0.02em] text-foreground">
            Relevant people from the community
          </h2>
        </div>
        <Link
          href="/network"
          className="hidden items-center gap-2 text-sm font-semibold text-primary sm:inline-flex"
        >
          Explore network
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {members.map((member) => {
          const memberName = getMemberName(member);
          const location = [member.city, member.country].filter(Boolean).join(", ");
          const work = [member.profession, member.company].filter(Boolean).join(" at ");

          return (
            <Link
              key={member.id}
              href={`/members/${member.id}`}
              className="group rounded-2xl border border-border bg-background p-5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm"
            >
              <div className="flex items-start gap-3.5">
                {member.avatar_url ? (
                  <ExternalImage
                    src={member.avatar_url}
                    alt={memberName}
                    width={48}
                    height={48}
                    className="size-12 rounded-2xl object-cover"
                  />
                ) : (
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
                    {getInitials(memberName) || <UserRound aria-hidden="true" className="size-5" />}
                  </span>
                )}

                <div className="min-w-0">
                  <h3 className="truncate font-bold text-foreground transition group-hover:text-primary">
                    {memberName}
                  </h3>
                  {member.headline ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {member.headline}
                    </p>
                  ) : null}
                </div>
              </div>

              {member.reason ? (
                <p className="mt-4 inline-flex rounded-full bg-primary/[0.07] px-2.5 py-1 text-[0.68rem] font-semibold text-primary">
                  {member.reason}
                </p>
              ) : null}

              <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                {work ? (
                  <p className="flex items-start gap-2">
                    <BriefcaseBusiness aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span className="line-clamp-1">{work}</span>
                  </p>
                ) : null}
                {location ? (
                  <p className="flex items-start gap-2">
                    <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span className="line-clamp-1">{location}</span>
                  </p>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        href="/network"
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary sm:hidden"
      >
        Explore network
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </section>
  );
}
