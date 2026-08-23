type ConversationMembership = {
  conversation_id: string;
  last_read_at: string | null;
};

type MessageReadState = {
  conversation_id: string;
  sender_id: string;
  created_at: string;
};

export function getUnreadMessageCounts(
  memberships: ConversationMembership[],
  messages: MessageReadState[],
  currentUserId: string,
) {
  const lastReadByConversation = new Map(
    memberships.map((membership) => [
      membership.conversation_id,
      membership.last_read_at,
    ]),
  );
  const counts = new Map<string, number>();

  for (const message of messages) {
    if (message.sender_id === currentUserId) {
      continue;
    }

    const lastReadAt = lastReadByConversation.get(
      message.conversation_id,
    );

    if (
      lastReadAt === undefined ||
      (lastReadAt !== null &&
        new Date(message.created_at).getTime() <=
          new Date(lastReadAt).getTime())
    ) {
      continue;
    }

    counts.set(
      message.conversation_id,
      (counts.get(message.conversation_id) ?? 0) + 1,
    );
  }

  return counts;
}

export function getTotalUnreadMessageCount(
  counts: Map<string, number>,
) {
  return [...counts.values()].reduce(
    (total, count) => total + count,
    0,
  );
}
