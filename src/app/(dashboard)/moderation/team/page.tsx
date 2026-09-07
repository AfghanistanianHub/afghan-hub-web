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
          className="text-sm font-medium text-primary transition hover:text-primary/80"
        >
          ← Back to moderation
        </Link>

        <div className="mt-6 flex items-start gap-4">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Admin only
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Moderation team
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
              Promote trusted members to moderator or admin, or return them to
              the standard member role.
            </p>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-destructive/25 bg-destructive/8 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {saved === "1" ? (
          <div className="mt-6 rounded-xl border border-primary/20 bg-primary/8 p-4 text-sm text-primary">
            Member role updated.
          </div>
        ) : null}

        {membersError ? (
          <div className="mt-8 rounded-xl border border-destructive/25 bg-destructive/8 p-4 text-sm text-destructive">
            We could not load members: {membersError.message}
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {(members ?? []).map((member) => {
              const isCurrentAdmin = member.id === user.id;

              return (
                <article
                  key={member.id}
                  className="surface-panel rounded-2xl p-5"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-foreground">
                          {memberName(member)}
                        </h2>
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold capitalize text-secondary-foreground">
                          {member.role}
                        </span>
                        {!member.onboarding_completed ? (
                          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            Onboarding incomplete
                          </span>
                        ) : null}
                      </div>

                      {member.email ? (
                        <p className="mt-1 break-words text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      ) : null}
                    </div>

                    {isCurrentAdmin ? (
                      <p className="text-sm text-muted-foreground">
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

                        <label className="text-sm text-muted-foreground">
                          <span className="sr-only">Role</span>
                          <select
                            name="role"
                            defaultValue={member.role}
                            className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10"
                          >
                            <option value="member">Member</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </label>

                        <button
                          type="submit"
                          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
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
