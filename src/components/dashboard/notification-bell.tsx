"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Bell, CircleCheck, CircleX, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/(dashboard)/notifications/actions";
import { ExternalImage } from "@/components/ui/external-image";
import { createClient } from "@/lib/supabase/client";

export type NotificationSummary = {
  id: string;
  type: string;
  conversationId: string | null;
  contentType: string | null;
  contentSlug: string | null;
  contentTitle: string | null;
  contentNote: string | null;
  readAt: string | null;
  createdAt: string;
  actor: {
    id: string;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  } | null;
};

type NotificationBellProps = {
  currentUserId: string;
  notifications: NotificationSummary[];
  unreadCount: number;
};

function getActorName(actor: NotificationSummary["actor"]) {
  if (!actor) return "An Afghan Hub member";

  return (
    actor.displayName?.trim() ||
    [actor.firstName, actor.lastName].filter(Boolean).join(" ") ||
    "An Afghan Hub member"
  );
}

function getNotificationMessage(notification: NotificationSummary) {
  const actorName = getActorName(notification.actor);

  if (notification.type === "connection_request") return `${actorName} sent you a connection request.`;
  if (notification.type === "connection_accepted") return `${actorName} accepted your connection request.`;
  if (notification.type === "new_message") return `${actorName} sent you a new message.`;
  if (notification.type === "content_approved") {
    return `Your ${notification.contentType ?? "submission"} “${notification.contentTitle ?? "Untitled"}” was approved.`;
  }
  if (notification.type === "content_rejected") {
    const reason = notification.contentNote ? ` Reason: ${notification.contentNote}` : "";
    return `Your ${notification.contentType ?? "submission"} “${notification.contentTitle ?? "Untitled"}” was not approved.${reason}`;
  }

  return "You have a new notification.";
}

function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function NotificationBell({ currentUserId, notifications, unreadCount }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const refreshNotifications = () => router.refresh();
    const channel = supabase
      .channel(`notifications:${currentUserId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${currentUserId}` }, refreshNotifications)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "notifications", filter: `recipient_id=eq.${currentUserId}` }, refreshNotifications)
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId, router]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) setIsOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const bellLabel = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={bellLabel}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={() => setIsOpen((current) => !current)}
        className="relative rounded-2xl border border-border/80 bg-card/78 p-3 text-muted-foreground shadow-[0_8px_24px_rgb(15_23_42/0.035)] transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:text-foreground"
      >
        <Bell className="size-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-foreground ring-2 ring-background">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-[1.75rem] border border-border/80 bg-card/96 shadow-[0_24px_70px_rgb(15_23_42/0.16)] backdrop-blur-2xl"
        >
          <div className="relative flex items-center justify-between border-b border-border/80 px-5 py-4"><div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 size-28 rounded-full bg-primary/[0.06] blur-2xl" />
            <div className="relative">
              <p className="font-semibold tracking-tight text-foreground">Notifications</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : "You’re all caught up"}
              </p>
            </div>
            {unreadCount > 0 ? (
              <form action={markAllNotificationsRead}>
                <button type="submit" className="relative rounded-xl border border-primary/10 bg-primary/[0.04] px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10">
                  Mark all read
                </button>
              </form>
            ) : null}
          </div>

          {notifications.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => {
                const actorName = getActorName(notification.actor);
                const isUnread = !notification.readAt;
                const isModerationNotification = notification.type === "content_approved" || notification.type === "content_rejected";
                const ModerationIcon = notification.type === "content_approved" ? CircleCheck : CircleX;

                return (
                  <form key={notification.id} action={markNotificationRead} className="border-b border-border/80 last:border-b-0">
                    <input type="hidden" name="notification_id" value={notification.id} />
                    <button
                      type="submit"
                      className={`group flex w-full gap-3 px-5 py-4 text-left transition hover:bg-primary/[0.035] ${isUnread ? "bg-primary/[0.045]" : ""}`}
                    >
                      {isModerationNotification ? (
                        <span className={`flex size-10 shrink-0 items-center justify-center rounded-2xl border ${notification.type === "content_approved" ? "border-primary/10 bg-primary/10 text-primary" : "border-destructive/10 bg-destructive/[0.06] text-destructive"}`}>
                          <ModerationIcon className="size-5" />
                        </span>
                      ) : notification.actor?.avatarUrl ? (
                        <ExternalImage src={notification.actor.avatarUrl} alt="" width={40} height={40} className="size-10 shrink-0 rounded-2xl border border-border/70 object-cover shadow-sm" />
                      ) : (
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                          {notification.actor ? (
                            <span className="text-sm font-bold text-primary">{actorName.charAt(0).toUpperCase()}</span>
                          ) : (
                            <UserRound className="size-5" />
                          )}
                        </span>
                      )}

                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm leading-5 text-foreground ${isUnread ? "font-semibold" : ""}`}>{getNotificationMessage(notification)}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">{formatNotificationTime(notification.createdAt)}</span>
                      </span>

                      {isUnread ? <span aria-label="Unread" className="mt-2 size-2 shrink-0 rounded-full bg-primary" /> : null}
                    </button>
                  </form>
                );
              })}
            </div>
          ) : (
            <div className="relative px-6 py-12 text-center"><div aria-hidden="true" className="absolute left-1/2 top-4 size-28 -translate-x-1/2 rounded-full bg-primary/[0.05] blur-2xl" />
              <span className="relative mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Bell className="size-6" />
              </span>
              <p className="mt-4 text-sm font-semibold text-foreground">No notifications yet</p>
              <p className="mx-auto mt-1 max-w-64 text-xs leading-5 text-muted-foreground">
                New connections, messages, and moderation decisions will appear here.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
