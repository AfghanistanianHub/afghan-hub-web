import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCheck, UserRound } from "lucide-react";

import { MarkConversationRead } from "@/components/messages/mark-conversation-read";
import { MessageComposer } from "@/components/messages/message-composer";
import { MessageThread } from "@/components/messages/message-thread";
import { RealtimeReadReceiptRefresh } from "@/components/messages/realtime-read-receipt-refresh";
import { ExternalImage } from "@/components/ui/external-image";
import { createClient } from "@/lib/supabase/server";

type ConversationPageProps = {
  params: Promise<{ conversationId: string }>;
  searchParams: Promise<{ limit?: string }>;
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

export default async function ConversationPage({ params, searchParams }: ConversationPageProps) {
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

  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("conversation_members")
    .select("conversation_id, last_read_at")
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!membership) redirect("/messages");

  const [{ data: memberRows }, { data: messageRows, count: messageCount }] = await Promise.all([
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
  const latestDisplayedMessageId = messages.at(-1)?.id ?? null;
  const hasEarlierMessages = (messageCount ?? 0) > messageLimit;
  const nextMessageLimit = Math.min(messageLimit + 100, 1000);

  const otherMembership = (memberRows ?? []).find((member) => member.profile_id !== user.id);
  const otherMemberId = otherMembership?.profile_id;

  const { data: otherMember } = otherMemberId
    ? await supabase
        .from("profiles")
        .select("id, display_name, first_name, last_name, headline, avatar_url")
        .eq("id", otherMemberId)
        .maybeSingle()
    : { data: null };

  const memberName = otherMember ? getMemberName(otherMember) : "Afghan Hub Member";

  const hasUnreadMessages = messages.some(
    (message) =>
      message.sender_id !== user.id &&
      (!membership.last_read_at ||
        new Date(message.created_at).getTime() > new Date(membership.last_read_at).getTime()),
  );
  const latestSentMessage = messages.findLast((message) => message.sender_id === user.id);
  const latestSentMessageIsSeen = Boolean(
    latestSentMessage &&
      otherMembership?.last_read_at &&
      new Date(otherMembership.last_read_at).getTime() >= new Date(latestSentMessage.created_at).getTime(),
  );

  return (
    <main className="flex min-h-[calc(100vh-80px)] flex-col px-4 py-5 md:px-8 lg:px-10">
      {hasUnreadMessages && messageLimit === 100 && latestDisplayedMessageId ? (
        <MarkConversationRead conversationId={conversationId} readThroughMessageId={latestDisplayedMessageId} />
      ) : null}
      <RealtimeReadReceiptRefresh conversationId={conversationId} />

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <header className="flex items-center gap-4 border-b border-border px-4 py-4 sm:px-5">
          <Link
            href="/messages"
            aria-label="Back to messages"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </Link>

          {otherMember?.avatar_url ? (
            <ExternalImage
              src={otherMember.avatar_url}
              alt=""
              width={44}
              height={44}
              className="size-11 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <UserRound className="size-5" />
            </div>
          )}

          <div className="min-w-0">
            {otherMemberId ? (
              <Link
                href={`/members/${otherMemberId}`}
                className="truncate font-semibold text-foreground transition hover:text-primary"
              >
                {memberName}
              </Link>
            ) : (
              <p className="truncate font-semibold text-foreground">{memberName}</p>
            )}

            <p className="truncate text-sm text-muted-foreground">
              {otherMember?.headline || "Afghan Hub member"}
            </p>
          </div>
        </header>

        <MessageThread latestMessageId={latestDisplayedMessageId} scrollToLatest={messageLimit === 100}>
          {hasEarlierMessages || messageLimit > 100 ? (
            <div className="flex flex-wrap items-center justify-center gap-2 pb-2 text-center">
              {messageLimit < 1000 ? (
                hasEarlierMessages ? (
                  <Link
                    href={`/messages/${conversationId}?limit=${nextMessageLimit}`}
                    className="inline-flex rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-accent"
                  >
                    Load earlier messages
                  </Link>
                ) : null
              ) : hasEarlierMessages ? (
                <p className="text-xs text-muted-foreground">Showing the latest 1,000 messages.</p>
              ) : null}

              {messageLimit > 100 ? (
                <Link
                  href={`/messages/${conversationId}`}
                  className="inline-flex rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10"
                >
                  Back to latest
                </Link>
              ) : null}
            </div>
          ) : null}

          {messages.length === 0 ? (
            <div className="flex h-full min-h-72 items-center justify-center text-center">
              <div>
                <h1 className="text-lg font-semibold text-foreground">Start your conversation</h1>
                <p className="mt-2 text-sm text-muted-foreground">Send a message to {memberName}.</p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isMine = message.sender_id === user.id;

              return (
                <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[84%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${
                      isMine
                        ? "rounded-br-md bg-primary text-primary-foreground shadow-sm"
                        : "rounded-bl-md border border-border bg-muted/60 text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.body}</p>

                    <p
                      className={`mt-1 text-right text-[11px] ${
                        isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {formatMessageTime(message.created_at)}
                      {isMine && message.id === latestSentMessage?.id && latestSentMessageIsSeen ? (
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
