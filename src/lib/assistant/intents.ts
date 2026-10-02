export type AssistantIntent =
  | "find_people"
  | "find_organizations"
  | "find_businesses"
  | "find_opportunities"
  | "find_events"
  | "general";

type IntentRule = {
  intent: Exclude<AssistantIntent, "general">;
  entityType: "profile" | "organization" | "business" | "opportunity" | "event";
  keywords: string[];
};

const rules: IntentRule[] = [
  {
    intent: "find_people",
    entityType: "profile",
    keywords: [
      "member",
      "members",
      "people",
      "person",
      "professional",
      "professionals",
      "mentor",
      "mentors",
      "افراد",
      "شخص",
      "متخصص",
      "متخصصان",
      "اعضا",
      "عضو",
      "خلک",
      "غړي",
      "مسلکي",
    ],
  },
  {
    intent: "find_organizations",
    entityType: "organization",
    keywords: [
      "organization",
      "organizations",
      "nonprofit",
      "non-profit",
      "community group",
      "سازمان",
      "سازمان‌ها",
      "نهاد",
      "نهادها",
      "مؤسسه",
      "اداره",
      "ټولنه",
      "سازمانونه",
    ],
  },
  {
    intent: "find_businesses",
    entityType: "business",
    keywords: [
      "business",
      "businesses",
      "company",
      "companies",
      "service",
      "services",
      "کسب",
      "کسب‌وکار",
      "شرکت",
      "خدمات",
      "تجارت",
      "خدمت",
      "خدمتونه",
      "کاروبار",
      "کاروبارونه",
    ],
  },
  {
    intent: "find_opportunities",
    entityType: "opportunity",
    keywords: [
      "job",
      "jobs",
      "work",
      "opportunity",
      "opportunities",
      "volunteer",
      "scholarship",
      "mentorship",
      "کار",
      "شغل",
      "فرصت",
      "فرصت‌ها",
      "داوطلب",
      "بورسیه",
      "وظیفه",
      "دنده",
      "فرصتونه",
      "رضاکار",
      "رضاکارۍ",
      "بورس",
    ],
  },
  {
    intent: "find_events",
    entityType: "event",
    keywords: [
      "event",
      "events",
      "workshop",
      "workshops",
      "conference",
      "meetup",
      "gathering",
      "رویداد",
      "رویدادها",
      "رویدادهای",
      "برنامه",
      "کارگاه",
      "کارگاه‌ها",
      "کنفرانس",
      "ایونت",
      "پروګرام",
      "پروګرامونه",
      "پروګرامونو",
      "غونډه",
      "غونډې",
      "کنفرانس",
    ],
  },
];

function normalize(value: string) {
  return value
    .toLocaleLowerCase()
    .replace(/[؟?،,!.:;؛()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsKeyword(value: string, keyword: string) {
  const normalizedKeyword = normalize(keyword);
  const keywordPattern = escapeRegExp(normalizedKeyword).replace(/\s+/g, "\\s+");

  return new RegExp(
    `(^|[^\\p{L}\\p{N}_])${keywordPattern}(?=$|[^\\p{L}\\p{N}_])`,
    "u",
  ).test(value);
}

export function inferAssistantIntent(query: string): {
  intent: AssistantIntent;
  entityType?: IntentRule["entityType"];
} {
  const normalized = normalize(query);

  for (const rule of rules) {
    if (rule.keywords.some((keyword) => containsKeyword(normalized, keyword))) {
      return { intent: rule.intent, entityType: rule.entityType };
    }
  }

  return { intent: "general" };
}

export const assistantSuggestedPrompts = {
  en: [
    "Find volunteer opportunities",
    "Show me upcoming community events",
    "Find organizations that support employment",
    "Find professionals working in technology",
  ],
  fa: [
    "فرصت‌های داوطلبی را پیدا کن",
    "رویدادهای آینده جامعه را نشان بده",
    "سازمان‌های مرتبط با کاریابی را پیدا کن",
    "متخصصان حوزه تکنولوژی را پیدا کن",
  ],
  ps: [
    "د رضاکارۍ فرصتونه پیدا کړه",
    "راتلونکې ټولنیزې غونډې را وښیه",
    "د کار موندنې اړوند سازمانونه پیدا کړه",
    "د ټکنالوژۍ مسلکي کسان پیدا کړه",
  ],
} as const;
