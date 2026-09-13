import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const uploaders = [
  "../src/components/businesses/business-media-upload.tsx",
  "../src/components/organizations/organization-logo-upload.tsx",
];

test("listing media uploads store storage references instead of public URLs", async () => {
  for (const path of uploaders) {
    const source = await readFile(new URL(path, import.meta.url), "utf8");
    assert.match(source, /supabase:\/\//);
    assert.doesNotMatch(source, /getPublicUrl/);
  }
});

test("ExternalImage resolves storage references through signed URLs", async () => {
  const source = await readFile(new URL("../src/components/ui/external-image.tsx", import.meta.url), "utf8");
  assert.match(source, /createSignedUrl/);
  assert.match(source, /supabase:\/\//);
});
