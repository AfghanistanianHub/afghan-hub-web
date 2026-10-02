export type DiscoveryIntent =
  | "find_work"
  | "hire_talent"
  | "find_mentor"
  | "offer_mentorship"
  | "collaborate"
  | "find_funding"
  | "volunteer"
  | "find_services"
  | "join_community";

export const phaseOneSearchIntents = [
  { value: "find_work", label: "Find work" },
  { value: "hire_talent", label: "Find talent" },
  { value: "find_mentor", label: "Find a mentor" },
  { value: "offer_mentorship", label: "Offer mentorship" },
  { value: "volunteer", label: "Volunteer" },
  { value: "find_services", label: "Find services" },
  { value: "join_community", label: "Join community activity" },
] as const satisfies ReadonlyArray<{ value: DiscoveryIntent; label: string }>;

export type PhaseOneSearchIntent =
  (typeof phaseOneSearchIntents)[number]["value"];

export function getPhaseOneSearchIntent(
  value?: string,
): PhaseOneSearchIntent | null {
  return phaseOneSearchIntents.some((option) => option.value === value)
    ? (value as PhaseOneSearchIntent)
    : null;
}

export type DiscoveryEntityType =
  | "member"
  | "business"
  | "organization"
  | "opportunity"
  | "event";

export type IntentDiscoveryCandidate = {
  id: string;
  entityType: DiscoveryEntityType;
  openToMentoring?: boolean;
  lookingForMentor?: boolean;
  isHiring?: boolean;
  openToCollaboration?: boolean;
  isWorkOpportunity?: boolean;
  acceptsVolunteers?: boolean;
  isVolunteerOpportunity?: boolean;
  isFundingOpportunity?: boolean;
};

export type RankedIntentCandidate<T extends IntentDiscoveryCandidate> = T & {
  intentScore: number;
  intentReason: string | null;
};

function scoreCandidate(
  intent: DiscoveryIntent,
  candidate: IntentDiscoveryCandidate,
): { score: number; reason: string | null } {
  switch (intent) {
    case "find_work":
      if (candidate.entityType === "opportunity" && candidate.isWorkOpportunity) {
        return { score: 12, reason: "Matches your work goal" };
      }
      if (
        (candidate.entityType === "business" ||
          candidate.entityType === "organization") &&
        candidate.isHiring
      ) {
        return { score: 10, reason: "Currently hiring" };
      }
      return { score: 0, reason: null };
    case "hire_talent":
      return candidate.entityType === "member"
        ? { score: 12, reason: "Member discovery for your hiring goal" }
        : { score: 0, reason: null };
    case "find_mentor":
      return candidate.entityType === "member" && candidate.openToMentoring
        ? { score: 14, reason: "Open to mentoring" }
        : { score: 0, reason: null };
    case "offer_mentorship":
      return candidate.entityType === "member" && candidate.lookingForMentor
        ? { score: 14, reason: "Looking for a mentor" }
        : { score: 0, reason: null };
    case "collaborate":
      return (candidate.entityType === "member" ||
        candidate.entityType === "organization") &&
        candidate.openToCollaboration
        ? { score: 12, reason: "Open to collaboration" }
        : { score: 0, reason: null };
    case "find_funding":
      return candidate.entityType === "opportunity" &&
        candidate.isFundingOpportunity
        ? { score: 14, reason: "Matches your funding goal" }
        : { score: 0, reason: null };
    case "volunteer":
      if (
        candidate.entityType === "opportunity" &&
        candidate.isVolunteerOpportunity
      ) {
        return { score: 14, reason: "Volunteer opportunity" };
      }
      return candidate.entityType === "organization" &&
        candidate.acceptsVolunteers
        ? { score: 12, reason: "Accepting volunteers" }
        : { score: 0, reason: null };
    case "find_services":
      return candidate.entityType === "business"
        ? { score: 12, reason: "Business relevant to your services goal" }
        : { score: 0, reason: null };
    case "join_community":
      if (candidate.entityType === "organization") {
        return { score: 12, reason: "Community organization" };
      }
      return candidate.entityType === "event"
        ? { score: 10, reason: "Upcoming community activity" }
        : { score: 0, reason: null };
  }
}

export function rankIntentCandidates<T extends IntentDiscoveryCandidate>(
  intent: DiscoveryIntent | null | undefined,
  candidates: T[],
  limit = candidates.length,
): RankedIntentCandidate<T>[] {
  if (!intent) {
    return candidates.slice(0, limit).map((candidate) => ({
      ...candidate,
      intentScore: 0,
      intentReason: null,
    }));
  }

  return candidates
    .map((candidate, index) => {
      const { score, reason } = scoreCandidate(intent, candidate);
      return { candidate, score, reason, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ candidate, score, reason }) => ({
      ...candidate,
      intentScore: score,
      intentReason: reason,
    }));
}


function getBrowseSourceTypes(
  intent: PhaseOneSearchIntent,
): [DiscoveryEntityType, DiscoveryEntityType] | null {
  switch (intent) {
    case "find_work":
      return ["opportunity", "business"];
    case "volunteer":
      return ["opportunity", "organization"];
    case "join_community":
      return ["organization", "event"];
    case "hire_talent":
    case "find_mentor":
    case "offer_mentorship":
    case "find_services":
      return null;
  }
}

export function limitIntentBrowseCandidates<
  T extends RankedIntentCandidate<IntentDiscoveryCandidate>,
>(
  intent: PhaseOneSearchIntent,
  candidates: T[],
  limit: number,
): T[] {
  const sourceTypes = getBrowseSourceTypes(intent);

  if (!sourceTypes || candidates.length <= limit) {
    return candidates.slice(0, limit);
  }

  const [primaryType, secondaryType] = sourceTypes;
  const primary = candidates.filter(
    (candidate) => candidate.entityType === primaryType,
  );
  const secondary = candidates.filter(
    (candidate) => candidate.entityType === secondaryType,
  );

  if (primary.length === 0 || secondary.length === 0) {
    return candidates.slice(0, limit);
  }

  const reservedPerSource = Math.floor(limit / 2);
  const selected = [
    ...primary.slice(0, reservedPerSource),
    ...secondary.slice(0, reservedPerSource),
  ];
  const selectedIds = new Set(selected.map((candidate) => candidate.id));

  for (const candidate of candidates) {
    if (selected.length >= limit) {
      break;
    }

    if (!selectedIds.has(candidate.id)) {
      selected.push(candidate);
      selectedIds.add(candidate.id);
    }
  }

  return selected;
}
