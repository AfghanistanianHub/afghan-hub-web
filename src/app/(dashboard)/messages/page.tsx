import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageSquare, UserRound } from "lucide-react";

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

  const { data: inboxRows, error } = await supabase.rpc(
    "get_message_inbox",
  );
  const otherMemberIds = [
    ...new Set(
      (inboxRows ?? [])
        .map((row) => row.other_member_id)
        .filter((id): id is string => Boolean(id)),
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

  return (
    <main className="px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Community conversations
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">Messages</h1>
        </div>

        {error ? (
          <div className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            We could not load your conversations. Please try again.
          </div>
        ) : null}

        {!error && (inboxRows ?? []).length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-14 text-center">
            <MessageSquare className="mx-auto size-10 text-slate-500" />
            <h2 className="mt-4 text-lg font-semibold text-white">
              No conversations yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              Connect with another member, then visit their profile to start a
              conversation.
            </p>
            <Link
              href="/network"
              className="mt-6 inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              Browse the network
            </Link>
          </div>
        ) : null}

        {!error && (inboxRows ?? []).length > 0 ? (
          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
            {(inboxRows ?? []).map((conversation) => {
              const profile = conversation.other_member_id
                ? profilesById.get(conversation.other_member_id)
                : undefined;
              const memberName = profile
                ? getMemberName(profile)
                : "Afghan Hub Member";
              const unreadCount = Number(conversation.unread_count);
              const sortDate =
                conversation.latest_message_created_at ??
                conversation.conversation_updated_at;

              return (
                <Link
                  key={conversation.conversation_id}
                  href={`/messages/${conversation.conversation_id}`}
                  className={`flex items-center gap-4 border-b border-slate-800 px-5 py-5 transition last:border-b-0 hover:bg-slate-800/70 ${
                    unreadCount > 0 ? "bg-slate-800/40" : ""
                  }`}
                >
                  {profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar_url}
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
                      <h2
                        className={`truncate text-white ${
                          unreadCount > 0 ? "font-bold" : "font-semibold"
                        }`}
                      >
                        {memberName}
                      </h2>
                      <span className="shrink-0 text-xs text-slate-500">
                        {formatMessageTime(sortDate)}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-3">
                      <p
                        className={`min-w-0 flex-1 truncate text-sm ${
                          unreadCount > 0
                            ? "font-medium text-slate-200"
                            : "text-slate-400"
                        }`}
                      >
                        {conversation.latest_message_body
                          ? `${
                              conversation.latest_message_sender_id === user.id
                                ? "You: "
                                : ""
                            }${conversation.latest_message_body}`
                          : profile?.headline || "Start the conversation"}
                      </p>

                      {unreadCount > 0 ? (
                        <span
                          aria-label={`${unreadCount} unread messages`}
                          className="flex min-w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-xs font-bold text-slate-950"
                        >
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </main>
  );
}
