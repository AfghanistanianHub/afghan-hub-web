import { inferAssistantIntent, type AssistantMemberSignal } from "./intents";
import { extractAssistantSearchTerms, mentorshipQualifier } from "./query";
import type { AssistantEntityType } from "./search";

export type NavigatorContext = {
  topic: string;
  city?: string;
  entityType?: AssistantEntityType;
  memberSignal?: AssistantMemberSignal;
};

const clean = (value: string) => value.replace(/[“”"'«»؟?،,!.:;؛()[\]{}]/g, " ").replace(/\s+/g, " ").trim();

// Explicit refinements only: the context carries search filters, never facts
// about members, inferred preferences, or a generated conversation transcript.
export function resolveNavigatorContext(query: string, previous?: NavigatorContext): NavigatorContext {
  const input = clean(query).slice(0, 120);
  const inferred = inferAssistantIntent(input);
  const explicitCategoryOnly =
    /^(?:only|just|فقط|تنها|یوازې)\s+(?:events?|opportunities|organizations|businesses|people|mentors?|mentees?|رویدادها|فرصت‌ها|سازمان‌ها|کسب‌وکارها|افراد|منتورها|مربیان|غونډې|فرصتونه|سازمانونه|کاروبارونه|خلک|لارښودان)\s*$/iu.test(input);

  // Resolve category refinements before the generic “Only X” city shortcut.
  // Otherwise “Only events” is interpreted as a city named “events”.
  if (previous && explicitCategoryOnly && inferred.entityType) {
    return {
      topic: previous.topic,
      city: previous.city,
      entityType: inferred.entityType,
      memberSignal: inferred.entityType === "profile" ? inferred.memberSignal : undefined,
    };
  }

  const onlyCity = input.match(/^(?:only|just|فقط|تنها|یوازې)\s+(.+)$/iu);
  if (onlyCity && previous) return { ...previous, city: onlyCity[1].slice(0, 60) };
  if (/^(?:anywhere|all locations|هر جا|همه جا|هر ځای)$/iu.test(input) && previous) {
    return { ...previous, city: undefined };
  }
  const additive = /(?:\b(?:too|also|as well)\b|(?:^|\s)هم(?:\s|$))/iu.test(input);
  const stripped = input.replace(/\b(?:too|also|as well)\b/giu, " ").replace(/(?:^|\s)هم(?=\s|$)/gu, " ").trim();
  const terms = extractAssistantSearchTerms(stripped, { allowEmpty: true });
  const categoryOnly = terms.toLocaleLowerCase() === stripped.toLocaleLowerCase() &&
    /^(?:show(?: me)?|find|را وښیه|نشان بده)?\s*(?:events?|opportunities|organizations|businesses|people|mentors?|رویدادها|فرصت‌ها|سازمان‌ها|غونډې|خلک)\s*$/iu.test(stripped);
  if (previous && additive && inferred.entityType && (categoryOnly || terms.length === 0)) {
    return { topic: previous.topic, city: previous.city, entityType: inferred.entityType, memberSignal: inferred.memberSignal };
  }

  // Recognize explicit location wording without maintaining a guessed city list.
  const cityMatch = input.match(/\b(?:moved to|near)\s+([\p{L}][\p{L} '-]{1,59}?)(?=\s+(?:and|for)\b|$)/iu)
    ?? input.match(/\b[Ii]n\s+(\p{Lu}[\p{L} '-]{1,59}?)(?=\s+(?:and|for)\b|$)/u);
  let topicInput = cityMatch ? input.replace(cityMatch[0], " ") : input;
  topicInput = topicInput
    .replace(/^i\s+(?:recently\s+)?/iu, " ")
    .replace(/^\s*(?:please\s+)?(?:find|show(?:\s+me)?|search(?:\s+for)?|look\s+for)(?:\s+|$)/iu, " ")
    .replace(/\b(?:a|an|the)\s+(?=mentors?\b)/giu, " ")
    // Conversational audience framing is not a professional topic. Keep explicit
    // skill wording and standalone names/initials intact for mentor ranking.
    .replace(/\b(?:people|professionals?|members?)\s+(?:in|working\s+in)\s+/giu, " ")
    .replace(/\b(?:mentors?|mentees?)\b/giu, " ")
    .replace(/(?<![\p{L}\p{N}_])(?:منتور|منتورها|مربی|مربیان|لارښود|لارښودان)(?![\p{L}\p{N}_])/gu, " ");
  if (/moved to|looking for|someone who/iu.test(input)) {
    topicInput = topicInput.replace(/\b(?:and|i'm|i m|i am|looking for|maybe|someone who could|someone|who could|me)\b/giu, " ");
  }
  const cleaned = clean(topicInput);
  const extracted = cleaned ? extractAssistantSearchTerms(cleaned, { allowEmpty: true }) : "";
  const generic = /^(?:find|show(?: me)?|پیدا کن|نشان بده|پیدا کړه|را وښیه|وښیه)$/iu.test(extracted);
  return {
    topic: inferred.memberSignal ? (mentorshipQualifier(cleaned) ? (/\b(?:skilled|skills?|topics?)\b/iu.test(cleaned) ? cleaned : extracted || cleaned).slice(0, 120) : "") : generic ? "" : extracted.slice(0, 120),
    city: cityMatch?.[1].trim(),
    entityType: inferred.entityType,
    memberSignal: inferred.memberSignal,
  };
}

export function navigatorSearchQuery(context: NavigatorContext) {
  const role = context.memberSignal === "open_to_mentoring" ? "mentor" : context.memberSignal === "looking_for_mentor" ? "mentee" : "";
  return clean([role, context.topic, role ? "" : context.city].filter(Boolean).join(" ")).slice(0, 120);
}
