import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const css = fs.readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");

test("the default outline colour is the opaque ring token, so focus does not fade in", () => {
  const universalRule = css.match(/@layer base\s*{\s*\*\s*{([^}]*)}/);
  assert.ok(universalRule, "the app-wide base rule is missing");
  assert.match(
    universalRule[1],
    /@apply[^;]*outline-ring;/,
    "the default outline colour must be the full-strength ring, not a translucent mix",
  );
  assert.doesNotMatch(
    universalRule[1],
    /outline-ring\/\d+/,
    "a half-strength default animates into the focus colour through the transition utility",
  );
});

test("the shared focus ring still draws at 2px with a 4px offset", () => {
  const focusRule = css.match(
    /:where\(a, button, input, select, textarea, summary, \[tabindex\]\):focus-visible\s*{([^}]*)}/,
  );
  assert.ok(focusRule, "the shared focus-visible rule is missing");
  assert.match(focusRule[1], /outline: 2px solid var\(--primary\)/);
  assert.match(focusRule[1], /outline-offset: 4px/);
});
