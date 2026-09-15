import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const baseline = await readFile(
  new URL("../supabase/migrations/20260719001500_storage.sql", import.meta.url),
  "utf8",
);
const businessPolicyHardening = await readFile(
  new URL(
    "../supabase/migrations/20260904000800_fix_business_media_storage_policies.sql",
    import.meta.url,
  ),
  "utf8",
);
const privateListingMedia = await readFile(
  new URL(
    "../supabase/migrations/20260913222546_protect_draft_listing_media.sql",
    import.meta.url,
  ),
  "utf8",
);

const storageHistory = [baseline, businessPolicyHardening, privateListingMedia].join("\n");

test("storage migration history recreates the three production bucket definitions", () => {
  assert.match(baseline, /'avatars'[\s\S]*true[\s\S]*5242880[\s\S]*image\/jpeg[\s\S]*image\/png[\s\S]*image\/webp/);
  assert.match(baseline, /'business-media'[\s\S]*true[\s\S]*10485760[\s\S]*image\/jpeg[\s\S]*image\/png[\s\S]*image\/webp/);
  assert.match(baseline, /'organization-media'[\s\S]*true[\s\S]*10485760[\s\S]*image\/jpeg[\s\S]*image\/png[\s\S]*image\/webp/);

  assert.match(privateListingMedia, /update\s+storage\.buckets[\s\S]*set\s+public\s*=\s*false[\s\S]*business-media[\s\S]*organization-media/i);
});

test("avatar Storage policies preserve public read and own-folder writes", () => {
  for (const policyName of [
    "storage_public_read",
    "storage_avatar_insert_own_folder",
    "storage_avatar_update_own_folder",
    "storage_avatar_delete_own_folder",
  ]) {
    assert.match(storageHistory, new RegExp(`\\b${policyName}\\b`));
  }

  assert.match(baseline, /bucket_id\s*=\s*'avatars'[\s\S]*storage\.foldername\(name\)[\s\S]*auth\.uid\(\)/);
  assert.match(privateListingMedia, /create\s+policy\s+storage_public_read[\s\S]*bucket_id\s*=\s*'avatars'/i);
});

test("listing-media Storage policies keep owner writes and status-aware reads", () => {
  for (const policyName of [
    "storage_business_media_insert_owner",
    "storage_business_media_update_owner",
    "storage_business_media_delete_owner",
    "storage_organization_media_insert_owner",
    "storage_organization_media_update_owner",
    "storage_organization_media_delete_owner",
    "storage_business_media_select_status_aware",
    "storage_organization_media_select_status_aware",
  ]) {
    assert.match(storageHistory, new RegExp(`\\b${policyName}\\b`));
  }

  assert.match(businessPolicyHardening, /owner_id\s*=\s*\(select\s+auth\.uid\(\)\)/i);
  assert.match(privateListingMedia, /status\s*=\s*'published'::public\.entity_status\s+or\s+b\.owner_id\s*=\s*auth\.uid\(\)/i);
  assert.match(privateListingMedia, /status\s*=\s*'published'::public\.entity_status\s+or\s+o\.owner_id\s*=\s*auth\.uid\(\)/i);
});
