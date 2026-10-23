import styles from "@/components/network/network-surfaces.module.css";
import { CommunitySignature } from "@/components/public/community-signature";
import { redirect } from "next/navigation";
import {
  BriefcaseBusiness,
  Globe2,
  HandHeart,
  MapPin,
  Sparkles,
  UserRound,
} from "lucide-react";
import AvatarUpload from "@/components/profile/avatar-upload";
import { ProfileStrength } from "@/components/profile/profile-strength";
import {
  LocalizedBackLink,
  LocalizedCheckbox,
  LocalizedField,
  LocalizedSubmitButton,
  W,
} from "@/components/i18n/workspace";
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
  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ");
  const location = [profile?.city, profile?.province_state, profile?.country].filter(Boolean).join(", ");
  const hasProfessionalDetails = Boolean(profile?.headline || profile?.profession || profile?.company);
  const hasDiscoveryDetails = Boolean(profile?.skills?.length || profile?.languages?.length || location);

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <LocalizedBackLink
          href="/dashboard"
          k="common.backToDashboard"
          className={`${styles.control} inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[330px_minmax(0,1fr)] lg:items-start">
          <aside className={`${styles.surface} relative overflow-hidden rounded-[var(--radius)] border border-border/80 bg-card p-6 text-foreground  lg:sticky lg:top-6 md:p-7`}>
            <CommunitySignature className={styles.signature} />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <W k="profile.identityEyebrow" />
              </p>
              <h1 className="mt-3 break-words text-3xl font-medium tracking-[-0.035em]">
                {displayName || <W k="profile.fallbackName" />}
              </h1>
              {profile?.headline ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{profile.headline}</p> : <p className="mt-3 text-sm leading-6 text-muted-foreground"><W k="profile.headlineEmpty" /></p>}

              <div className="mt-7">
                <AvatarUpload userId={user.id} currentAvatarUrl={profile?.avatar_url} />
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-3 rounded-[var(--radius)] border border-border/80 bg-background/72 p-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"><BriefcaseBusiness aria-hidden="true" className="size-4" /></span>
                  <div className="min-w-0"><p className="text-xs text-muted-foreground"><W k="profile.storyLabel" /></p><p className="mt-0.5 break-words font-semibold">{hasProfessionalDetails ? <W k="profile.storyStarted" /> : <W k="profile.storyAdd" />}</p></div>
                </div>
                <div className="flex items-center gap-3 rounded-[var(--radius)] border border-border/80 bg-background/72 p-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"><Sparkles aria-hidden="true" className="size-4" /></span>
                  <div className="min-w-0"><p className="text-xs text-muted-foreground"><W k="profile.discoveryLabel" /></p><p className="mt-0.5 break-words font-semibold">{hasDiscoveryDetails ? <W k="profile.discoveryMore" /> : <W k="profile.discoveryAdd" />}</p></div>
                </div>
                {location ? <div className="flex items-start gap-2 px-1 text-xs leading-5 text-muted-foreground"><MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" /><span className="min-w-0 break-words">{location}</span></div> : null}
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <ProfileStrength profile={profile} showAction={false} />

            <section className={`${styles.surface} rounded-[var(--radius)] border border-border/80 bg-card p-6  md:p-8`}>
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  <W k="profile.builderEyebrow" />
                </p>
                <h2 className="mt-2 text-2xl font-medium tracking-[-0.03em] md:text-3xl">
                  <W k="profile.builderTitle" />
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  <W k="profile.builderBody" />
                </p>
              </div>

              {error ? (
                <div role="alert" aria-live="assertive" className="mt-6 rounded-[var(--radius)] border border-destructive/25 bg-destructive/[0.06] p-4 text-sm text-destructive">{error}</div>
              ) : null}

              <form action={saveProfile} className="mt-8 space-y-9">
                <fieldset className="space-y-6">
                  <legend className="flex items-center gap-3 text-lg font-bold"><span className="flex size-9 items-center justify-center rounded-full bg-secondary text-primary"><UserRound aria-hidden="true" className="size-4" /></span><W k="profile.identity" /></legend>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <LocalizedField labelKey="common.firstName" name="first_name" required defaultValue={profile?.first_name ?? ""} fieldClassName={fieldClassName} labelClassName="text-sm font-medium" wrapperClassName="block" />
                    <LocalizedField labelKey="common.lastName" name="last_name" required defaultValue={profile?.last_name ?? ""} fieldClassName={fieldClassName} labelClassName="text-sm font-medium" wrapperClassName="block" />
                  </div>
                  <LocalizedField labelKey="common.headline" name="headline" defaultValue={profile?.headline ?? ""} placeholderKey="profile.headlinePlaceholder" fieldClassName={fieldClassName} labelClassName="text-sm font-medium" wrapperClassName="block" />
                  <LocalizedField labelKey="common.aboutYou" name="bio" rows={5} defaultValue={profile?.bio ?? ""} placeholderKey="profile.bioPlaceholder" fieldClassName={`${fieldClassName} resize-none`} labelClassName="text-sm font-medium" wrapperClassName="block" />
                </fieldset>

                <fieldset className="space-y-6 border-t border-border/70 pt-8">
                  <legend className="flex items-center gap-3 pr-3 text-lg font-bold"><span className="flex size-9 items-center justify-center rounded-full bg-secondary text-primary"><BriefcaseBusiness aria-hidden="true" className="size-4" /></span><W k="profile.workSkills" /></legend>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <LocalizedField labelKey="common.profession" name="profession" defaultValue={profile?.profession ?? ""} placeholderKey="profile.professionPlaceholder" fieldClassName={fieldClassName} labelClassName="text-sm font-medium" wrapperClassName="block" />
                    <LocalizedField labelKey="common.company" name="company" defaultValue={profile?.company ?? ""} placeholderKey="profile.companyPlaceholder" fieldClassName={fieldClassName} labelClassName="text-sm font-medium" wrapperClassName="block" />
                  </div>
                  <LocalizedField labelKey="common.skills" name="skills" defaultValue={profile?.skills?.join(", ") ?? ""} placeholderKey="profile.skillsPlaceholder" hintKey="profile.skillsHint" fieldClassName={fieldClassName} labelClassName="text-sm font-medium" wrapperClassName="block" />
                  <LocalizedField labelKey="common.languages" name="languages" defaultValue={profile?.languages?.join(", ") ?? ""} placeholderKey="profile.languagesPlaceholder" hintKey="profile.languagesHint" fieldClassName={fieldClassName} labelClassName="text-sm font-medium" wrapperClassName="block" />
                </fieldset>

                <fieldset className="space-y-6 border-t border-border/70 pt-8">
                  <legend className="flex items-center gap-3 pr-3 text-lg font-bold"><span className="flex size-9 items-center justify-center rounded-full bg-secondary text-primary"><HandHeart aria-hidden="true" className="size-4" /></span><W k="profile.mentorship" /></legend>
                  <p className="text-sm leading-6 text-muted-foreground">
                    <W k="profile.mentorshipNote" />
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <LocalizedCheckbox
                      name="open_to_mentoring"
                      labelKey="profile.openToMentoring"
                      hintKey="profile.openToMentoringHint"
                      defaultChecked={profile?.open_to_mentoring ?? false}
                      wrapperClassName={`${styles.control} flex min-h-12 cursor-pointer items-start gap-3 rounded-[var(--radius-control)] border border-border/80 bg-background/72 p-4 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-primary`}
                    />
                    <LocalizedCheckbox
                      name="looking_for_mentor"
                      labelKey="profile.lookingForMentor"
                      hintKey="profile.lookingForMentorHint"
                      defaultChecked={profile?.looking_for_mentor ?? false}
                      wrapperClassName={`${styles.control} flex min-h-12 cursor-pointer items-start gap-3 rounded-[var(--radius-control)] border border-border/80 bg-background/72 p-4 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-primary`}
                    />
                  </div>
                  <LocalizedField labelKey="profile.mentorshipTopics" name="mentorship_topics" defaultValue={profile?.mentorship_topics?.join(", ") ?? ""} placeholderKey="profile.mentorshipTopicsPlaceholder" hintKey="profile.mentorshipTopicsHint" fieldClassName={fieldClassName} labelClassName="text-sm font-medium" wrapperClassName="block" />
                </fieldset>

                <fieldset className="space-y-6 border-t border-border/70 pt-8">
                  <legend className="flex items-center gap-3 pr-3 text-lg font-bold"><span className="flex size-9 items-center justify-center rounded-full bg-secondary text-primary"><Globe2 aria-hidden="true" className="size-4" /></span><W k="profile.locationLinks" /></legend>
                  <div className="grid gap-6 sm:grid-cols-3">
                    <LocalizedField labelKey="common.city" name="city" defaultValue={profile?.city ?? ""} placeholderKey="common.cityPlaceholder" fieldClassName={fieldClassName} labelClassName="text-sm font-medium" wrapperClassName="block" />
                    <LocalizedField labelKey="common.province" name="province_state" defaultValue={profile?.province_state ?? ""} placeholderKey="common.provincePlaceholder" fieldClassName={fieldClassName} labelClassName="text-sm font-medium" wrapperClassName="block" />
                    <LocalizedField labelKey="common.country" name="country" defaultValue={profile?.country ?? ""} placeholderKey="common.countryPlaceholder" fieldClassName={fieldClassName} labelClassName="text-sm font-medium" wrapperClassName="block" />
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium">LinkedIn</span>
                      <input name="linkedin_url" type="url" dir="ltr" defaultValue={profile?.linkedin_url ?? ""} placeholder="https://www.linkedin.com/in/yourname" className={fieldClassName} />
                    </label>
                    <LocalizedField labelKey="common.website" name="website_url" type="url" defaultValue={profile?.website_url ?? ""} placeholder="https://yourwebsite.com" fieldClassName={fieldClassName} labelClassName="text-sm font-medium" wrapperClassName="block" />
                  </div>
                </fieldset>

                <div className={`${styles.surface} sticky bottom-3 z-10 rounded-[var(--radius)] border border-border/80 bg-card p-3   sm:bottom-4`}>
                  <LocalizedSubmitButton
                    k="profile.save"
                    pendingKey="profile.saving"
                    className={`${styles.control} w-full rounded-[var(--radius-control)] bg-primary px-5 py-3 font-semibold text-primary-foreground transition  hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}
                  />
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
