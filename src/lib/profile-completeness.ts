export type ProfileCompletenessInput = {
  first_name?: string | null;
  last_name?: string | null;
  headline?: string | null;
  bio?: string | null;
  profession?: string | null;
  company?: string | null;
  city?: string | null;
  province_state?: string | null;
  country?: string | null;
  skills?: string[] | null;
  languages?: string[] | null;
  avatar_url?: string | null;
  linkedin_url?: string | null;
  website_url?: string | null;
};

export type ProfileCompletenessStep = {
  key: string;
  label: string;
  description: string;
};

const hasText = (value?: string | null) => Boolean(value?.trim());

export function getProfileCompleteness(profile: ProfileCompletenessInput | null | undefined) {
  const value = profile ?? {};
  const locationComplete = Boolean(
    hasText(value.city) || hasText(value.province_state) || hasText(value.country),
  );
  const professionalComplete = Boolean(hasText(value.profession) || hasText(value.company));
  const linksComplete = Boolean(hasText(value.linkedin_url) || hasText(value.website_url));

  const checks: Array<ProfileCompletenessStep & { complete: boolean }> = [
    {
      key: "identity",
      label: "Add your full name",
      description: "Help members recognize who they are connecting with.",
      complete: hasText(value.first_name) && hasText(value.last_name),
    },
    {
      key: "avatar",
      label: "Add a profile photo",
      description: "A photo makes your profile easier to recognize across the community.",
      complete: hasText(value.avatar_url),
    },
    {
      key: "headline",
      label: "Write a clear headline",
      description: "Summarize what you do or what you are looking for in one line.",
      complete: hasText(value.headline),
    },
    {
      key: "bio",
      label: "Introduce yourself",
      description: "A short bio gives people context before they connect or message you.",
      complete: hasText(value.bio),
    },
    {
      key: "professional",
      label: "Add your work",
      description: "Include your profession or organization so relevant people can find you.",
      complete: professionalComplete,
    },
    {
      key: "skills",
      label: "Add skills",
      description: "Skills improve discovery and make your experience easier to understand.",
      complete: Boolean(value.skills?.length),
    },
    {
      key: "location",
      label: "Add your location",
      description: "Location helps surface people, events, and opportunities around you.",
      complete: locationComplete,
    },
    {
      key: "discovery",
      label: "Add languages or a professional link",
      description: "Give members another useful signal for finding and understanding your profile.",
      complete: Boolean(value.languages?.length) || linksComplete,
    },
  ];

  const completed = checks.filter((check) => check.complete).length;
  const total = checks.length;
  const percent = Math.round((completed / total) * 100);
  const missing = checks
    .filter((check) => !check.complete)
    .map(({ key, label, description }) => ({ key, label, description }));

  return {
    completed,
    total,
    percent,
    missing,
    complete: completed === total,
  };
}
