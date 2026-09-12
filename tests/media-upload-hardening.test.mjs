import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const avatarSource = fs.readFileSync(
  new URL("../src/components/profile/avatar-upload.tsx", import.meta.url),
  "utf8",
);
const businessSource = fs.readFileSync(
  new URL("../src/components/businesses/business-media-upload.tsx", import.meta.url),
  "utf8",
);
const organizationSource = fs.readFileSync(
  new URL("../src/components/organizations/organization-logo-upload.tsx", import.meta.url),
  "utf8",
);

const uploadSources = [avatarSource, businessSource, organizationSource];

test("media uploads never render raw provider error messages", () => {
  for (const source of uploadSources) {
    assert.doesNotMatch(source, /setMessage\([^\n]*\.message/);
    assert.doesNotMatch(source, /text:\s*(?:uploadError|updateError|profileError)\.message/);
  }
});

test("business and organization media controls stay keyboard accessible", () => {
  for (const source of [businessSource, organizationSource]) {
    assert.match(source, /className="sr-only"/);
    assert.doesNotMatch(source, /className="hidden"/);
    assert.match(source, /focus-within:outline-2/);
    assert.match(source, /aria-busy=\{uploading\}/);
    assert.match(source, /role=\{message\.kind === "error" \? "alert" : "status"\}/);
    assert.match(source, /aria-live=\{message\.kind === "error" \? "assertive" : "polite"\}/);
  }
});

test("all media uploads use stable generic retry guidance", () => {
  assert.match(avatarSource, /We could not upload your profile photo\. Please try again\./);
  assert.match(businessSource, /We could not upload the business/);
  assert.match(organizationSource, /We could not upload the organization/);
});
