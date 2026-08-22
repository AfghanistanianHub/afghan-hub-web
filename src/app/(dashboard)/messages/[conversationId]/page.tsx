import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Send, UserRound } from "lucide-react";

import { sendMessage } from "@/app/(dashboard)/messages/actions";
import { RealtimeMessageRefresh } from "@/components/messages/realtime-message-refresh";
import { createClient } from "@/lib/supabase/server";

type ConversationPageProps = {
  params: Promise<{
    conversationId: string;
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
}: ConversationPageProps) {
  const { conversationId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!membership) {
    redirect("/messages");
  }

  const [{ data: memberRows }, { data: messages }] = await Promise.all([
    supabase
      .from("conversation_members")
      .select("profile_id")
      .eq("conversation_id", conversationId),
    supabase
      .from("messages")
      .select("id, sender_id, body, created_at")
      .eq("conversation_id", conversationId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
  ]);

  const otherMemberId = (memberRows ?? []).find(
    (member) => member.profile_id !== user.id,
  )?.profile_id;

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

  await supabase
    .from("conversation_members")
    .update({
      last_read_at: new Date().toISOString(),
    })
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id);

  return (
    <main className="flex min-h-[calc(100vh-73px)] flex-col px-6 py-6 lg:px-10">
      <RealtimeMessageRefresh conversationId={conversationId} />
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

        <section className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
          {(messages ?? []).length === 0 ? (
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
            (messages ?? []).map((message) => {
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
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </section>

        <form
          action={sendMessage}
          className="flex items-end gap-3 border-t border-slate-800 bg-slate-950/60 p-4"
        >
          <input
            type="hidden"
            name="conversation_id"
            value={conversationId}
          />

          <textarea
            name="message"
            required
            maxLength={4000}
            rows={1}
            placeholder="Write a message..."
            className="min-h-12 flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-500"
          />

          <button
            type="submit"
            aria-label="Send message"
            className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-500"
          >
            <Send className="size-5" />
          </button>
        </form>
      </div>
    </main>
  );
}
