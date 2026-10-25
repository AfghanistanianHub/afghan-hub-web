import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  browseCopy,
  getBrowseCopy,
  memberActionErrorKey,
} from "../src/lib/i18n/browse-copy.ts";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const memberPage = read("src/app/(dashboard)/members/[id]/page.tsx");
const languages = ["en", "fa", "ps"];

const memberKeys = [
  "member.back",
  "member.fallbackName",
  "member.profile",
  "member.about",
  "member.bioEmpty",
  "member.expertise",
  "member.skills",
  "member.skillsEmpty",
  "member.mentorship",
  "member.openToMentoring",
  "member.lookingForMentor",
  "member.mentorshipNote",
  "member.languages",
  "member.languagesEmpty",
  "member.links",
  "member.website",
  "member.linkedin",
];

// Rendered through memberActionErrorKey rather than as a literal <B k>.
const memberErrorKeys = ["member.conversationError"];

test("the member profile page reads all of its chrome from the discovery catalogue", () => {
  assert.match(memberPage, /@\/components\/i18n\/browse/);
  assert.match(memberPage, /memberActionErrorKey/);

  for (const key of memberKeys) {
    assert.match(
      memberPage,
      new RegExp(`<B k="${key.replace(/\./g, "\\.")}"`),
      `${key} is not rendered through <B>`,
    );
  }
  assert.match(memberPage, /<B k=\{memberActionErrorKey\(actionError\)\}\/>/);

  // The ad-hoc component this page used before is gone.
  assert.doesNotMatch(memberPage, /MemberCopy/);
});

test("the member profile page no longer hardcodes English chrome or a Latin name fallback", () => {
  const bannedCopy = [
    "Back to network",
    "This member has not added a biography yet.",
    "No skills have been added.",
    "Looking for a mentor",
    "No languages added.",
    "Afghan Hub Member",
  ];
  for (const phrase of bannedCopy) {
    assert.ok(!memberPage.includes(phrase), `member page still contains "${phrase}"`);
  }
});

test("every member key has copy in the three languages and no Latin fallback", () => {
  for (const key of [...memberKeys, ...memberErrorKeys]) {
    for (const language of languages) {
      const copy = getBrowseCopy(language, key);
      assert.equal(copy, browseCopy[language][key], `${language} ${key} is missing`);
      assert.ok(copy.trim().length > 0, `${language} ${key} is empty`);
      if (language !== "en") {
        assert.doesNotMatch(
          copy.replace(/Afghan Hub/g, ""),
          /[A-Za-z]/,
          `${language} ${key} leaks English: ${copy}`,
        );
      }
    }
  }
});

test("a failed conversation start resolves to localized copy on the member page", () => {
  assert.match(memberPage, /searchParams/);
  assert.match(memberPage, /memberActionErrorKey\(actionError\)/);
  assert.match(
    memberPage,
    /role="alert" aria-live="assertive"[\s\S]{0,160}<B k=\{memberActionErrorKey\(actionError\)\}/,
  );

  assert.equal(memberActionErrorKey("start-failed"), "member.conversationError");
  // Unknown or absent codes fall back to the shared generic action message.
  assert.equal(memberActionErrorKey(undefined), "action.errorGeneric");
  assert.equal(memberActionErrorKey("something-new"), "action.errorGeneric");

  for (const language of languages) {
    const copy = getBrowseCopy(language, memberActionErrorKey("start-failed"));
    assert.ok(copy.trim().length > 0, `${language} conversation error is empty`);
  }
});

test("the conversation-start redirect code emitted by the message action is the one the page maps", () => {
  const messageActions = read("src/app/(dashboard)/messages/actions.ts");
  const code = messageActions.match(/members\/\$\{memberId\}\?error=([a-z][a-z-]*)/)?.[1];

  assert.ok(code, "the message action redirects with a stable code");
  assert.notEqual(memberActionErrorKey(code), "action.errorGeneric", `${code} has no member copy`);
});
