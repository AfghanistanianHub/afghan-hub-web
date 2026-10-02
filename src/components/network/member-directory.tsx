"use client";
import Link from "next/link";
import { CommunitySignature } from "@/components/public/community-signature";
import styles from "./network-surfaces.module.css";


import { useMemo, useRef, useState } from "react";
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
      if (
        mentorshipFilter === "mentors" &&
        !member.open_to_mentoring
      ) {
        return false;
      }

      if (
        mentorshipFilter === "mentees" &&
        !member.looking_for_mentor
      ) {
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
    <>
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Member directory</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Explore the community</h2>
        </div>

        <div className="relative w-full lg:max-w-md">
          <Search aria-hidden="true" className="absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Search members"
            placeholder="Search people, skills, companies..."
            className={`${styles.search} w-full border border-border bg-card py-3.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground hover:border-primary/40`}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Mentorship availability"
        >
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
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  selected
                    ? "border-primary/25 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/25 hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

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
              <Link key={member.id} href={`/members/${member.id}`} className={`group block ${styles.profile}`}>
                <article className={`relative h-full overflow-hidden border p-6 ${styles.surface}`}>
                  <CommunitySignature className={styles.signature} />
                  <div className="relative flex items-start gap-4">
                    {member.avatar_url ? (
                      <ExternalImage
                        src={member.avatar_url}
                        alt={memberName}
                        width={56}
                        height={56}
                        className="size-14 rounded-sm object-cover"
                      />
                    ) : (
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-sm bg-secondary font-bold text-primary">
                        {getInitials(memberName) || <UserRound aria-hidden="true" className="size-6" />}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 break-words text-lg font-bold leading-6 text-foreground transition group-hover:text-primary">{memberName}</h3>
                      {member.headline ? (
                        <p className="mt-1 line-clamp-2 break-words text-sm leading-5 text-muted-foreground">{member.headline}</p>
                      ) : null}
                    </div>
                    <ArrowUpRight aria-hidden="true" data-profile-arrow className="mt-1 size-4 shrink-0 text-muted-foreground" />
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

                  {member.open_to_mentoring || member.looking_for_mentor ? (
                    <div className="relative mt-5 flex flex-wrap gap-2 border-t border-border/70 pt-4">
                      {member.open_to_mentoring ? (
                        <span className="rounded-full border border-primary/15 bg-primary/[0.07] px-3 py-1 text-xs font-semibold text-primary">
                          Open to mentoring
                        </span>
                      ) : null}
                      {member.looking_for_mentor ? (
                        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground">
                          Looking for a mentor
                        </span>
                      ) : null}
                    </div>
                  ) : null}

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
        <div className={`relative mt-6 flex min-h-72 flex-col items-center justify-center overflow-hidden border px-6 text-center ${styles.surface}`}><CommunitySignature className={styles.signature} />
          <span className="relative flex size-14 items-center justify-center rounded-sm bg-secondary text-primary">
            <UserRound aria-hidden="true" className="size-7" />
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
    </>
  );
}
