const phrasePatterns = [
  // English intent framing.
  /^\s*(?:please\s+)?(?:find|show(?:\s+me)?|search(?:\s+for)?|look\s+for)\s+/i,
  /\b(?:similar\s+to|related\s+to)\b/gi,
  /\b(?:working\s+in|that\s+support|that\s+supports)\b/gi,
  /\b(?:people|person|members?|professionals?|mentors?|organizations?|non-?profits?|businesses?|companies|opportunities?|jobs?|events?|workshops?|conferences?)\b/gi,

  // Dari/Persian intent framing. Longer plural forms must precede stems.
  /^\s*(?:لطفاً\s+|لطفا\s+)?(?:پیدا\s+کن|نشان\s+بده|جستجو\s+کن|جست‌وجو\s+کن)\s*/i,
  /\s+(?:را\s+)?(?:پیدا\s+کن|نشان\s+بده|جستجو\s+کن|جست‌وجو\s+کن)\s*$/i,
  /(?<![\p{L}\p{N}_])(?:افراد|اشخاص|اعضا|عضو|متخصصان|متخصص|سازمان(?:\u200c?های|\u200c?ها)?|نهاد(?:\u200c?های|\u200c?ها)?|کسب‌وکار(?:\u200c?های|\u200c?ها)?|شرکت(?:\u200c?های|\u200c?ها)?|فرصت(?:\u200c?های|\u200c?ها)?|رویداد(?:\u200c?های|\u200c?ها)?|برنامه(?:\u200c?های|\u200c?ها)?)(?![\p{L}\p{N}_\u200c])/giu,
  /(?<![\p{L}\p{N}_])(?:مرتبط\s+با|مشابه\s+با|در\s+زمینه|حوزه)(?![\p{L}\p{N}_])/giu,

  // Pashto intent framing.
  /^\s*(?:مهرباني\s+وکړه\s+)?(?:پیدا\s+کړه|را\s+وښیه|وښیه)\s*/i,
  /\s+(?:پیدا\s+کړه|را\s+وښیه|وښیه)\s*$/i,
  /(?<![\p{L}\p{N}_])(?:خلک|غړي|مسلکي\s+کسان|مسلکي|سازمانونه|سازمان|کاروبارونه|کاروبار|فرصتونه|فرصت|غونډې|غونډه|پروګرامونه|پروګرام)(?![\p{L}\p{N}_])/giu,
  /(?<![\p{L}\p{N}_])(?:اړوند|ورته)(?![\p{L}\p{N}_])/giu,
];

const connectivePatterns = [
  /(?<![\p{L}\p{N}_])(?:in|at|for|to|of|the|a|an)(?![\p{L}\p{N}_])/giu,
  /(?<![\p{L}\p{N}_])(?:در|به|از)(?![\p{L}\p{N}_])/giu,
  /(?<![\p{L}\p{N}_])(?:د|په|کې)(?![\p{L}\p{N}_])/giu,
];

function cleanWhitespace(value: string) {
  return value
    .replace(/[“”"'«»]/g, " ")
    .replace(/[؟?،,!.:;؛()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function removeOrphanPersianPluralSuffix(value: string) {
  return value.replace(/(?:^|\s)\u200c?(?:ها|های)(?=\s|$)/gu, " ");
}

export function extractAssistantSearchTerms(query: string) {
  const original = cleanWhitespace(query).slice(0, 120);
  let candidate = original;

  for (const pattern of phrasePatterns) {
    candidate = candidate.replace(pattern, " ");
  }

  for (const pattern of connectivePatterns) {
    candidate = candidate.replace(pattern, " ");
  }

  candidate = cleanWhitespace(removeOrphanPersianPluralSuffix(candidate))
    .trim()
    .slice(0, 120);

  return candidate.length >= 2 ? candidate : original;
}
