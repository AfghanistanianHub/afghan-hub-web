import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(
  new URL("../src/app/(dashboard)/members/[id]/page.tsx", import.meta.url),
  "utf8",
);

const recommendationSource = fs.readFileSync(
  new URL("../src/components/dashboard/recommended-members.tsx", import.meta.url),
  "utf8",
);

test("member profile related discovery keeps eligibility boundaries", () => {
  assert.match(source, /\.eq\("is_public",true\)/);
  assert.match(source, /\.eq\("onboarding_completed",true\)/);
  assert.match(source, /\.neq\("id",profile\.id\)/);
});

test("member profile discovery reuses the existing ranking engine", () => {
  assert.match(source, /rankMemberRecommendations\(profile,memberCandidates\?\?\[\],3\)/);
  assert.match(source, /<RecommendedMembers members=\{relatedMembers\}/);
});

test("member profile uses contextual discovery copy without changing dashboard defaults", () => {
  assert.match(source, /eyebrow="More people to discover"/);
  assert.match(source, /title="Members with similar skills, work or location"/);
  assert.match(recommendationSource, /eyebrow = "People worth meeting"/);
  assert.match(recommendationSource, /title = "Relevant people from the community"/);
});
