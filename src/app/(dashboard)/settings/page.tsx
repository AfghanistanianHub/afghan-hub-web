import { AccountExportButton } from "@/components/account/account-export-button";
import { SupportLinks } from "@/components/public/support-links";
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
    <main className="px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card px-6 py-8 shadow-[0_18px_55px_rgb(15_23_42/0.045)] md:px-8 md:py-10">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_86%_15%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_28%),radial-gradient(circle_at_10%_92%,color-mix(in_oklab,var(--accent)_48%,transparent),transparent_30%)]" />
          <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Your account</p>
              <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-foreground md:text-5xl">Settings</h1>
              <p className="mt-3 max-w-xl leading-7 text-muted-foreground">Control how your profile appears, review your account identity, and access your data and support options.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/80 bg-background/88 p-4 backdrop-blur"><p className="text-xs text-muted-foreground">Signed in as</p><p className="mt-1 break-words font-semibold text-foreground">{accountName}</p></div>
              <div className="rounded-2xl border border-border/80 bg-background/88 p-4 backdrop-blur"><p className="text-xs text-muted-foreground">Directory status</p><p className="mt-1 font-semibold text-foreground">{profile?.is_public ?? true ? "Visible" : "Hidden"}</p></div>
            </div>
          </div>
        </section>

        {formError ? <div role="alert" aria-live="assertive" className="mt-6 rounded-2xl border border-destructive/25 bg-destructive/8 p-4 text-sm text-destructive">{formError}</div> : null}
        {saved === "1" ? <div role="status" aria-live="polite" className="mt-6 rounded-2xl border border-primary/20 bg-primary/8 p-4 text-sm text-primary">Your settings have been saved.</div> : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-[1.75rem] border border-border bg-card p-6 shadow-[0_10px_32px_rgb(15_23_42/0.035)] md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Identity</p>
              <h2 className="mt-2 text-xl font-semibold text-card-foreground">Account information</h2>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-muted/30 p-4"><dt className="text-xs text-muted-foreground">Name</dt><dd className="mt-1 break-words font-semibold text-foreground">{accountName}</dd></div>
                <div className="rounded-2xl border border-border bg-muted/30 p-4"><dt className="text-xs text-muted-foreground">Email</dt><dd className="mt-1 break-words font-semibold text-foreground">{accountEmail}</dd></div>
              </dl>
              <Link href="/profile" className="mt-6 inline-flex rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Edit profile details</Link>
            </section>

            <form action={updateAccountSettings} className="rounded-[1.75rem] border border-border bg-card p-6 shadow-[0_10px_32px_rgb(15_23_42/0.035)] md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Privacy</p>
              <h2 className="mt-2 text-xl font-semibold text-card-foreground">Profile visibility</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Public profiles can appear in the member directory and be viewed by other Afghan Hub members.</p>

              <label className="mt-6 flex cursor-pointer items-start gap-4 rounded-2xl border border-border bg-secondary/45 p-5 transition hover:border-primary/25 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15">
                <input name="is_public" type="checkbox" defaultChecked={profile?.is_public ?? true} className="mt-0.5 size-5 rounded border-input bg-background text-primary focus:ring-primary" />
                <span className="min-w-0"><span className="block font-semibold text-foreground">Show my profile in the community</span><span className="mt-1 block text-sm leading-6 text-muted-foreground">Turn this off to hide your profile from public member listings.</span></span>
              </label>

              <div className="mt-6 flex justify-end"><PendingSubmitButton pendingLabel="Saving settings…" className="rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Save settings</PendingSubmitButton></div>
            </form>
          </div>

          <aside className="space-y-6">
            <section className="relative overflow-hidden rounded-[1.75rem] border border-primary/15 bg-primary/[0.055] p-6 text-foreground shadow-[0_14px_40px_rgb(15_23_42/0.045)]">
              <div aria-hidden="true" className="absolute -right-12 -top-12 size-36 rounded-full border border-primary/10" />
              <p className="relative text-xs font-semibold uppercase tracking-[0.16em] text-primary">Your data</p>
              <h2 className="relative mt-2 text-xl font-semibold">Take a copy with you</h2>
              <p className="relative mt-3 text-sm leading-6 text-muted-foreground">Download your account details and profile as JSON. Messages, connections, contributions, saved items, RSVPs and uploaded files are outside this download.</p>
              <div className="relative mt-5"><AccountExportButton /></div>
              <p className="relative mt-4 text-xs leading-5 text-muted-foreground">For a wider data request or account deletion, <Link href="/support" className="font-semibold text-primary underline underline-offset-4">contact support</Link>.</p>
            </section>

            <section className="rounded-[1.75rem] border border-border bg-card p-6 shadow-[0_10px_32px_rgb(15_23_42/0.035)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Need help?</p>
              <div className="mt-4"><SupportLinks /></div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}