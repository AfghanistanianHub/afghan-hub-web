"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  MapPin,
  Search,
  UserRound,
} from "lucide-react";

import { CommunitySignature } from "@/components/public/community-signature";
import { ExternalImage } from "@/components/ui/external-image";
import styles from "./network-surfaces.module.css";

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
  open_to_mentoring: boolean;
  looking_for_mentor: boolean;
  mentorship_topics: string[];
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

type MentorshipFilter = "all" | "mentors" | "mentees";

export function MemberDirectory({ members }: MemberDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mentorshipFilter, setMentorshipFilter] =
    useState<MentorshipFilter>("all");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const hasSearchQuery = normalizedQuery.length > 0;
  const hasMentorshipFilter = mentorshipFilter !== "all";

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      if (mentorshipFilter === "mentors" && !member.open_to_mentoring) {
        return false;
      }

      if (mentorshipFilter === "mentees" && !member.looking_for_mentor) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableContent = [
        getMemberName(member),
        member.headline,
        member.profession,
        member.company,
        member.city,
        member.province_state,
        member.country,
        ...member.skills,
        ...member.mentorship_topics,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableContent.includes(normalizedQuery);
    });
  }, [members, mentorshipFilter, normalizedQuery]);

  function clearFilters() {
    setSearchQuery("");
    setMentorshipFilter("all");
    window.requestAnimationFrame(() => searchInputRef.current?.focus());
  }

  return (
    <section className="border-t border-border/70 pt-7">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,460px)] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Member directory
          </p>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Explore the community
            </h2>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {filteredMembers.length} {filteredMembers.length === 1 ? "member" : "members"}
            </p>
          </div>
        </div>

        <div className="relative w-full">
          <Search
            aria-hidden="true"
            className="absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground"
          />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search members"
            placeholder="Search people, skills, companies..."
            className={`${styles.search} w-full border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground hover:border-primary/40`}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Mentorship availability">
        {[
          { value: "all", label: "All members" },
          { value: "mentors", label: "Open to mentoring" },
          { value: "mentees", label: "Looking for a mentor" },
        ].map((option) => {
          const selected = mentorshipFilter === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() =>
                setMentorshipFilter(option.value as MentorshipFilter)
              }
              className={`inline-flex min-h-11 items-center rounded-full border px-3.5 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                selected
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {filteredMembers.length > 0 ? (
        <div className="mt-4 grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredMembers.map((member) => {
            const memberName = getMemberName(member);
            const location = [member.city, member.province_state, member.country]
              .filter(Boolean)
              .join(", ");
            const professionalDetails = [member.profession, member.company]
              .filter(Boolean)
              .join(" at ");

            return (
              <Link
                key={member.id}
                href={`/members/${member.id}`}
                className={`group block self-start ${styles.profile}`}
              >
                <article className={`relative overflow-hidden border px-5 py-4 ${styles.surface}`}>
                  <div className="relative flex items-start gap-3.5">
                    {member.avatar_url ? (
                      <ExternalImage
                        src={member.avatar_url}
                        alt={memberName}
                        width={48}
                        height={48}
                        className="size-12 shrink-0 rounded-[var(--radius-control)] border border-border object-cover"
                      />
                    ) : (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-secondary font-bold text-primary">
                        {getInitials(memberName) || (
                          <UserRound aria-hidden="true" className="size-5" />
                        )}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-1 break-words text-base font-bold leading-6 text-foreground transition group-hover:text-primary">
                        {memberName}
                      </h3>
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
                      className="mt-1 size-4 shrink-0 text-muted-foreground"
                    />
                  </div>

                  {(professionalDetails || location) ? (
                    <div className="relative mt-4 grid gap-2 border-t border-border/70 pt-3 text-sm text-muted-foreground">
                      {professionalDetails ? (
                        <div className="flex min-w-0 items-start gap-2.5">
                          <BriefcaseBusiness
                            aria-hidden="true"
                            className="mt-0.5 size-3.5 shrink-0 text-primary"
                          />
                          <span className="min-w-0 truncate">{professionalDetails}</span>
                        </div>
                      ) : null}

                      {location ? (
                        <div className="flex min-w-0 items-start gap-2.5">
                          <MapPin
                            aria-hidden="true"
                            className="mt-0.5 size-3.5 shrink-0 text-primary"
                          />
                          <span className="min-w-0 truncate">{location}</span>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {member.open_to_mentoring ||
                  member.looking_for_mentor ||
                  member.skills.length > 0 ? (
                    <div className="relative mt-3 flex flex-wrap gap-1.5 border-t border-border/70 pt-3">
                      {member.open_to_mentoring ? (
                        <span className="rounded-full border border-primary/15 bg-primary/[0.07] px-2.5 py-1 text-[0.7rem] font-semibold text-primary">
                          Open to mentoring
                        </span>
                      ) : null}
                      {member.looking_for_mentor ? (
                        <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[0.7rem] font-semibold text-foreground">
                          Looking for a mentor
                        </span>
                      ) : null}
                      {member.skills.slice(0, 2).map((skill) => (
                        <span
                          key={skill}
                          className="max-w-full truncate rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[0.7rem] text-muted-foreground"
                        >
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
        <div
          className={`relative mt-5 flex min-h-64 flex-col items-center justify-center overflow-hidden border px-6 text-center ${styles.surface}`}
        >
          <CommunitySignature className={styles.signature} />
          <span className="relative flex size-12 items-center justify-center rounded-[var(--radius)] bg-secondary text-primary">
            <UserRound aria-hidden="true" className="size-6" />
          </span>
          <h2 className="relative mt-4 text-lg font-bold text-foreground">
            {hasSearchQuery || hasMentorshipFilter
              ? "No matching members"
              : "No public members yet"}
          </h2>
          <p className="relative mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            {hasSearchQuery || hasMentorshipFilter
              ? "Try another search or mentorship filter."
              : "Public member profiles will appear here as the community grows."}
          </p>
          {hasSearchQuery || hasMentorshipFilter ? (
            <button
              type="button"
              onClick={clearFilters}
              className={`relative mt-5 inline-flex items-center justify-center border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted ${styles.control}`}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}
