import { CommunitySignature } from "@/components/public/community-signature";
import styles from "@/components/network/network-surfaces.module.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, MessageSquare, Sparkles, UserRound, UsersRound } from "lucide-react";

import { ExternalImage } from "@/components/ui/external-image";
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

  if (!user) redirect("/login");

  const { data: inboxRows, error } = await supabase.rpc("get_message_inbox");
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
          .select("id, display_name, first_name, last_name, headline, avatar_url")
          .in("id", otherMemberIds)
      : { data: [] };
  const profilesById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return (
    <main className="px-4 py-8 sm:px-6 md:px-8 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-5xl">
        <section className={`relative overflow-hidden border px-6 py-8 md:px-8 md:py-10 ${styles.surface}`}>
          <CommunitySignature className={styles.signature} />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <Sparkles aria-hidden="true" className="size-3.5" />
                Community conversations
              </div>
              <h1 className="mt-5 text-3xl font-medium tracking-[-0.035em] text-foreground md:text-4xl">Messages</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                Keep conversations with your Afghan Hub connections organized in one place.
              </p>
            </div>

            <Link
              href="/network"
              className={`inline-flex w-fit items-center gap-2 bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${styles.control}`}
            >
              Find people
              <UsersRound aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </section>

        {error ? (
          <div
            role="alert"
            aria-live="assertive"
            className="mt-8 rounded-2xl border border-destructive/25 bg-destructive/[0.06] p-4 text-sm text-destructive"
          >
            We could not load your conversations. Please try again.
          </div>
        ) : null}

        {!error && (inboxRows ?? []).length === 0 ? (
          <div className={`relative mt-8 overflow-hidden border px-6 py-16 text-center ${styles.surface}`}>
            <CommunitySignature className={styles.signature} />
            <span className="relative mx-auto flex size-14 items-center justify-center rounded-sm bg-secondary text-primary">
              <MessageSquare aria-hidden="true" className="size-7" />
            </span>
            <h2 className="mt-5 text-lg font-semibold text-foreground">No conversations yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Connect with another member, then visit their profile to start a conversation.
            </p>
            <Link
              href="/network"
              className={`mt-6 inline-flex items-center bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${styles.control}`}
            >
              Browse the network
            </Link>
          </div>
        ) : null}

        {!error && (inboxRows ?? []).length > 0 ? (
          <div className={`mt-8 overflow-hidden border ${styles.surface}`}>
            {(inboxRows ?? []).map((conversation) => {
              const profile = conversation.other_member_id
                ? profilesById.get(conversation.other_member_id)
                : undefined;
              const memberName = profile ? getMemberName(profile) : "Afghan Hub Member";
              const unreadCount = Number(conversation.unread_count);
              const sortDate = conversation.latest_message_created_at ?? conversation.conversation_updated_at;

              return (
                <Link
                  key={conversation.conversation_id}
                  href={`/messages/${conversation.conversation_id}`}
                  className={`group relative flex items-center gap-4 border-b border-border px-5 py-5 last:border-b-0 focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary ${styles.inboxRow} ${
                    unreadCount > 0 ? "bg-primary/[0.035]" : ""
                  }`}
                >
                  {profile?.avatar_url ? (
                    <ExternalImage
                      src={profile.avatar_url}
                      alt=""
                      width={48}
                      height={48}
                      className="size-12 shrink-0 rounded-sm object-cover"
                    />
                  ) : (
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-secondary text-primary">
                      <UserRound aria-hidden="true" className="size-6" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col items-start gap-1 sm:flex-row sm:justify-between sm:gap-4">
                      <h2 className={`line-clamp-2 break-words leading-5 text-foreground ${unreadCount > 0 ? "font-bold" : "font-semibold"}`}>
                        {memberName}
                      </h2>
                      <span className="shrink-0 text-xs text-muted-foreground">{formatMessageTime(sortDate)}</span>
                    </div>

                    <div className="mt-1 flex items-center gap-3">
                      <p
                        className={`min-w-0 flex-1 truncate text-sm ${
                          unreadCount > 0 ? "font-medium text-foreground/80" : "text-muted-foreground"
                        }`}
                      >
                        {conversation.latest_message_body
                          ? `${conversation.latest_message_sender_id === user.id ? "You: " : ""}${conversation.latest_message_body}`
                          : profile?.headline || "Start the conversation"}
                      </p>

                      {unreadCount > 0 ? (
                        <span
                          aria-label={`${unreadCount} unread messages`}
                          className="flex min-w-6 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground"
                        >
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <ArrowUpRight aria-hidden="true" data-profile-arrow className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </main>
  );
}
