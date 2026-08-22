import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageSquare, UserRound } from "lucide-react";

import { RealtimeMessageRefresh } from "@/components/messages/realtime-message-refresh";
import { createClient } from "@/lib/supabase/server";

function getMemberName(profile: {
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
}) {
  return (
    profile.display_name?.trim() ||
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    "Afghan Hub Member"
  );
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function MessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: myMemberships } = await supabase
    .from("conversation_members")
    .select("conversation_id, last_read_at")
    .eq("profile_id", user.id);

  const conversationIds = [
    ...new Set(
      (myMemberships ?? []).map(
        (membership) => membership.conversation_id,
      ),
    ),
  ];

  if (conversationIds.length === 0) {
    return (
      <main className="px-6 py-8 lg:px-10">
        <RealtimeMessageRefresh />

        <div className="mx-auto max-w-5xl">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Community conversations
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">
              Messages
            </h1>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-14 text-center">
            <MessageSquare className="mx-auto size-10 text-slate-500" />
            <h2 className="mt-4 text-lg font-semibold text-white">
              No conversations yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              Connect with another member, then visit their profile to
              start a conversation.
            </p>

            <Link
              href="/network"
              className="mt-6 inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              Browse the network
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const [{ data: conversations }, { data: membershipRows }, { data: messages }] =
    await Promise.all([
      supabase
        .from("conversations")
        .select("id, updated_at")
        .in("id", conversationIds),
      supabase
        .from("conversation_members")
        .select("conversation_id, profile_id")
        .in("conversation_id", conversationIds),
      supabase
        .from("messages")
        .select("id, conversation_id, sender_id, body, created_at")
        .in("conversation_id", conversationIds)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
    ]);

  const otherMemberIds = [
    ...new Set(
      (membershipRows ?? [])
        .filter((membership) => membership.profile_id !== user.id)
        .map((membership) => membership.profile_id),
    ),
  ];

  const { data: profiles } =
    otherMemberIds.length > 0
      ? await supabase
          .from("profiles")
          .select(
            "id, display_name, first_name, last_name, headline, avatar_url",
          )
          .in("id", otherMemberIds)
      : { data: [] };

  const profilesById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  const otherMemberByConversation = new Map<string, string>();

  for (const membership of membershipRows ?? []) {
    if (membership.profile_id !== user.id) {
      otherMemberByConversation.set(
        membership.conversation_id,
        membership.profile_id,
      );
    }
  }

  const latestMessageByConversation = new Map<
    string,
    NonNullable<typeof messages>[number]
  >();

  for (const message of messages ?? []) {
    if (!latestMessageByConversation.has(message.conversation_id)) {
      latestMessageByConversation.set(
        message.conversation_id,
        message,
      );
    }
  }

  const lastReadByConversation = new Map(
    (myMemberships ?? []).map((membership) => [
      membership.conversation_id,
      membership.last_read_at,
    ]),
  );

  const conversationList = (conversations ?? [])
    .map((conversation) => {
      const memberId = otherMemberByConversation.get(conversation.id);
      const profile = memberId
        ? profilesById.get(memberId)
        : undefined;
      const latestMessage = latestMessageByConversation.get(
        conversation.id,
      );

      return {
        ...conversation,
        profile,
        latestMessage,
        sortDate:
          latestMessage?.created_at ?? conversation.updated_at,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.sortDate).getTime() -
        new Date(a.sortDate).getTime(),
    );

  return (
    <main className="px-6 py-8 lg:px-10">
      <RealtimeMessageRefresh />

      <div className="mx-auto max-w-5xl">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Community conversations
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Messages
          </h1>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          {conversationList.map((conversation) => {
            const memberName = conversation.profile
              ? getMemberName(conversation.profile)
              : "Afghan Hub Member";

            return (
              <Link
                key={conversation.id}
                href={`/messages/${conversation.id}`}
                className="flex items-center gap-4 border-b border-slate-800 px-5 py-5 transition last:border-b-0 hover:bg-slate-800/70"
              >
                {conversation.profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={conversation.profile.avatar_url}
                    alt=""
                    className="size-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                    <UserRound className="size-6" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="truncate font-semibold text-white">
                      {memberName}
                    </h2>

                    <span className="shrink-0 text-xs text-slate-500">
                      {formatMessageTime(conversation.sortDate)}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-sm text-slate-400">
                    {conversation.latestMessage
                      ? `${
                          conversation.latestMessage.sender_id ===
                          user.id
                            ? "You: "
                            : ""
                        }${conversation.latestMessage.body}`
                      : conversation.profile?.headline ||
                        "Start the conversation"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
