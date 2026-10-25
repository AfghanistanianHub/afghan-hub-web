import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const profileSource = fs.readFileSync(
  new URL("../src/app/profile/page.tsx", import.meta.url),
  "utf8",
);
const settingsSource = fs.readFileSync(
  new URL("../src/app/(dashboard)/settings/page.tsx", import.meta.url),
  "utf8",
);
const settingsTextSource = fs.readFileSync(new URL("../src/components/settings/settings-text.tsx", import.meta.url), "utf8");
const submitSource = fs.readFileSync(
  new URL("../src/components/forms/pending-submit-button.tsx", import.meta.url),
  "utf8",
);
const avatarSource = fs.readFileSync(
  new URL("../src/components/profile/avatar-upload.tsx", import.meta.url),
  "utf8",
);
const workspaceCopySource = fs.readFileSync(
  new URL("../src/lib/i18n/workspace-copy.ts", import.meta.url),
  "utf8",
);

test("profile errors are announced and profile submit exposes pending state", () => {
  assert.match(profileSource, /role="alert"/);
  assert.match(profileSource, /aria-live="assertive"/);
  const copy = fs.readFileSync(new URL("../src/lib/i18n/onboarding-copy.ts", import.meta.url), "utf8");
  assert.match(copy, /saving: "Saving profile…"/);
  assert.match(copy, /saving: "در حال ذخیره پروفایل…"/);
  assert.match(copy, /saving: "پروفایل ساتل کېږي…"/);
  assert.match(profileSource, /<LocalizedSubmitButton/);
  assert.match(profileSource, /pendingKey="profile.saving"/);
  assert.match(workspaceCopySource, /"profile.saving": "Saving profile…"/);
});

test("settings feedback is announced and save action exposes pending state", () => {
  assert.match(settingsSource, /role="alert"/);
  assert.match(settingsSource, /aria-live="assertive"/);
  assert.match(settingsSource, /role="status"/);
  assert.match(settingsSource, /aria-live="polite"/);
  assert.match(settingsSource, /<SettingsSaveButton/);
  assert.match(settingsTextSource, /<PendingSubmitButton/);
  assert.match(settingsTextSource, /pendingLabel=\{labels\[language\]\.saving\}/);
});

test("pending submit button prevents repeat submission while announcing progress", () => {
  assert.match(submitSource, /useFormStatus/);
  assert.match(submitSource, /disabled=\{pending \|\| disabled\}/);
  assert.match(submitSource, /aria-disabled=\{pending \|\| disabled\}/);
  assert.match(submitSource, /role="status"/);
  assert.match(submitSource, /aria-live="polite"/);
});

test("avatar upload stays keyboard focusable and announces upload results", () => {
  assert.match(avatarSource, /className="sr-only"/);
  assert.doesNotMatch(avatarSource, /className="hidden"/);
  assert.match(avatarSource, /focus-within:outline-2/);
  assert.match(avatarSource, /aria-busy=\{uploading\}/);
  assert.match(avatarSource, /role=\{message\.kind === "error" \? "alert" : "status"\}/);
  assert.match(avatarSource, /aria-describedby=\{message \? "avatar-upload-message" : undefined\}/);
  assert.match(avatarSource, /useRouter/);
  assert.match(avatarSource, /router\.refresh\(\)/);
  assert.doesNotMatch(avatarSource, /window\.location\.reload/);
});
