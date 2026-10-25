import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { verificationActionErrorKey } from "../src/lib/i18n/browse-copy.ts";
import {
  businessFormErrorKey,
  organizationFormErrorKey,
} from "../src/lib/i18n/workspace-copy.ts";

const businessSource = fs.readFileSync(
  new URL("../src/app/(dashboard)/businesses/actions.ts", import.meta.url),
  "utf8",
);
const organizationSource = fs.readFileSync(
  new URL("../src/app/(dashboard)/organizations/actions.ts", import.meta.url),
  "utf8",
);

const formErrorKeys = {
  business: businessFormErrorKey,
  organization: organizationFormErrorKey,
};

for (const [name, source] of [
  ["business", businessSource],
  ["organization", organizationSource],
]) {
  test(`${name} actions redact provider errors from user-facing redirects`, () => {
    assert.doesNotMatch(source, /encodeURIComponent\(error(?:\?\.message|\.message)/);
    // Failures redirect with stable codes; the visible copy is localized.
    assert.match(source, /error=create-failed/);
    assert.match(source, /update-failed/);
    assert.doesNotMatch(source, /error=[A-Za-z]+%20/);
    assert.doesNotMatch(source, /Please%20try%20again/);
  });

  test(`${name} error codes resolve to catalogue copy`, () => {
    const codes = [
      ...new Set(
        [...source.matchAll(/error=([a-z][a-z-]*)/g)].map((match) => match[1]),
      ),
    ];
    const genericKey = `${name}Form.errorGeneric`;

    assert.ok(codes.length >= 5, `${name} actions emit their failure codes`);

    for (const code of codes) {
      const localized =
        formErrorKeys[name](code) !== genericKey ||
        verificationActionErrorKey(code) !== "action.errorGeneric";
      assert.ok(localized, `${name} error code ${code} has no catalogue entry`);
    }
  });

  test(`${name} verification uses the centralized access adapter`, () => {
    assert.match(source, /getMyAccessContext/);
    assert.doesNotMatch(source, /\.from\("profiles"\)[\s\S]*?\.select\("role"\)/);
  });
}
