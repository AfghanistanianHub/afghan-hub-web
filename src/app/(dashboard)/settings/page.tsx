import Link from "next/link";
import { redirect } from "next/navigation";

import { updateAccountSettings } from "@/app/(dashboard)/settings/actions";
import { PendingSubmitButton } from "@/components/forms/pending-submit-button";
import { createClient } from "@/lib/supabase/server";

type SettingsPageProps = {
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  const { error: formError, saved } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, first_name, last_name, is_public")
    .eq("id", user.id)
    .maybeSingle();

  const accountName =
    profile?.display_name?.trim() ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    "Afghan Hub member";
  const accountEmail = user.email || "Not available";

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl">
        <section className="surface-panel rounded-[2rem] border border-border/70 px-6 py-8 md:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Account
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Settings
          </h1>
          <p className="mt-3 leading-7 text-muted-foreground">
            Manage your account details and profile visibility.
          </p>
        </section>

        {formError ? (
          <div role="alert" aria-live="assertive" className="mt-8 rounded-2xl border border-destructive/25 bg-destructive/8 p-4 text-sm text-destructive">
            {formError}
          </div>
        ) : null}

        {saved === "1" ? (
          <div role="status" aria-live="polite" className="mt-8 rounded-2xl border border-primary/20 bg-primary/8 p-4 text-sm text-primary">
            Your settings have been saved.
          </div>
        ) : null}

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-semibold text-card-foreground">
            Account information
          </h2>

          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Name</dt>
              <dd className="mt-1 font-medium text-foreground">{accountName}</dd>
            </div>

            <div>
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd className="mt-1 break-words font-medium text-foreground">
                {accountEmail}
              </dd>
            </div>
          </dl>

          <Link
            href="/profile"
            className="mt-6 inline-flex rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            Edit profile details
          </Link>
        </section>

        <form
          action={updateAccountSettings}
          className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
        >
          <h2 className="text-xl font-semibold text-card-foreground">
            Profile visibility
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Public profiles can appear in the member directory and be viewed by
            other Afghan Hub members.
          </p>

          <label className="mt-6 flex cursor-pointer items-start gap-4 rounded-2xl border border-border bg-secondary/45 p-4 transition hover:border-primary/25 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15">
            <input
              name="is_public"
              type="checkbox"
              defaultChecked={profile?.is_public ?? true}
              className="mt-0.5 size-5 rounded border-input bg-background text-primary focus:ring-primary"
            />
            <span>
              <span className="block font-semibold text-foreground">
                Show my profile in the community
              </span>
              <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                Turn this off to hide your profile from public member listings.
              </span>
            </span>
          </label>

          <div className="mt-6 flex justify-end">
            <PendingSubmitButton
              pendingLabel="Saving settings…"
              className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Save settings
            </PendingSubmitButton>
          </div>
        </form>
      </div>
    </main>
  );
}
