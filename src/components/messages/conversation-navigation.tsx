import { Localized } from "@/components/i18n/localized";
import { ConversationList, type ConversationListItem } from "./conversation-list";
import { createClient } from "@/lib/supabase/server";

export async function ConversationNavigation({ currentUserId, activeId }: { currentUserId: string; activeId?: string }) {
  const supabase = await createClient();
  const { data: inboxRows, error } = await supabase.rpc("get_message_inbox");
  const otherMemberIds = [...new Set((inboxRows ?? []).map((row) => row.other_member_id).filter((id): id is string => Boolean(id)))];
  const { data: profiles, error: profilesError } = otherMemberIds.length
    ? await supabase.from("profiles").select("id, display_name, first_name, last_name, headline, avatar_url").in("id", otherMemberIds)
    : { data: [], error: null };
  const profilesById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const conversations: ConversationListItem[] = (inboxRows ?? []).map((row) => {
    const profile = row.other_member_id ? profilesById.get(row.other_member_id) : undefined;
    const name = profile?.display_name?.trim() || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || null;
    return {
      id: row.conversation_id,
      name,
      avatarUrl: profile?.avatar_url ?? null,
      preview: row.latest_message_body ?? profile?.headline ?? null,
      previewKind: row.latest_message_body ? "message" : profile?.headline ? "headline" : "none",
      sentByCurrentUser: Boolean(row.latest_message_body) && row.latest_message_sender_id === currentUserId,
      updatedAt: row.latest_message_created_at ?? row.conversation_updated_at,
      unreadCount: Number(row.unread_count),
    };
  });
  if (error) return <p role="alert" aria-live="assertive" className="p-4 text-sm text-destructive"><Localized k="messages.loadError" /></p>;
  return <>{profilesError ? <p role="status" className="p-4 text-sm text-muted-foreground"><Localized k="messages.profilesPartial" /></p> : null}<ConversationList conversations={conversations} activeId={activeId} /></>;
}
