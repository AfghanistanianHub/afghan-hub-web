import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { updateMemberRole } from "@/app/(dashboard)/moderation/team/actions";
import { createClient } from "@/lib/supabase/server";

type ModerationTeamPageProps = {
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

function memberName(member: {
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}) {
  return (
    member.display_name?.trim() ||
    [member.first_name, member.last_name].filter(Boolean).join(" ") ||
    member.email ||
    "Afghan Hub member"
  );
}

export default async function ModerationTeamPage({
  searchParams,
}: ModerationTeamPageProps) {
  const { error, saved } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: viewer } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (viewer?.role !== "admin") {
    redirect("/moderation");
  }

  const { data: members, error: membersError } = await supabase
    .from("profiles")
    .select(
      "id,display_name,first_name,last_name,email,role,onboarding_completed,created_at",
    )
    .order("created_at", { ascending: true });

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/moderation"
          className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
        >
          ← Back to moderation
        </Link>

        <div className="mt-6 flex items-start gap-4">
          <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-300">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
              Admin only
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
              Moderation team
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-slate-400">
              Promote trusted members to moderator or admin, or return them to
              the standard member role.
            </p>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {saved === "1" ? (
          <div className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Member role updated.
          </div>
        ) : null}

        {membersError ? (
          <div className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            We could not load members: {membersError.message}
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {(members ?? []).map((member) => {
              const isCurrentAdmin = member.id === user.id;

              return (
                <article
                  key={member.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-white">
                          {memberName(member)}
                        </h2>
                        <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-semibold capitalize text-slate-300">
                          {member.role}
                        </span>
                        {!member.onboarding_completed ? (
                          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
                            Onboarding incomplete
                          </span>
                        ) : null}
                      </div>

                      {member.email ? (
                        <p className="mt-1 break-words text-sm text-slate-500">
                          {member.email}
                        </p>
                      ) : null}
                    </div>

                    {isCurrentAdmin ? (
                      <p className="text-sm text-slate-500">
                        Your own role cannot be changed here.
                      </p>
                    ) : (
                      <form
                        action={updateMemberRole}
                        className="flex flex-wrap items-center gap-3"
                      >
                        <input
                          type="hidden"
                          name="profile_id"
                          value={member.id}
                        />

                        <label className="text-sm text-slate-400">
                          <span className="sr-only">Role</span>
                          <select
                            name="role"
                            defaultValue={member.role}
                            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                          >
                            <option value="member">Member</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </label>

                        <button
                          type="submit"
                          className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
                        >
                          Save role
                        </button>
                      </form>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
