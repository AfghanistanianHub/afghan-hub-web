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
const topicAlias = (value: string) => /^(?:arts?|artists?|هنر|هنرمند|هنرمندان)$/iu.test(value) ? "arts" : /^(?:tech|technology|تکنالوژی|فناوری|ټکنالوژي)$/iu.test(value) ? "technology" : value;

// Explicit refinements only: the context carries search filters, never facts
// about members, inferred preferences, or a generated conversation transcript.
export function resolveNavigatorContext(query: string, previous?: NavigatorContext): NavigatorContext {
  const input = clean(query).slice(0, 120);
  const inferred = inferAssistantIntent(input);
  const newGoal = /\b(?:actually|instead|rather)\b|در واقع|به جای|پر ځای|په حقیقت/u.test(input);
  if (newGoal) previous = undefined;
  // These are discovery goals, not search terms. Never search the entire
  // sentence ("I'm new ... want to meet") as an AND query against the catalogue.
  const artistGoal = /\b(?:artist|artists|creative|creatives)\b.*\b(?:collaborat|connect|looking)|هنرمند.*(?:همکار|همکاری)|هنرمند.*(?:همکار|ملګري)/iu.test(input);
  const socialGoal = /\b(?:meet people|meet new people)\b|(?:آشنا|آشنایی|اشنا).*افراد|افراد.*(?:آشنا|آشنایی|اشنا)|خل[کو].*(?:اشنا|وپېژنم|پېژند)/iu.test(input);
  const jobGoal = /\b(?:need|looking for|find)\b.*\bjobs?\b|(?:شغل|وظیفه|دنده).*(?:می‌خواهم|میخواهم|غواړم|پیدا)|(?:دنبال|نیاز).*شغل/u.test(input);
  if (artistGoal || socialGoal || jobGoal) {
    const place = input.match(/\b(?:in|near|to)\s+(North Vancouver|Vancouver)\b/iu)?.[1]
      ?? input.match(/(?:در|په)\s+((?:شمال|شمالي)\s+ونکوور|ونکوور)/u)?.[1];
    return { topic: jobGoal ? "job" : artistGoal ? "arts" : "", city: place, entityType: jobGoal ? "opportunity" : "profile" };
  }
  if (previous && topicAlias(input) !== input) return { ...previous, topic: topicAlias(input) };
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
  // A short answer to a topic question refines the current goal. Explicit new
  // goals/categories still take the independent-request path below.
  if (previous && !inferred.entityType && !newGoal && input.split(/\s+/u).length <= 3) {
    return { ...previous, topic: topicAlias(extractAssistantSearchTerms(input, { allowEmpty: true })) };
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
