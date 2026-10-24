import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
const source = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('directory workspaces share compact headers and keep URL form submissions', async () => {
  for (const area of ['businesses', 'organizations', 'opportunities', 'events']) {
    const page = await source(`src/app/(dashboard)/${area}/page.tsx`);
    assert.match(page, /MemberPageHeader/);
    assert.match(page, /method="get"/);
    assert.match(page, /DirectoryEmptyState/);
    assert.match(page, /\.eq\("status",\s*"published"\)/);
    assert.doesNotMatch(page, /CatalogIllustration|CommunityIllustration/);
  }
  const filters = await source('src/components/catalog/catalog-filter-styles.ts');
  assert.doesNotMatch(filters, /backdrop-blur|surface-panel/);
});

test('submission categories are semantic links with real counts and unchanged owner scopes', async () => {
  const page = await source('src/app/(dashboard)/submissions/page.tsx');
  assert.match(page, /\["All", "Opportunities", "Businesses", "Organizations", "Events"\]/);
  assert.match(page, /aria-labelledby="submission-categories-label"/);
  assert.match(page, /<Localized k="submissions\.categories" \/>/);
  assert.match(page, /aria-current=\{category === selected/);
  assert.doesNotMatch(page, /role="tab/);
  for (const owner of ['author_id', 'creator_id', 'owner_id']) assert.match(page, new RegExp(`\\.eq\\("${owner}", user.id\\)`));
  assert.match(page, /item\.moderationNote/);
  assert.match(page, /<Localized k="submissions\.countUnavailable" \/>/);
});

test('member identity removes decorative cover without modifying stored profile languages', async () => {
  const profile = await source('src/app/(dashboard)/members/[id]/page.tsx');
  assert.doesNotMatch(profile, /CatalogIllustration|h-32|h-44/);
  assert.match(profile, /rounded-full/);
  assert.match(profile, /profile\.languages\.filter\(meaningful\)/);
  assert.match(profile, /\.eq\("is_public",true\)\.eq\("onboarding_completed",true\)/);
  const network = await source('src/components/network/network-overview.tsx');
  assert.match(network, /label=\{copy\.artists\}/);
  assert.match(network, /query="Find artists working in arts and culture"/);
});

test('conversation workspace preserves membership, receipt and composer gates', async () => {
  const page = await source('src/app/(dashboard)/messages/[conversationId]/page.tsx');
  assert.match(page, /if \(!membership\) redirect\("\/messages"\)/);
  assert.match(page, /MarkConversationRead/);
  assert.match(page, /RealtimeReadReceiptRefresh/);
  assert.match(page, /MessageComposer conversationId=\{conversationId\}/);
  assert.match(page, /aria-labelledby="conversation-navigation-label"/);
  assert.match(page, /<Localized k="messages\.backToMessages" \/>/);
  const navigation = await source('src/components/messages/conversation-navigation.tsx');
  assert.match(navigation, /rpc\("get_message_inbox"\)/);
  assert.match(navigation, /\.in\("id", otherMemberIds\)/);
});
