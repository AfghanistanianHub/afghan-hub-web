"use client";
import Link from "next/link";

import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  MapPin,
  Search,
  UserRound,
} from "lucide-react";

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

  const filteredMembers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return members;
    }

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
  }, [members, searchQuery]);

  return (
    <>
      <div className="relative mt-6 max-w-xl">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" />

        <input
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by name, profession, company, city, or skill"
          className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3.5 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500"
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {filteredMembers.length}{" "}
          {filteredMembers.length === 1 ? "member" : "members"} found
        </p>
      </div>

      {filteredMembers.length > 0 ? (
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredMembers.map((member) => {
            const memberName = getMemberName(member);
            const location = [
              member.city,
              member.province_state,
              member.country,
            ]
              .filter(Boolean)
              .join(", ");

            const professionalDetails = [
              member.profession,
              member.company,
            ]
              .filter(Boolean)
              .join(" at ");

            return (
              <Link
  key={member.id}
  href={`/members/${member.id}`}
  className="block"
><article
  className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-0.5 hover:border-emerald-500/50"
>
                <div className="flex items-start gap-4">
                  {member.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.avatar_url}
                      alt={memberName}
                      className="size-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 font-bold text-emerald-400">
                      {getInitials(memberName) || (
                        <UserRound className="size-6" />
                      )}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-white">
                      {memberName}
                    </h2>

                    {member.headline ? (
                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-400">
                        {member.headline}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm text-slate-400">
                  {professionalDetails ? (
                    <div className="flex items-start gap-3">
                      <BriefcaseBusiness className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                      <span>{professionalDetails}</span>
                    </div>
                  ) : null}

                  {location ? (
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                      <span>{location}</span>
                    </div>
                  ) : null}
                </div>

                {member.skills.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {member.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300"
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
        <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-6 text-center">
          <UserRound className="size-11 text-slate-600" />

          <h2 className="mt-4 text-lg font-bold text-white">
            No members found
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            Try searching with another name, location, profession, company, or
            skill.
          </p>
        </div>
      )}
    </>
  );
}
