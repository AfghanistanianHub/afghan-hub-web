export type MemberRecommendationProfile = {
  city?: string | null;
  country?: string | null;
  profession?: string | null;
  skills?: string[] | null;
};

export type MemberRecommendationCandidate = {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  headline: string | null;
  profession: string | null;
  company: string | null;
  city: string | null;
  country: string | null;
  avatar_url: string | null;
  skills: string[] | null;
};

export type RecommendedMember = MemberRecommendationCandidate & {
  relevanceScore: number;
  reason: string | null;
};

function normalize(value?: string | null) {
  return value?.trim().toLocaleLowerCase() ?? "";
}

function getSharedSkills(
  profileSkills: string[] | null | undefined,
  candidateSkills: string[] | null | undefined,
) {
  const profileSet = new Set((profileSkills ?? []).map(normalize).filter(Boolean));
  return (candidateSkills ?? []).filter((skill) => profileSet.has(normalize(skill)));
}

export function rankMemberRecommendations(
  profile: MemberRecommendationProfile | null | undefined,
  candidates: MemberRecommendationCandidate[],
  limit = 3,
): RecommendedMember[] {
  const current = profile ?? {};

  return candidates
    .map((candidate, index) => {
      let relevanceScore = 0;
      const sharedSkills = getSharedSkills(current.skills, candidate.skills);
      const sameCity = Boolean(
        normalize(current.city) && normalize(current.city) === normalize(candidate.city),
      );
      const sameCountry = Boolean(
        normalize(current.country) &&
          normalize(current.country) === normalize(candidate.country),
      );
      const sameProfession = Boolean(
        normalize(current.profession) &&
          normalize(current.profession) === normalize(candidate.profession),
      );

      if (sameCity) relevanceScore += 6;
      else if (sameCountry) relevanceScore += 3;

      if (sameProfession) relevanceScore += 5;
      relevanceScore += Math.min(sharedSkills.length * 2, 6);

      let reason: string | null = null;
      if (sharedSkills.length > 0) reason = `Shared skill: ${sharedSkills[0]}`;
      else if (sameProfession && candidate.profession) reason = `Also in ${candidate.profession}`;
      else if (sameCity && candidate.city) reason = `Also in ${candidate.city}`;
      else if (sameCountry && candidate.country) reason = `Also in ${candidate.country}`;

      return { ...candidate, relevanceScore, reason, index };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore || a.index - b.index)
    .slice(0, limit)
    .map(({ index: _index, ...candidate }) => candidate);
}
