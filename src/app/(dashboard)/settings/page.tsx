import { SettingsPageHeader, SettingsText, SettingsSaveButton, SettingsSupportLinks } from "@/components/settings/settings-text";
import { catalogPageContainerClass } from "@/components/catalog/catalog-filter-styles";
import { CommunitySignature } from "@/components/public/community-signature";
import styles from "@/components/network/network-surfaces.module.css";
import { AccountExportButton } from "@/components/account/account-export-button";
import Link from "next/link";
import { redirect } from "next/navigation";

import { updateAccountSettings } from "@/app/(dashboard)/settings/actions";
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
    null;
  const accountEmail = user.email;

  return (
    <main className={catalogPageContainerClass}>
      <div className="min-w-0">
        <SettingsPageHeader />
        <dl className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <div><dt className="text-muted-foreground"><SettingsText id="signedIn" /></dt><dd className="mt-1 break-words font-medium">{accountName ?? <SettingsText id="member" />}</dd></div>
          <div><dt className="text-muted-foreground"><SettingsText id="directory" /></dt><dd className="mt-1 font-medium"><SettingsText id={(profile?.is_public ?? true) ? "visible" : "hidden"} /></dd></div>
        </dl>

        {formError ? <div role="alert" aria-live="assertive" className="mt-6 rounded-sm border border-destructive/25 bg-destructive/8 p-4 text-sm text-destructive"><SettingsText id={formError === "profile-not-found" ? "missingProfileError" : "updateError"} /></div> : null}
        {saved === "1" ? <div role="status" aria-live="polite" className="mt-6 rounded-sm border border-primary/20 bg-primary/8 p-4 text-sm text-primary"><SettingsText id="saved" /></div> : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className={`border p-6 md:p-8 ${styles.surface}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary"><SettingsText id="identity" /></p>
              <h2 className="mt-2 text-xl font-semibold text-card-foreground"><SettingsText id="account" /></h2>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-sm border border-border bg-muted/30 p-4"><dt className="text-xs text-muted-foreground"><SettingsText id="name" /></dt><dd className="mt-1 break-words font-semibold text-foreground">{accountName}</dd></div>
                <div className="rounded-sm border border-border bg-muted/30 p-4"><dt className="text-xs text-muted-foreground"><SettingsText id="email" /></dt><dd className="mt-1 break-words font-semibold text-foreground">{accountEmail ?? <SettingsText id="missing" />}</dd></div>
              </dl>
              <Link href="/profile" className={`mt-6 inline-flex items-center border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary ${styles.control}`}><SettingsText id="edit" /></Link>
            </section>

            <form action={updateAccountSettings} className={`border p-6 md:p-8 ${styles.surface}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary"><SettingsText id="privacy" /></p>
              <h2 className="mt-2 text-xl font-semibold text-card-foreground"><SettingsText id="visibility" /></h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground"><SettingsText id="visibilityHelp" /></p>

              <label className="mt-6 flex cursor-pointer items-start gap-4 rounded-sm border border-border bg-secondary/45 p-5 transition hover:border-primary/25 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15">
                <input name="is_public" type="checkbox" defaultChecked={profile?.is_public ?? true} className="mt-0.5 size-5 rounded border-input bg-background text-primary focus:ring-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" />
                <span className="min-w-0"><span className="block font-semibold text-foreground"><SettingsText id="show" /></span><span className="mt-1 block text-sm leading-6 text-muted-foreground"><SettingsText id="hideHelp" /></span></span>
              </label>

              <div className="mt-6 flex justify-end"><SettingsSaveButton className={`bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-primary/90 ${styles.control}`} /></div>
            </form>
          </div>

          <aside className="space-y-6">
            <section className={`relative overflow-hidden border p-6 text-foreground ${styles.surface}`}>
              <CommunitySignature className={styles.signature} />
              <p className="relative text-xs font-semibold uppercase tracking-[0.16em] text-primary"><SettingsText id="data" /></p>
              <h2 className="relative mt-2 text-xl font-semibold"><SettingsText id="take" /></h2>
              <p className="relative mt-3 text-sm leading-6 text-muted-foreground"><SettingsText id="downloadHelp" /></p>
              <div className="relative mt-5"><AccountExportButton /></div>
              <p className="relative mt-4 text-xs leading-5 text-muted-foreground"><SettingsText id="contactIntro" /><Link href="/support" className="rounded-sm font-semibold text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><SettingsText id="contact" /></Link>.</p>
            </section>

            <section className={`border p-6 ${styles.surface}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary"><SettingsText id="help" /></p>
              <div className="mt-4"><SettingsSupportLinks /></div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}