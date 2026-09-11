import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { saveProfile } from "./actions";
import AvatarUpload from "@/components/profile/avatar-upload";

type ProfilePageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name,last_name,headline,profession,company,city,province_state,country,bio,linkedin_url,website_url,languages,skills,avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const fieldClassName =
    "mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/dashboard" className="text-sm text-muted-foreground transition hover:text-primary">← Back</Link>

        <div className="surface-panel mt-6 rounded-3xl p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Afghan Hub</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Create your profile</h1>
          <p className="mt-2 text-muted-foreground">Add some basic information so other community members can learn about you.</p>

          {error ? (
            <div className="mt-6 rounded-xl border border-destructive/25 bg-destructive/[0.06] p-4 text-sm text-destructive">{error}</div>
          ) : null}

          <div className="mt-8">
            <AvatarUpload userId={user.id} currentAvatarUrl={profile?.avatar_url} />
          </div>

          <form action={saveProfile} className="mt-8 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block"><span className="text-sm font-medium">First name</span><input name="first_name" defaultValue={profile?.first_name ?? ""} required className={fieldClassName} /></label>
              <label className="block"><span className="text-sm font-medium">Last name</span><input name="last_name" defaultValue={profile?.last_name ?? ""} required className={fieldClassName} /></label>
            </div>

            <label className="block"><span className="text-sm font-medium">Headline</span><input name="headline" defaultValue={profile?.headline ?? ""} placeholder="Computer Technician | Founder of BC Computers" className={fieldClassName} /></label>
            <label className="block"><span className="text-sm font-medium">LinkedIn</span><input name="linkedin_url" type="url" defaultValue={profile?.linkedin_url ?? ""} placeholder="https://www.linkedin.com/in/yourname" className={fieldClassName} /></label>
            <label className="block"><span className="text-sm font-medium">Website</span><input name="website_url" type="url" defaultValue={profile?.website_url ?? ""} placeholder="https://yourwebsite.com" className={fieldClassName} /></label>

            <label className="block">
              <span className="text-sm font-medium">Languages</span>
              <input name="languages" defaultValue={profile?.languages?.join(", ") ?? ""} placeholder="Dari, English, Persian" className={fieldClassName} />
              <span className="mt-2 block text-xs text-muted-foreground">Separate each language with a comma.</span>
            </label>

            <label className="block">
              <span className="text-sm font-medium">Skills</span>
              <input name="skills" defaultValue={profile?.skills?.join(", ") ?? ""} placeholder="Computer repair, Filmmaking, Community organizing" className={fieldClassName} />
              <span className="mt-2 block text-xs text-muted-foreground">Separate each skill with a comma.</span>
            </label>

            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block"><span className="text-sm font-medium">Profession</span><input name="profession" defaultValue={profile?.profession ?? ""} placeholder="Computer technician" className={fieldClassName} /></label>
              <label className="block"><span className="text-sm font-medium">Company</span><input name="company" defaultValue={profile?.company ?? ""} placeholder="BC Computers" className={fieldClassName} /></label>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <label className="block"><span className="text-sm font-medium">City</span><input name="city" defaultValue={profile?.city ?? ""} placeholder="Vancouver" className={fieldClassName} /></label>
              <label className="block"><span className="text-sm font-medium">Province/State</span><input name="province_state" defaultValue={profile?.province_state ?? ""} placeholder="British Columbia" className={fieldClassName} /></label>
              <label className="block"><span className="text-sm font-medium">Country</span><input name="country" defaultValue={profile?.country ?? ""} placeholder="Canada" className={fieldClassName} /></label>
            </div>

            <label className="block"><span className="text-sm font-medium">About you</span><textarea name="bio" defaultValue={profile?.bio ?? ""} rows={5} placeholder="Tell the community a little about yourself..." className={`${fieldClassName} resize-none`} /></label>

            <button type="submit" className="w-full rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90">Save profile</button>
          </form>
        </div>
      </div>
    </main>
  );
}
