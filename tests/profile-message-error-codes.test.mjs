import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { messageActionErrorKey, uiCopy } from "../src/lib/i18n/ui-copy.ts";
import { getWorkspaceCopy, profileFormErrorKey } from "../src/lib/i18n/workspace-copy.ts";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const profileActions = read("src/app/profile/actions.ts");
const profilePage = read("src/app/profile/page.tsx");
const messageActions = read("src/app/(dashboard)/messages/actions.ts");
const messageComposer = read("src/components/messages/message-composer.tsx");

const languages = ["en", "fa", "ps"];

test("profile actions send stable codes instead of English validation text", () => {
  assert.doesNotMatch(profileActions, /error=[A-Za-z]+%20/);
  assert.doesNotMatch(profileActions, /Please%20try%20again/);
  assert.match(profileActions, /error=linkedin-url-invalid/);
  assert.match(profileActions, /error=website-url-invalid/);
  assert.match(profileActions, /error=mentorship-topics-invalid/);
  assert.match(profileActions, /error=save-failed/);
  assert.match(profileActions, /error=mentorship-save-failed/);
});

test("every profile error code resolves to copy in all three languages", () => {
  const codes = [
    ...new Set(
      [...profileActions.matchAll(/error=([a-z][a-z-]*)/g)].map((match) => match[1]),
    ),
  ];

  assert.ok(codes.length >= 5, "profile actions emit their failure codes");

  for (const code of codes) {
    assert.notEqual(
      profileFormErrorKey(code),
      "profileForm.errorGeneric",
      `profile error code ${code} has no catalogue entry`,
    );
  }

  for (const code of [...codes, "unmapped-failure"]) {
    for (const language of languages) {
      const copy = getWorkspaceCopy(language, profileFormErrorKey(code));
      assert.ok(copy.trim().length > 0, `${language} ${code} is empty`);
      if (language !== "en") {
        assert.doesNotMatch(copy, /[A-Za-z]/, `${language} ${code} leaks English: ${copy}`);
      }
    }
  }
});

test("the profile page maps the code through the workspace catalogue", () => {
  assert.match(profilePage, /profileFormErrorKey/);
  assert.match(profilePage, /<W k=\{profileFormErrorKey\(error\)\} \/>/);
  assert.doesNotMatch(profilePage, /text-destructive">\{error\}</);
});

test("messaging actions return and redirect with codes only", () => {
  assert.match(messageActions, /error: "invalid-conversation"/);
  assert.match(messageActions, /error: "invalid-length"/);
  assert.match(messageActions, /error: "no-access"/);
  assert.match(messageActions, /error: "send-failed"/);
  assert.match(messageActions, /error=start-failed/);
  assert.doesNotMatch(messageActions, /error:\s*"[A-Z]/);
  assert.doesNotMatch(messageActions, /error=[A-Za-z]+%20/);
});

test("every message error code resolves to catalogue copy in all three languages", () => {
  const codes = [
    ...new Set([
      ...[...messageActions.matchAll(/error: "([a-z][a-z-]*)"/g)].map((match) => match[1]),
      ...[...messageActions.matchAll(/error=([a-z][a-z-]*)/g)].map((match) => match[1]),
    ]),
  ];

  assert.ok(codes.length >= 5, "messaging actions emit their failure codes");

  for (const code of codes) {
    const key = messageActionErrorKey(code);
    assert.notEqual(key, "messages.errorGeneric", `message code ${code} has no catalogue entry`);

    const [section, name] = key.split(".");
    for (const language of languages) {
      const copy = uiCopy[language][section][name];
      assert.ok(typeof copy === "string" && copy.trim().length > 0, `${language} ${key} is empty`);
      if (language !== "en") {
        assert.doesNotMatch(copy, /[A-Za-z]/, `${language} ${key} leaks English: ${copy}`);
      }
    }
  }
});

test("the message composer renders the localized code and no raw sentence fallback", () => {
  assert.match(messageComposer, /messageActionErrorKey/);
  assert.match(messageComposer, /t\(messageActionErrorKey\(state\.error\)\)/);
  assert.doesNotMatch(messageComposer, /errorKeys\[/);
  assert.doesNotMatch(messageComposer, /Unable to identify this conversation/);
});
