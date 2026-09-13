import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const layoutSource = fs.readFileSync(
  new URL("../src/app/layout.tsx", import.meta.url),
  "utf8",
);
const homeSource = fs.readFileSync(
  new URL("../src/app/(public)/page.tsx", import.meta.url),
  "utf8",
);
const detailSource = fs.readFileSync(
  new URL("../src/app/(public)/explore/[kind]/[slug]/page.tsx", import.meta.url),
  "utf8",
);
const siteUrlSource = fs.readFileSync(
  new URL("../src/lib/site-url.ts", import.meta.url),
  "utf8",
);

test("root metadata resolves social assets against the configured production site URL", () => {
  assert.match(layoutSource, /import \{ getSiteUrl \} from "@\/lib\/site-url"/);
  assert.match(layoutSource, /metadataBase:\s*new URL\(getSiteUrl\(\)\)/);
  assert.match(siteUrlSource, /https:\/\/app\.apnbc\.ca/);
  assert.match(layoutSource, /openGraph:\s*\{/);
  assert.match(layoutSource, /twitter:\s*\{/);
  assert.match(layoutSource, /url:\s*"\/opengraph-image"/);
  assert.match(layoutSource, /images:\s*\["\/opengraph-image"\]/);
  assert.match(layoutSource, /card:\s*"summary_large_image"/);
});

test("homepage metadata keeps social images after page-level metadata overrides", () => {
  assert.match(homeSource, /openGraph:\s*\{/);
  assert.match(homeSource, /url:\s*"\/opengraph-image"/);
  assert.match(homeSource, /twitter:\s*\{/);
  assert.match(homeSource, /images:\s*\["\/opengraph-image"\]/);
  assert.match(homeSource, /card:\s*"summary_large_image"/);
});

test("public detail metadata keeps social images after dynamic Open Graph overrides", () => {
  assert.match(detailSource, /const socialImage = "\/opengraph-image"/);
  assert.match(detailSource, /openGraph:\s*\{/);
  assert.match(detailSource, /images:\s*\[\{\s*url:\s*socialImage/);
  assert.match(detailSource, /twitter:\s*\{/);
  assert.match(detailSource, /images:\s*\[socialImage\]/);
  assert.match(detailSource, /card:\s*"summary_large_image"/);
});
