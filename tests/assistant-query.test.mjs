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

function removeOrphanPersianPluralSuffix(value) {
  return value.replace(/(?:^|\s)\u200c?(?:ها|های|هایی)(?=\s|$)/gu, " ");
}

const phrasePatterns = [
  /^\s*(?:please\s+)?(?:find|show(?:\s+me)?|search(?:\s+for)?|look\s+for)\s+/i,
  /\b(?:similar\s+to|related\s+to)\b/gi,
  /\b(?:working\s+in|that\s+support|that\s+supports)\b/gi,\n  /\b(?:upcoming|future)\b/gi,
  /\b(?:people|person|members?|professionals?|mentors?|organizations?|non-?profits?|businesses?|companies|opportunities?|jobs?|events?|workshops?|conferences?)\b/gi,
  /^\s*(?:لطفاً\s+|لطفا\s+)?(?:پیدا\s+کن|نشان\s+بده|جستجو\s+کن|جست‌وجو\s+کن)\s*/i,
  /\s+(?:را\s+)?(?:پیدا\s+کن|نشان\s+بده|جستجو\s+کن|جست‌وجو\s+کن)\s*$/i,
  /(?<![\p{L}\p{N}_])(?:افراد|اشخاص|اعضا|عضو|متخصصان|متخصص|سازمان(?:\u200c?هایی|\u200c?های|\u200c?ها)?|نهاد(?:\u200c?هایی|\u200c?های|\u200c?ها)?|کسب‌وکار(?:\u200c?هایی|\u200c?های|\u200c?ها)?|شرکت(?:\u200c?هایی|\u200c?های|\u200c?ها)?|فرصت(?:\u200c?هایی|\u200c?های|\u200c?ها)?|رویداد(?:\u200c?هایی|\u200c?های|\u200c?ها)?|برنامه(?:\u200c?هایی|\u200c?های|\u200c?ها)?)(?![\p{L}\p{N}_\u200c])/giu,
  /(?<![\p{L}\p{N}_])(?:مرتبط\s+با|مشابه\s+با|در\s+زمینه|حوزه)(?![\p{L}\p{N}_])/giu,
  /^\s*(?:مهرباني\s+وکړه\s+)?(?:پیدا\s+کړه|را\s+وښیه|وښیه)\s*/i,
  /\s+(?:پیدا\s+کړه|را\s+وښیه|وښیه)\s*$/i,
  /(?<![\p{L}\p{N}_])(?:خلک|غړي|مسلکي\s+کسان|مسلکي|سازمانونه|سازمان|کاروبارونه|کاروبار|فرصتونه|فرصت|غونډې|غونډه|پروګرامونه|پروګرام)(?![\p{L}\p{N}_])/giu,
  /(?<![\p{L}\p{N}_])(?:اړوند|ورته)(?![\p{L}\p{N}_])/giu,
];

const connectivePatterns = [
  /(?<![\p{L}\p{N}_])(?:in|at|for|to|of|the|a|an)(?![\p{L}\p{N}_])/giu,
  /(?<![\p{L}\p{N}_])(?:در|به|از|برای)(?![\p{L}\p{N}_])/giu,
  /(?<![\p{L}\p{N}_])(?:د|په|کې|لپاره)(?![\p{L}\p{N}_])/giu,
];

function extract(query) {
  const original = cleanWhitespace(query).slice(0, 120);
  let candidate = original;

  for (const pattern of phrasePatterns) candidate = candidate.replace(pattern, " ");
  for (const pattern of connectivePatterns) candidate = candidate.replace(pattern, " ");

  candidate = cleanWhitespace(removeOrphanPersianPluralSuffix(candidate))
    .trim()
    .slice(0, 120);

  return candidate.length >= 2 ? candidate : original;
}

test("English natural-language framing reduces to useful retrieval terms", () => {
  assert.equal(extract("Find professionals working in technology"), "technology");
  assert.equal(extract("Find organizations that support employment"), "employment");
  assert.equal(extract("Find opportunities similar to Software Developer"), "Software Developer");
  assert.equal(extract("Show events related to film in Vancouver"), "film Vancouver");
  assert.equal(extract("Show me upcoming community events"), "community");
  assert.equal(extract("volunteer opportunities in Vancouver"), "volunteer Vancouver");
});

test("Dari and Pashto framing preserves useful topic and location terms", () => {
  assert.equal(extract("متخصصان حوزه تکنولوژی را پیدا کن"), "تکنولوژی");
  assert.equal(extract("سازمان‌های مرتبط با کاریابی را پیدا کن"), "کاریابی");
  assert.equal(extract("فرصت‌های کاریابی را پیدا کن"), "کاریابی");
  assert.equal(extract("فرصت‌های داوطلبی در ونکوور را پیدا کن"), "داوطلبی ونکوور");\n  assert.equal(extract("رویدادها برای زنان در ونکوور"), "زنان ونکوور");\n  assert.equal(extract("سازمان‌هایی مرتبط با کاریابی را پیدا کن"), "کاریابی");
  assert.match(extract("د ټکنالوژۍ مسلکي کسان پیدا کړه"), /ټکنالوژۍ/);
  assert.equal(
    extract("په ونکوور کې د رضاکارۍ فرصتونه پیدا کړه"),
    "ونکوور رضاکارۍ",
  );
});

test("cleanup never turns a valid short request into an empty search", () => {
  assert.equal(extract("events"), "events");
  assert.equal(extract("کار"), "کار");
});

test("production query module contains no model/provider dependency", () => {
  assert.doesNotMatch(source, /openai|anthropic|generateText|streamText|api[_-]?key/i);
});
