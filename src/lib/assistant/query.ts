const phrasePatterns = [
  // English intent framing.
  /^\s*(?:please\s+)?(?:find|show|search(?:\s+for)?|look\s+for)\s+/i,
  /\b(?:similar\s+to|related\s+to)\b/gi,
  /\b(?:working\s+in|that\s+support|that\s+supports)\b/gi,
  /\b(?:people|person|members?|professionals?|mentors?|organizations?|non-?profits?|businesses?|companies|opportunities?|jobs?|events?|workshops?|conferences?)\b/gi,

  // Dari/Persian intent framing.
  /^\s*(?:لطفاً\s+|لطفا\s+)?(?:پیدا\s+کن|نشان\s+بده|جستجو\s+کن|جست‌وجو\s+کن)\s*/i,
  /\s+(?:را\s+)?(?:پیدا\s+کن|نشان\s+بده|جستجو\s+کن|جست‌وجو\s+کن)\s*$/i,
  /(?<![\p{L}\p{N}_])(?:افراد|اشخاص|اعضا|عضو|متخصصان|متخصص|سازمان‌ها|سازمان|نهادها|نهاد|کسب‌وکارها|کسب‌وکار|شرکت‌ها|شرکت|فرصت‌ها|فرصت|رویدادها|رویداد|برنامه‌ها|برنامه)(?![\p{L}\p{N}_])/giu,
  /(?<![\p{L}\p{N}_])(?:مرتبط\s+با|مشابه\s+با|در\s+زمینه|حوزه)(?![\p{L}\p{N}_])/giu,

  // Pashto intent framing.
  /^\s*(?:مهرباني\s+وکړه\s+)?(?:پیدا\s+کړه|را\s+وښیه|وښیه)\s*/i,
  /\s+(?:پیدا\s+کړه|را\s+وښیه|وښیه)\s*$/i,
  /(?<![\p{L}\p{N}_])(?:خلک|غړي|مسلکي\s+کسان|مسلکي|سازمانونه|سازمان|کاروبارونه|کاروبار|فرصتونه|فرصت|غونډې|غونډه|پروګرامونه|پروګرام)(?![\p{L}\p{N}_])/giu,
  /(?<![\p{L}\p{N}_])(?:اړوند|ورته)(?![\p{L}\p{N}_])/giu,
];

function cleanWhitespace(value: string) {
  return value
    .replace(/[“”"'«»]/g, " ")
    .replace(/[؟?،,!.:;؛()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractAssistantSearchTerms(query: string) {
  const original = cleanWhitespace(query).slice(0, 120);
  let candidate = original;

  for (const pattern of phrasePatterns) {
    candidate = candidate.replace(pattern, " ");
  }

  candidate = cleanWhitespace(candidate)
    .replace(/^(?:in|at|for|to|of|the|a|an)\s+/i, "")
    .trim()
    .slice(0, 120);

  return candidate.length >= 2 ? candidate : original;
}
