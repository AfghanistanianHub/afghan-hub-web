import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCheck, UserRound } from "lucide-react";

import { MarkConversationRead } from "@/components/messages/mark-conversation-read";
import { MessageComposer } from "@/components/messages/message-composer";
import { MessageThread } from "@/components/messages/message-thread";
import { RealtimeReadReceiptRefresh } from "@/components/messages/realtime-read-receipt-refresh";
import { createClient } from "@/lib/supabase/server";

type ConversationPageProps = {
  params: Promise<{
    conversationId: string;
  }>;
  searchParams: Promise<{
    limit?: string;
  }>;
};

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

export default async function ConversationPage({
  params,
  searchParams,
}: ConversationPageProps) {
  const { conversationId } = await params;
  const { limit: limitValue } = await searchParams;
  const parsedLimit = Number.parseInt(limitValue ?? "", 10);
  const messageLimit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 100), 1000)
    : 100;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("conversation_members")
    .select("conversation_id, last_read_at")
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!membership) {
    redirect("/messages");
  }

  const [
    { data: memberRows },
    { data: messageRows, count: messageCount },
  ] = await Promise.all([
    supabase
      .from("conversation_members")
      .select("profile_id, last_read_at")
      .eq("conversation_id", conversationId),
    supabase
      .from("messages")
      .select("id, sender_id, body, created_at", { count: "exact" })
      .eq("conversation_id", conversationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(0, messageLimit - 1),
  ]);
  const messages = [...(messageRows ?? [])].reverse();
  const hasEarlierMessages = (messageCount ?? 0) > messageLimit;
  const nextMessageLimit = Math.min(messageLimit + 100, 1000);

  const otherMembership = (memberRows ?? []).find(
    (member) => member.profile_id !== user.id,
  );
  const otherMemberId = otherMembership?.profile_id;

  const { data: otherMember } = otherMemberId
    ? await supabase
        .from("profiles")
        .select(
          "id, display_name, first_name, last_name, headline, avatar_url",
        )
        .eq("id", otherMemberId)
        .maybeSingle()
    : { data: null };

  const memberName = otherMember
    ? getMemberName(otherMember)
    : "Afghan Hub Member";

  const hasUnreadMessages = (messages ?? []).some(
    (message) =>
      message.sender_id !== user.id &&
      (!membership.last_read_at ||
        new Date(message.created_at).getTime() >
          new Date(membership.last_read_at).getTime()),
  );
  const latestSentMessage = messages.findLast(
    (message) => message.sender_id === user.id,
  );
  const latestSentMessageIsSeen = Boolean(
    latestSentMessage &&
      otherMembership?.last_read_at &&
      new Date(otherMembership.last_read_at).getTime() >=
        new Date(latestSentMessage.created_at).getTime(),
  );

  return (
    <main className="flex min-h-[calc(100vh-73px)] flex-col px-6 py-6 lg:px-10">
      {hasUnreadMessages && messageLimit === 100 ? (
        <MarkConversationRead conversationId={conversationId} />
      ) : null}
      <RealtimeReadReceiptRefresh conversationId={conversationId} />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        <header className="flex items-center gap-4 border-b border-slate-800 px-5 py-4">
          <Link
            href="/messages"
            aria-label="Back to messages"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="size-5" />
          </Link>

          {otherMember?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={otherMember.avatar_url}
              alt=""
              className="size-11 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400">
              <UserRound className="size-5" />
            </div>
          )}

          <div className="min-w-0">
            {otherMemberId ? (
              <Link
                href={`/members/${otherMemberId}`}
                className="truncate font-semibold text-white hover:text-emerald-400"
              >
                {memberName}
              </Link>
            ) : (
              <p className="truncate font-semibold text-white">
                {memberName}
              </p>
            )}

            <p className="truncate text-sm text-slate-400">
              {otherMember?.headline || "Afghan Hub member"}
            </p>
          </div>
        </header>

        <MessageThread
          latestMessageId={messages.at(-1)?.id ?? null}
          scrollToLatest={messageLimit === 100}
        >
          {hasEarlierMessages || messageLimit > 100 ? (
            <div className="flex flex-wrap items-center justify-center gap-2 pb-2 text-center">
              {messageLimit < 1000 ? (
                hasEarlierMessages ? (
                  <Link
                    href={`/messages/${conversationId}?limit=${nextMessageLimit}`}
                    className="inline-flex rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                  >
                    Load earlier messages
                  </Link>
                ) : null
              ) : hasEarlierMessages ? (
                <p className="text-xs text-slate-500">
                  Showing the latest 1,000 messages.
                </p>
              ) : null}

              {messageLimit > 100 ? (
                <Link
                  href={`/messages/${conversationId}`}
                  className="inline-flex rounded-lg border border-emerald-700/70 px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-950/60 hover:text-emerald-200"
                >
                  Back to latest
                </Link>
              ) : null}
            </div>
          ) : null}

          {messages.length === 0 ? (
            <div className="flex h-full min-h-72 items-center justify-center text-center">
              <div>
                <h1 className="text-lg font-semibold text-white">
                  Start your conversation
                </h1>
                <p className="mt-2 text-sm text-slate-400">
                  Send a message to {memberName}.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isMine = message.sender_id === user.id;

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isMine ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${
                      isMine
                        ? "rounded-br-md bg-emerald-600 text-white"
                        : "rounded-bl-md bg-slate-800 text-slate-100"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      {message.body}
                    </p>

                    <p
                      className={`mt-1 text-right text-[11px] ${
                        isMine
                          ? "text-emerald-100"
                          : "text-slate-500"
                      }`}
                    >
                      {formatMessageTime(message.created_at)}
                      {isMine &&
                      message.id === latestSentMessage?.id &&
                      latestSentMessageIsSeen ? (
                        <span className="ml-2 inline-flex items-center gap-1 font-medium">
                          <CheckCheck className="size-3.5" /> Seen
                        </span>
                      ) : null}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </MessageThread>

        <MessageComposer conversationId={conversationId} />
      </div>
    </main>
  );
}
