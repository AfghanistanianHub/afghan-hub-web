import Link from "next/link";
import styles from "@/components/network/network-surfaces.module.css";
import { CommunitySignature } from "@/components/public/community-signature";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Globe2,
  HandHeart,
  MapPin,
  Sparkles,
  UserRound,
} from "lucide-react";
import { PendingSubmitButton } from "@/components/forms/pending-submit-button";
import AvatarUpload from "@/components/profile/avatar-upload";
import { ProfileStrength } from "@/components/profile/profile-strength";
import { createClient } from "@/lib/supabase/server";
import { saveProfile } from "./actions";

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
    .select("first_name,last_name,headline,profession,company,city,province_state,country,bio,linkedin_url,website_url,languages,skills,avatar_url,open_to_mentoring,looking_for_mentor,mentorship_topics")
    .eq("id", user.id)
    .maybeSingle();

  const fieldClassName =
    `${styles.search} mt-2 w-full rounded-[var(--radius-control)] border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10`;
  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Your profile";
  const location = [profile?.city, profile?.province_state, profile?.country].filter(Boolean).join(", ");
  const hasProfessionalDetails = Boolean(profile?.headline || profile?.profession || profile?.company);
  const hasDiscoveryDetails = Boolean(profile?.skills?.length || profile?.languages?.length || location);

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <Link href="/dashboard" className={`${styles.control} inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}>
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to dashboard
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[330px_minmax(0,1fr)] lg:items-start">
          <aside className={`${styles.surface} relative overflow-hidden rounded-[var(--radius)] border border-border/80 bg-card p-6 text-foreground  lg:sticky lg:top-6 md:p-7`}>
            
            
            

            <CommunitySignature className={styles.signature} />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Your community identity</p>
              <h1 className="mt-3 break-words text-3xl font-medium tracking-[-0.035em]">{displayName}</h1>
              {profile?.headline ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{profile.headline}</p> : <p className="mt-3 text-sm leading-6 text-muted-foreground">Add a headline so people can understand what you do at a glance.</p>}

              <div className="mt-7">
                <AvatarUpload userId={user.id} currentAvatarUrl={profile?.avatar_url} />
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-3 rounded-[var(--radius)] border border-border/80 bg-background/72 p-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"><BriefcaseBusiness aria-hidden="true" className="size-4" /></span>
                  <div className="min-w-0"><p className="text-xs text-muted-foreground">Professional story</p><p className="mt-0.5 break-words font-semibold">{hasProfessionalDetails ?"Started" :"Add your work"}</p></div>
                </div>
                <div className="flex items-center gap-3 rounded-[var(--radius)] border border-border/80 bg-background/72 p-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"><Sparkles aria-hidden="true" className="size-4" /></span>
                  <div className="min-w-0"><p className="text-xs text-muted-foreground">Discovery details</p><p className="mt-0.5 break-words font-semibold">{hasDiscoveryDetails ?"People can find more about you" :"Add skills, language, location"}</p></div>
                </div>
                {location ? <div className="flex items-start gap-2 px-1 text-xs leading-5 text-muted-foreground"><MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" /><span className="min-w-0 break-words">{location}</span></div> : null}
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <ProfileStrength profile={profile} showAction={false} />

            <section className={`${styles.surface} rounded-[var(--radius)] border border-border/80 bg-card p-6  md:p-8`}>
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Profile builder</p>
                <h2 className="mt-2 text-2xl font-medium tracking-[-0.03em] md:text-3xl">Tell the community who you are</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Use the sections below to shape how other members discover and understand your work, experience, and interests.</p>
              </div>

              {error ? (
                <div role="alert" aria-live="assertive" className="mt-6 rounded-[var(--radius)] border border-destructive/25 bg-destructive/[0.06] p-4 text-sm text-destructive">{error}</div>
              ) : null}

              <form action={saveProfile} className="mt-8 space-y-9">
                <fieldset className="space-y-6">
                  <legend className="flex items-center gap-3 text-lg font-bold"><span className="flex size-9 items-center justify-center rounded-full bg-secondary text-primary"><UserRound aria-hidden="true" className="size-4" /></span>Identity</legend>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <label className="block"><span className="text-sm font-medium">First name</span><input name="first_name" defaultValue={profile?.first_name ?? ""} required className={fieldClassName} /></label>
                    <label className="block"><span className="text-sm font-medium">Last name</span><input name="last_name" defaultValue={profile?.last_name ?? ""} required className={fieldClassName} /></label>
                  </div>
                  <label className="block"><span className="text-sm font-medium">Headline</span><input name="headline" defaultValue={profile?.headline ?? ""} placeholder="Computer Technician | Founder of BC Computers" className={fieldClassName} /></label>
                  <label className="block"><span className="text-sm font-medium">About you</span><textarea name="bio" defaultValue={profile?.bio ?? ""} rows={5} placeholder="Tell the community a little about yourself..." className={`${fieldClassName} resize-none`} /></label>
                </fieldset>

                <fieldset className="space-y-6 border-t border-border/70 pt-8">
                  <legend className="flex items-center gap-3 pr-3 text-lg font-bold"><span className="flex size-9 items-center justify-center rounded-full bg-secondary text-primary"><BriefcaseBusiness aria-hidden="true" className="size-4" /></span>Work and skills</legend>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <label className="block"><span className="text-sm font-medium">Profession</span><input name="profession" defaultValue={profile?.profession ?? ""} placeholder="Computer technician" className={fieldClassName} /></label>
                    <label className="block"><span className="text-sm font-medium">Company</span><input name="company" defaultValue={profile?.company ?? ""} placeholder="BC Computers" className={fieldClassName} /></label>
                  </div>
                  <label className="block"><span className="text-sm font-medium">Skills</span><input name="skills" defaultValue={profile?.skills?.join(", ") ?? ""} placeholder="Computer repair, Filmmaking, Community organizing" className={fieldClassName} /><span className="mt-2 block text-xs text-muted-foreground">Separate each skill with a comma.</span></label>
                  <label className="block"><span className="text-sm font-medium">Languages</span><input name="languages" defaultValue={profile?.languages?.join(", ") ?? ""} placeholder="Dari, English, Persian" className={fieldClassName} /><span className="mt-2 block text-xs text-muted-foreground">Separate each language with a comma.</span></label>
                </fieldset>

                <fieldset className="space-y-6 border-t border-border/70 pt-8">
                  <legend className="flex items-center gap-3 pr-3 text-lg font-bold"><span className="flex size-9 items-center justify-center rounded-full bg-secondary text-primary"><HandHeart aria-hidden="true" className="size-4" /></span>Mentorship</legend>
                  <p className="text-sm leading-6 text-muted-foreground">Mentorship preferences are optional and member-selected. They are not credentials or endorsements by Afghan Hub.</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className={`${styles.control} flex min-h-12 cursor-pointer items-start gap-3 rounded-[var(--radius-control)] border border-border/80 bg-background/72 p-4 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-primary`}>
                      <input name="open_to_mentoring" type="checkbox" defaultChecked={profile?.open_to_mentoring ?? false} className="mt-1 size-4 accent-primary" />
                      <span><span className="block text-sm font-semibold">Open to mentoring</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Let members know you are open to sharing experience or guidance.</span></span>
                    </label>
                    <label className={`${styles.control} flex min-h-12 cursor-pointer items-start gap-3 rounded-[var(--radius-control)] border border-border/80 bg-background/72 p-4 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-primary`}>
                      <input name="looking_for_mentor" type="checkbox" defaultChecked={profile?.looking_for_mentor ?? false} className="mt-1 size-4 accent-primary" />
                      <span><span className="block text-sm font-semibold">Looking for a mentor</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Show that you are interested in finding guidance from another member.</span></span>
                    </label>
                  </div>
                  <label className="block"><span className="text-sm font-medium">Mentorship topics</span><input name="mentorship_topics" defaultValue={profile?.mentorship_topics?.join(", ") ?? ""} placeholder="Career growth, Technology, Filmmaking" className={fieldClassName} /><span className="mt-2 block text-xs text-muted-foreground">Optional. Separate topics with commas; up to 12 topics, 60 characters each.</span></label>
                </fieldset>

                <fieldset className="space-y-6 border-t border-border/70 pt-8">
                  <legend className="flex items-center gap-3 pr-3 text-lg font-bold"><span className="flex size-9 items-center justify-center rounded-full bg-secondary text-primary"><Globe2 aria-hidden="true" className="size-4" /></span>Location and links</legend>
                  <div className="grid gap-6 sm:grid-cols-3">
                    <label className="block"><span className="text-sm font-medium">City</span><input name="city" defaultValue={profile?.city ?? ""} placeholder="Vancouver" className={fieldClassName} /></label>
                    <label className="block"><span className="text-sm font-medium">Province/State</span><input name="province_state" defaultValue={profile?.province_state ?? ""} placeholder="British Columbia" className={fieldClassName} /></label>
                    <label className="block"><span className="text-sm font-medium">Country</span><input name="country" defaultValue={profile?.country ?? ""} placeholder="Canada" className={fieldClassName} /></label>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <label className="block"><span className="text-sm font-medium">LinkedIn</span><input name="linkedin_url" type="url" defaultValue={profile?.linkedin_url ?? ""} placeholder="https://www.linkedin.com/in/yourname" className={fieldClassName} /></label>
                    <label className="block"><span className="text-sm font-medium">Website</span><input name="website_url" type="url" defaultValue={profile?.website_url ?? ""} placeholder="https://yourwebsite.com" className={fieldClassName} /></label>
                  </div>
                </fieldset>

                <div className={`${styles.surface} sticky bottom-3 z-10 rounded-[var(--radius)] border border-border/80 bg-card p-3   sm:bottom-4`}>
                  <PendingSubmitButton pendingLabel="Saving profile…" className={`${styles.control} w-full rounded-[var(--radius-control)] bg-primary px-5 py-3 font-semibold text-primary-foreground transition  hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}>Save profile</PendingSubmitButton>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
