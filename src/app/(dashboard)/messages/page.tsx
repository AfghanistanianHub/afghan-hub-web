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
    <main className="px-4 py-8 md:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card px-6 py-8 shadow-[0_18px_55px_rgb(15_23_42/0.045)] md:px-8 md:py-10">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary/[0.07] blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-accent/50 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <Sparkles aria-hidden="true" className="size-3.5" />
                Community conversations
              </div>
              <h1 className="mt-5 text-3xl font-bold tracking-[-0.035em] text-foreground md:text-5xl">Messages</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                Keep conversations with your Afghan Hub connections organized in one place.
              </p>
            </div>

            <Link
              href="/network"
              className="inline-flex w-fit items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_28px_color-mix(in_oklab,var(--primary)_18%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/92 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
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
            className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            We could not load your conversations. Please try again.
          </div>
        ) : null}

        {!error && (inboxRows ?? []).length === 0 ? (
          <div className="relative mt-8 overflow-hidden rounded-[2rem] border border-border/80 bg-card px-6 py-16 text-center shadow-[0_14px_42px_rgb(15_23_42/0.04)]">
            <div aria-hidden="true" className="absolute -right-12 -top-12 size-36 rounded-full border border-primary/10" />
            <span className="relative mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MessageSquare className="size-7" />
            </span>
            <h2 className="mt-5 text-lg font-semibold text-foreground">No conversations yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Connect with another member, then visit their profile to start a conversation.
            </p>
            <Link
              href="/network"
              className="mt-6 inline-flex rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Browse the network
            </Link>
          </div>
        ) : null}

        {!error && (inboxRows ?? []).length > 0 ? (
          <div className="mt-8 overflow-hidden rounded-[2rem] border border-border/80 bg-card shadow-[0_14px_42px_rgb(15_23_42/0.04)]">
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
                  className={`group relative flex items-center gap-4 border-b border-border/80 px-5 py-5 transition last:border-b-0 hover:bg-primary/[0.035] focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary ${
                    unreadCount > 0 ? "bg-primary/[0.035]" : ""
                  }`}
                >
                  {profile?.avatar_url ? (
                    <ExternalImage
                      src={profile.avatar_url}
                      alt=""
                      width={48}
                      height={48}
                      className="size-12 shrink-0 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                      <UserRound className="size-6" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className={`truncate text-foreground ${unreadCount > 0 ? "font-bold" : "font-semibold"}`}>
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
                  <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </main>
  );
}
