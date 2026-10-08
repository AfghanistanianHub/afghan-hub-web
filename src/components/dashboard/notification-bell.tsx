"use client";

import { NotificationSubmit } from "@/components/dashboard/action-submit";
import styles from "@/components/network/network-surfaces.module.css";

import { useEffect, useId, useRef, useState } from "react";
import { Bell, CircleCheck, CircleX, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/(dashboard)/notifications/actions";
import { ExternalImage } from "@/components/ui/external-image";
import { createClient } from "@/lib/supabase/client";
import { subscribeMemberChannel } from "@/lib/supabase/member-realtime";

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
  unavailable?: boolean;
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

export function NotificationBell({ currentUserId, notifications, unreadCount, unavailable = false }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const refreshNotifications = () => router.refresh();
    const channel = supabase
      .channel(`notifications:${currentUserId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `recipient_id=eq.${currentUserId}` }, refreshNotifications)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "notifications", filter: `recipient_id=eq.${currentUserId}` }, refreshNotifications)
      .on("system", {}, (payload) => {
        // A joined socket can precede PostgreSQL readiness. Refetch once the
        // stream is ready, including after rejoining, to recover missed changes.
        if (payload.extension === "postgres_changes" && payload.status === "ok") {
          router.refresh();
        }
      });

    return subscribeMemberChannel(supabase, channel);
  }, [currentUserId, router]);

  useEffect(() => {
    if (!isOpen) return;
    panelRef.current?.focus();

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) setIsOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const bellLabel = unavailable
    ? "Notifications temporarily unavailable"
    : unreadCount > 0
      ? `Notifications, ${unreadCount} unread`
      : "Notifications";

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={bellLabel}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={() => setIsOpen((current) => !current)}
        className={`relative flex size-11 items-center justify-center border border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-secondary hover:text-foreground ${styles.control}`}
      >
        <Bell aria-hidden="true" className="size-5" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-foreground ring-2 ring-background">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          ref={panelRef}
          tabIndex={-1}
          id={panelId}
          role="dialog"
          aria-label="Notifications"
          className="fixed inset-x-4 top-[5.75rem] z-50 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-[var(--radius)] border border-border bg-card shadow-[0_8px_24px_#302b3512] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:absolute lg:inset-x-auto lg:right-0 lg:top-auto lg:mt-3 lg:w-96"
        >
          <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div className="relative">
              <p className="font-semibold tracking-tight text-foreground">Notifications</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {unavailable
                  ? "Temporarily unavailable"
                  : unreadCount > 0
                    ? `${unreadCount} unread`
                    : "You’re all caught up"}
              </p>
            </div>
            {!unavailable && unreadCount > 0 ? (
              <form action={markAllNotificationsRead}>
                <NotificationSubmit className={`relative min-w-32 border border-primary/20 bg-secondary px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 ${styles.control}`}>
                  Mark all read
                </NotificationSubmit>
              </form>
            ) : null}
          </div>

          {unavailable ? (
            <div role="status" aria-live="polite" className="relative px-6 py-10 text-center">
              <span className="relative mx-auto flex size-12 items-center justify-center rounded-[var(--radius)] bg-secondary text-primary">
                <Bell aria-hidden="true" className="size-6" />
              </span>
              <p className="mt-4 text-sm font-semibold text-foreground">Notifications are temporarily unavailable</p>
              <p className="mx-auto mt-1 max-w-64 text-xs leading-5 text-muted-foreground">
                Please close this panel and try again shortly.
              </p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="max-h-[min(24rem,calc(100dvh-12rem))] overflow-y-auto">
              {notifications.map((notification) => {
                const actorName = getActorName(notification.actor);
                const isUnread = !notification.readAt;
                const isModerationNotification = notification.type === "content_approved" || notification.type === "content_rejected";
                const ModerationIcon = notification.type === "content_approved" ? CircleCheck : CircleX;

                return (
                  <form key={notification.id} action={markNotificationRead} className="border-b border-border/80 last:border-b-0">
                    <input type="hidden" name="notification_id" value={notification.id} />
                    <NotificationSubmit
                      preserveContent
                      className={`relative group flex min-h-20 w-full gap-3 px-5 py-4 text-left transition-colors motion-reduce:transition-none active:bg-secondary hover:bg-primary/[0.035] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary ${isUnread ? "bg-primary/[0.045]" : ""}`}
                    >
                      {isModerationNotification ? (
                        <span className={`flex size-10 shrink-0 items-center justify-center rounded-[var(--radius)] border ${notification.type === "content_approved" ? "border-primary/10 bg-primary/10 text-primary" : "border-destructive/10 bg-destructive/[0.06] text-destructive"}`}>
                          <ModerationIcon aria-hidden="true" className="size-5" />
                        </span>
                      ) : notification.actor?.avatarUrl ? (
                        <ExternalImage src={notification.actor.avatarUrl} alt="" width={40} height={40} className="size-10 shrink-0 rounded-[var(--radius)] border border-border/70 object-cover" />
                      ) : (
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius)] bg-secondary text-primary">
                          {notification.actor ? (
                            <span className="text-sm font-bold text-primary">{actorName.charAt(0).toUpperCase()}</span>
                          ) : (
                            <UserRound aria-hidden="true" className="size-5" />
                          )}
                        </span>
                      )}

                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm leading-5 text-foreground ${isUnread ? "font-semibold" : ""}`}>{getNotificationMessage(notification)}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">{formatNotificationTime(notification.createdAt)}</span>
                      </span>

                      {isUnread ? <span aria-label="Unread" className="mt-2 size-2 shrink-0 rounded-full bg-primary" /> : null}
                    </NotificationSubmit>
                  </form>
                );
              })}
            </div>
          ) : (
            <div className="relative px-6 py-10 text-center">
              <span className="relative mx-auto flex size-12 items-center justify-center rounded-[var(--radius)] bg-secondary text-primary">
                <Bell aria-hidden="true" className="size-6" />
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
