type ProfileSignals = {
  headline?: string | null;
  profession?: string | null;
  city?: string | null;
  province_state?: string | null;
  country?: string | null;
  skills?: string[] | null;
};

type OpportunityCandidate = {
  title: string;
  summary?: string | null;
  type?: string | null;
  city?: string | null;
  province_state?: string | null;
  country?: string | null;
  is_remote?: boolean | null;
  created_at?: string | null;
};

type EventCandidate = {
  title: string;
  summary?: string | null;
  city?: string | null;
  province_state?: string | null;
  country?: string | null;
  is_online?: boolean | null;
  starts_at: string;
};

function normalize(value?: string | null) {
  return value?.trim().toLocaleLowerCase() ?? "";
}

function termsFromValues(values: Array<string | null | undefined>, limit = 16) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => normalize(value).split(/[^\p{L}\p{N}+#.]+/u))
        .filter((term) => term.length >= 3),
    ),
  ).slice(0, limit);
}

function profileTerms(profile: ProfileSignals | null | undefined) {
  return termsFromValues([
    profile?.profession,
    profile?.headline,
    ...(profile?.skills ?? []),
  ]);
}

function opportunityTerms(opportunity: OpportunityCandidate) {
  return termsFromValues([
    opportunity.title,
    opportunity.summary,
    opportunity.type,
  ]);
}

function textMatchScore(text: string, terms: string[]) {
  const haystack = normalize(text);
  if (!haystack) return 0;

  return terms.reduce(
    (score, term) => score + (haystack.includes(term) ? 1 : 0),
    0,
  );
}

function locationScore(
  profile: ProfileSignals | null | undefined,
  candidate: {
    city?: string | null;
    province_state?: string | null;
    country?: string | null;
  },
) {
  const profileCity = normalize(profile?.city);
  const profileProvince = normalize(profile?.province_state);
  const profileCountry = normalize(profile?.country);

  if (profileCity && profileCity === normalize(candidate.city)) return 5;
  if (
    profileProvince &&
    profileProvince === normalize(candidate.province_state)
  ) {
    return 3;
  }
  if (profileCountry && profileCountry === normalize(candidate.country)) return 2;
  return 0;
}

function opportunityLocationScore(
  source: OpportunityCandidate,
  candidate: OpportunityCandidate,
) {
  const sourceCity = normalize(source.city);
  const sourceProvince = normalize(source.province_state);
  const sourceCountry = normalize(source.country);

  if (sourceCity && sourceCity === normalize(candidate.city)) return 4;
  if (
    sourceProvince &&
    sourceProvince === normalize(candidate.province_state)
  ) {
    return 3;
  }
  if (sourceCountry && sourceCountry === normalize(candidate.country)) return 2;
  if (source.is_remote && candidate.is_remote) return 1;
  return 0;
}

export function rankOpportunityRecommendations<T extends OpportunityCandidate>(
  profile: ProfileSignals | null | undefined,
  opportunities: T[],
  limit = 3,
) {
  const terms = profileTerms(profile);

  return opportunities
    .map((opportunity, index) => {
      const titleMatches = textMatchScore(opportunity.title, terms);
      const summaryMatches = textMatchScore(opportunity.summary ?? "", terms);
      const typeMatches = textMatchScore(opportunity.type ?? "", terms);
      const score =
        locationScore(profile, opportunity) +
        titleMatches * 4 +
        summaryMatches * 2 +
        typeMatches * 2 +
        (opportunity.is_remote ? 1 : 0);

      return { opportunity, score, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ opportunity }) => opportunity);
}

export function rankRelatedOpportunities<T extends OpportunityCandidate>(
  source: OpportunityCandidate,
  opportunities: T[],
  limit = 3,
) {
  const terms = opportunityTerms(source);
  const sourceType = normalize(source.type);

  return opportunities
    .map((opportunity, index) => {
      const titleMatches = textMatchScore(opportunity.title, terms);
      const summaryMatches = textMatchScore(opportunity.summary ?? "", terms);
      const sameType = sourceType && sourceType === normalize(opportunity.type) ? 1 : 0;
      const score =
        sameType * 6 +
        opportunityLocationScore(source, opportunity) +
        titleMatches * 3 +
        summaryMatches * 2;

      return { opportunity, score, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ opportunity }) => opportunity);
}

export function rankEventRecommendations<T extends EventCandidate>(
  profile: ProfileSignals | null | undefined,
  events: T[],
  limit = 3,
) {
  const terms = profileTerms(profile);

  return events
    .map((event, index) => {
      const titleMatches = textMatchScore(event.title, terms);
      const summaryMatches = textMatchScore(event.summary ?? "", terms);
      const score =
        locationScore(profile, event) +
        titleMatches * 3 +
        summaryMatches * 2 +
        (event.is_online ? 1 : 0);

      return { event, score, index };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const byTime =
        new Date(a.event.starts_at).getTime() -
        new Date(b.event.starts_at).getTime();
      return byTime || a.index - b.index;
    })
    .slice(0, limit)
    .map(({ event }) => event);
}
