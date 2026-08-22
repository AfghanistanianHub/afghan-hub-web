import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  ExternalLink,
  Globe2,
  Languages,
  MapPin,
  UserRound,
} from "lucide-react";

import { ConnectionButton } from "@/components/network/connection-button";
import { createClient } from "@/lib/supabase/server";

type MemberProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getMemberName(profile: {
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
}) {
  return (
    profile.display_name?.trim() ||
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
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

function normalizeExternalUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `https://${url}`;
}

export default async function MemberProfilePage({
  params,
}: MemberProfilePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      `
        id,
        display_name,
        first_name,
        last_name,
        headline,
        profession,
        company,
        bio,
        city,
        province_state,
        country,
        avatar_url,
        skills,
        languages,
        website_url,
        linkedin_url,
        is_public,
        onboarding_completed
      `,
    )
    .eq("id", id)
    .eq("is_public", true)
    .eq("onboarding_completed", true)
    .maybeSingle();

  if (error) {
    console.error("Could not load member profile:", error);
  }

  if (!profile) {
    notFound();
  }

  const { data: connection } =
    user && user.id !== profile.id
      ? await supabase
          .from("connections")
          .select("id, requester_id, recipient_id, status")
          .or(
            "and(requester_id.eq." +
              user.id +
              ",recipient_id.eq." +
              profile.id +
              "),and(requester_id.eq." +
              profile.id +
              ",recipient_id.eq." +
              user.id +
              ")",
          )
          .limit(1)
          .maybeSingle()
      : { data: null };

  const memberName = getMemberName(profile);

  const location = [
    profile.city,
    profile.province_state,
    profile.country,
  ]
    .filter(Boolean)
    .join(", ");

  const professionalDetails = [
    profile.profession,
    profile.company,
  ]
    .filter(Boolean)
    .join(" at ");

  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const languages = Array.isArray(profile.languages)
    ? profile.languages
    : [];

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/network"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-emerald-400"
        >
          <ArrowLeft className="size-4" />
          Back to network
        </Link>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
          <div className="h-32 bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-slate-900 md:h-44" />

          <div className="px-6 pb-8 md:px-10">
            <div className="-mt-14 flex flex-col gap-5 md:-mt-16 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-5 md:flex-row md:items-end">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={memberName}
                    className="size-28 rounded-2xl border-4 border-slate-900 bg-slate-950 object-cover shadow-xl md:size-32"
                  />
                ) : (
                  <div className="flex size-28 items-center justify-center rounded-2xl border-4 border-slate-900 bg-slate-800 text-3xl font-bold text-emerald-400 shadow-xl md:size-32">
                    {getInitials(memberName) || (
                      <UserRound className="size-12" />
                    )}
                  </div>
                )}

                <div className="pb-1">
                  <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                    {memberName}
                  </h1>

                  {profile.headline ? (
                    <p className="mt-2 max-w-2xl text-base leading-7 text-slate-300">
                      {profile.headline}
                    </p>
                  ) : null}
                </div>
              </div>

              {user ? (
                <ConnectionButton
                  currentUserId={user.id}
                  memberId={profile.id}
                  connection={connection}
                />
              ) : null}
            </div>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
              {professionalDetails ? (
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness className="size-4 text-emerald-400" />
                  <span>{professionalDetails}</span>
                </div>
              ) : null}

              {location ? (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-emerald-400" />
                  <span>{location}</span>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
              <h2 className="text-xl font-bold text-white">About</h2>

              {profile.bio ? (
                <p className="mt-4 whitespace-pre-line leading-7 text-slate-300">
                  {profile.bio}
                </p>
              ) : (
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  This member has not added a biography yet.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
              <h2 className="text-xl font-bold text-white">Skills</h2>

              {skills.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  No skills have been added.
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex items-center gap-2">
                <Languages className="size-5 text-emerald-400" />
                <h2 className="font-bold text-white">Languages</h2>
              </div>

              {languages.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {languages.map((language) => (
                    <span
                      key={language}
                      className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  No languages added.
                </p>
              )}
            </section>

            {(profile.website_url || profile.linkedin_url) ? (
              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex items-center gap-2">
                  <Globe2 className="size-5 text-emerald-400" />
                  <h2 className="font-bold text-white">Links</h2>
                </div>

                <div className="mt-4 space-y-3">
                  {profile.website_url ? (
                    <a
                      href={normalizeExternalUrl(profile.website_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300 transition hover:border-emerald-500/50 hover:text-emerald-300"
                    >
                      <span className="flex items-center gap-2">
                        <Globe2 className="size-4" />
                        Website
                      </span>

                      <ExternalLink className="size-4" />
                    </a>
                  ) : null}

                  {profile.linkedin_url ? (
                    <a
                      href={normalizeExternalUrl(profile.linkedin_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-300 transition hover:border-emerald-500/50 hover:text-emerald-300"
                    >
                      <span className="flex items-center gap-2">
 			 <ExternalLink className="size-4" />
  			LinkedIn
		</span>

		<ExternalLink className="size-4" />
                    </a>
                  ) : null}
                </div>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
