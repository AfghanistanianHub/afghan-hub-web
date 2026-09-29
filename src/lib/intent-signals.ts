import type { IntentDiscoveryCandidate } from "./intent-discovery";

export function memberIntentCandidate(
  id: string,
  signals?: { openToMentoring?: boolean; lookingForMentor?: boolean },
): IntentDiscoveryCandidate {
  return {
    id,
    entityType: "member",
    openToMentoring: signals?.openToMentoring ?? false,
    lookingForMentor: signals?.lookingForMentor ?? false,
  };
}

export function businessIntentCandidate(
  id: string,
  signals?: { isHiring?: boolean },
): IntentDiscoveryCandidate {
  return {
    id,
    entityType: "business",
    isHiring: signals?.isHiring ?? false,
  };
}

export function organizationIntentCandidate(
  id: string,
  signals?: { acceptsVolunteers?: boolean },
): IntentDiscoveryCandidate {
  return {
    id,
    entityType: "organization",
    acceptsVolunteers: signals?.acceptsVolunteers ?? false,
  };
}

export function opportunityIntentCandidate(
  id: string,
  type?: string | null,
): IntentDiscoveryCandidate {
  return {
    id,
    entityType: "opportunity",
    isWorkOpportunity: type === "job",
    isVolunteerOpportunity: type === "volunteer",
  };
}

export function eventIntentCandidate(id: string): IntentDiscoveryCandidate {
  return { id, entityType: "event" };
}
