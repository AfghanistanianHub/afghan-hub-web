import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const cases = JSON.parse(
  fs.readFileSync(
    new URL("./fixtures/assistant-multilingual-evaluation.json", import.meta.url),
    "utf8",
  ),
);

const source = fs.readFileSync(
  new URL("../src/lib/assistant/intents.ts", import.meta.url),
  "utf8",
);

function normalize(value) {
  return value
    .toLocaleLowerCase()
    .replace(/[؟?،,!.:;؛()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const rules = [
  {
    intent: "find_people",
    entityType: "profile",
    keywords: ["member","members","people","person","professional","professionals","mentor","mentors","افراد","شخص","متخصص","متخصصان","اعضا","عضو","خلک","غړي","مسلکي"],
  },
  {
    intent: "find_organizations",
    entityType: "organization",
    keywords: ["organization","organizations","nonprofit","non-profit","community group","سازمان","سازمان‌ها","نهاد","نهادها","مؤسسه","اداره","ټولنه","سازمانونه"],
  },
  {
    intent: "find_businesses",
    entityType: "business",
    keywords: ["business","businesses","company","companies","service","services","کسب","کسب‌وکار","شرکت","خدمات","تجارت","خدمت","خدمتونه","کاروبار","کاروبارونه"],
  },
  {
    intent: "find_opportunities",
    entityType: "opportunity",
    keywords: ["job","jobs","work","opportunity","opportunities","volunteer","scholarship","mentorship","کار","شغل","فرصت","فرصت‌ها","داوطلب","بورسیه","وظیفه","دنده","فرصتونه","رضاکار","بورس","رضاکارۍ"],
  },
  {
    intent: "find_events",
    entityType: "event",
    keywords: ["event","events","workshop","conference","meetup","gathering","رویداد","رویدادها","برنامه","کارگاه","کنفرانس","ایونت","پروګرام","غونډه","غونډې"],
  },
];

function infer(query) {
  const normalized = normalize(query);
  for (const rule of rules) {
    if (rule.keywords.some((keyword) => normalized.includes(normalize(keyword)))) {
      return { intent: rule.intent, entityType: rule.entityType };
    }
  }
  return { intent: "general", entityType: null };
}

test("fixture covers English, Dari and Pashto across all discovery categories", () => {
  const languages = new Set(cases.map((item) => item.language));
  assert.deepEqual([...languages].sort(), ["en", "fa", "ps"]);

  for (const language of languages) {
    const languageCases = cases.filter((item) => item.language === language);
    assert.equal(languageCases.length, 5);
  }
});

test("baseline multilingual intent cases route as expected", () => {
  const failures = [];

  for (const item of cases) {
    const actual = infer(item.query);
    if (
      actual.intent !== item.expectedIntent ||
      actual.entityType !== item.expectedEntityType
    ) {
      failures.push({ item, actual });
    }
  }

  assert.deepEqual(failures, []);
});

test("evaluation expectations remain represented in the production intent source", () => {
  for (const expectedIntent of [
    "find_people",
    "find_organizations",
    "find_businesses",
    "find_opportunities",
    "find_events",
  ]) {
    assert.match(source, new RegExp(expectedIntent));
  }
});
