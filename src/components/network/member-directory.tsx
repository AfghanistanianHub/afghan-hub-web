"use client";
import Link from "next/link";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  MapPin,
  Search,
  UserRound,
} from "lucide-react";

import { ExternalImage } from "@/components/ui/external-image";

export type Member = {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  headline: string | null;
  profession: string | null;
  company: string | null;
  city: string | null;
  province_state: string | null;
  country: string | null;
  avatar_url: string | null;
  skills: string[];
};

type MemberDirectoryProps = {
  members: Member[];
};

function getMemberName(member: Member) {
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

export function MemberDirectory({ members }: MemberDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const hasSearchQuery = normalizedQuery.length > 0;

  const filteredMembers = useMemo(() => {
    if (!normalizedQuery) return members;

    return members.filter((member) => {
      const searchableContent = [
        getMemberName(member),
        member.headline,
        member.profession,
        member.company,
        member.city,
        member.province_state,
        member.country,
        ...member.skills,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableContent.includes(normalizedQuery);
    });
  }, [members, normalizedQuery]);

  return (
    <>
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Member directory</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Explore the community</h2>
        </div>

        <div className="relative w-full lg:max-w-md">
          <Search aria-hidden="true" className="absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search members"
            placeholder="Search people, skills, companies..."
            className="w-full rounded-2xl border border-border/80 bg-card/88 py-3.5 pl-11 pr-4 text-sm text-foreground shadow-[0_8px_24px_rgb(15_23_42/0.035)] outline-none transition placeholder:text-muted-foreground hover:border-primary/20 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {filteredMembers.length} {filteredMembers.length === 1 ? "member" : "members"} found
        </p>
      </div>

      {filteredMembers.length > 0 ? (
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredMembers.map((member) => {
            const memberName = getMemberName(member);
            const location = [member.city, member.province_state, member.country]
              .filter(Boolean)
              .join(", ");
            const professionalDetails = [member.profession, member.company]
              .filter(Boolean)
              .join(" at ");

            return (
              <Link key={member.id} href={`/members/${member.id}`} className="group block rounded-[1.75rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                <article className="relative h-full overflow-hidden rounded-[1.75rem] border border-border/80 bg-card p-6 shadow-[0_10px_32px_rgb(15_23_42/0.035)] transition duration-200 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-[0_18px_42px_rgb(15_23_42/0.07)]">
                  <div aria-hidden="true" className="absolute -right-10 -top-10 size-28 rounded-full border border-primary/10" />
                  <div className="relative flex items-start gap-4">
                    {member.avatar_url ? (
                      <ExternalImage
                        src={member.avatar_url}
                        alt={memberName}
                        width={56}
                        height={56}
                        className="size-14 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-bold text-primary">
                        {getInitials(memberName) || <UserRound aria-hidden="true" className="size-6" />}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 break-words text-lg font-bold leading-6 text-foreground transition group-hover:text-primary">{memberName}</h3>
                      {member.headline ? (
                        <p className="mt-1 line-clamp-2 break-words text-sm leading-5 text-muted-foreground">{member.headline}</p>
                      ) : null}
                    </div>
                    <ArrowUpRight aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>

                  <div className="relative mt-5 space-y-3 text-sm text-muted-foreground">
                    {professionalDetails ? (
                      <div className="flex items-start gap-3">
                        <BriefcaseBusiness aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="min-w-0 break-words">{professionalDetails}</span>
                      </div>
                    ) : null}

                    {location ? (
                      <div className="flex items-start gap-3">
                        <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="min-w-0 break-words">{location}</span>
                      </div>
                    ) : null}
                  </div>

                  {member.skills.length > 0 ? (
                    <div className="relative mt-5 flex flex-wrap gap-2 border-t border-border/70 pt-4">
                      {member.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="max-w-full break-words rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-muted-foreground">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </article>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="relative mt-6 flex min-h-72 flex-col items-center justify-center overflow-hidden rounded-[1.75rem] border border-dashed border-border/80 bg-card px-6 text-center shadow-[0_12px_36px_rgb(15_23_42/0.035)]"><div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-primary/[0.06] blur-3xl"/>
          <span className="relative flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserRound aria-hidden="true" className="size-7" />
          </span>
          <h2 className="relative mt-4 text-lg font-bold text-foreground">
            {hasSearchQuery ? "No matching members" : "No public members yet"}
          </h2>
          <p className="relative mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {hasSearchQuery
              ? "Try another name, location, profession, company, or skill."
              : "Public member profiles will appear here as the community grows."}
          </p>
          {hasSearchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="relative mt-5 inline-flex min-h-10 items-center justify-center rounded-xl border border-border/80 bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Clear search
            </button>
          ) : null}
        </div>
      )}
    </>
  );
}
