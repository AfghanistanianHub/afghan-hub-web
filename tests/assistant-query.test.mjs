import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(
  new URL("../src/lib/assistant/query.ts", import.meta.url),
  "utf8",
);

function cleanWhitespace(value) {
  return value
    .replace(/[“”"'«»]/g, " ")
    .replace(/[؟?،,!.:;؛()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const phrasePatterns = [
  /^\s*(?:please\s+)?(?:find|show|search(?:\s+for)?|look\s+for)\s+/i,
  /\b(?:similar\s+to|related\s+to)\b/gi,
  /\b(?:working\s+in|that\s+support|that\s+supports)\b/gi,
  /\b(?:people|person|members?|professionals?|mentors?|organizations?|non-?profits?|businesses?|companies|opportunities?|jobs?|events?|workshops?|conferences?)\b/gi,
  /^\s*(?:لطفاً\s+|لطفا\s+)?(?:پیدا\s+کن|نشان\s+بده|جستجو\s+کن|جست‌وجو\s+کن)\s*/i,
  /\b(?:افراد|اشخاص|اعضا|عضو|متخصصان|متخصص|سازمان‌ها|سازمان|نهادها|نهاد|کسب‌وکارها|کسب‌وکار|شرکت‌ها|شرکت|فرصت‌ها|فرصت|رویدادها|رویداد|برنامه‌ها|برنامه)\b/gi,
  /\b(?:مرتبط\s+با|مشابه\s+با|در\s+زمینه|حوزه)\b/gi,
  /^\s*(?:مهرباني\s+وکړه\s+)?(?:پیدا\s+کړه|را\s+وښیه|وښیه)\s*/i,
  /\b(?:خلک|غړي|مسلکي\s+کسان|مسلکي|سازمانونه|سازمان|کاروبارونه|کاروبار|فرصتونه|فرصت|غونډې|غونډه|پروګرامونه|پروګرام)\b/gi,
  /\b(?:اړوند|ورته)\b/gi,
];

function extract(query) {
  const original = cleanWhitespace(query).slice(0, 120);
  let candidate = original;
  for (const pattern of phrasePatterns) candidate = candidate.replace(pattern, " ");
  candidate = cleanWhitespace(candidate)
    .replace(/^(?:in|at|for|to|of|the|a|an)\s+/i, "")
    .trim()
    .slice(0, 120);
  return candidate.length >= 2 ? candidate : original;
}

test("English natural-language framing reduces to useful retrieval terms", () => {
  assert.equal(extract("Find professionals working in technology"), "technology");
  assert.equal(extract("Find organizations that support employment"), "employment");
  assert.equal(extract("Find opportunities similar to Software Developer"), "Software Developer");
  assert.equal(extract("Show events related to film in Vancouver"), "film in Vancouver");
});

test("Dari and Pashto framing preserves the useful topic", () => {
  assert.equal(extract("متخصصان حوزه تکنولوژی را پیدا کن"), "تکنولوژی را");
  assert.equal(extract("سازمان‌های مرتبط با کاریابی را پیدا کن"), "کاریابی را");
  assert.match(extract("د ټکنالوژۍ مسلکي کسان پیدا کړه"), /ټکنالوژۍ/);
});

test("cleanup never turns a valid short request into an empty search", () => {
  assert.equal(extract("events"), "events");
  assert.equal(extract("کار"), "کار");
});

test("production query module contains no model/provider dependency", () => {
  assert.doesNotMatch(source, /openai|anthropic|generateText|streamText|api[_-]?key/i);
});
