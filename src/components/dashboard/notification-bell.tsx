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
  if (!actor) {
    return "An Afghan Hub member";
  }

  return (
    actor.displayName?.trim() ||
    [actor.firstName, actor.lastName].filter(Boolean).join(" ") ||
    "An Afghan Hub member"
  );
}

function getNotificationMessage(notification: NotificationSummary) {
  const actorName = getActorName(notification.actor);

  if (notification.type === "connection_request") {
    return `${actorName} sent you a connection request.`;
  }

  if (notification.type === "connection_accepted") {
    return `${actorName} accepted your connection request.`;
  }

  if (notification.type === "new_message") {
    return `${actorName} sent you a new message.`;
  }

  if (notification.type === "content_approved") {
    return `Your ${notification.contentType ?? "submission"} “${notification.contentTitle ?? "Untitled"}” was approved.`;
  }

  if (notification.type === "content_rejected") {
    const reason = notification.contentNote
      ? ` Reason: ${notification.contentNote}`
      : "";
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

export function NotificationBell({
  currentUserId,
  notifications,
  unreadCount,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const refreshNotifications = () => {
      router.refresh();
    };
    const channel = supabase
      .channel(`notifications:${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${currentUserId}`,
        },
        refreshNotifications,
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${currentUserId}`,
        },
        refreshNotifications,
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId, router]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const bellLabel =
    unreadCount > 0
      ? `Notifications, ${unreadCount} unread`
      : "Notifications";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={bellLabel}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={() => setIsOpen((current) => !current)}
        className="relative rounded-xl border border-slate-800 p-3 text-slate-400 transition hover:bg-slate-900 hover:text-white"
      >
        <Bell className="size-5" />

        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-slate-950 ring-2 ring-slate-950">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/40"
        >
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <p className="font-semibold text-white">Notifications</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You’re all caught up"}
              </p>
            </div>

            {unreadCount > 0 ? (
              <form action={markAllNotificationsRead}>
                <button
                  type="submit"
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/10 hover:text-emerald-300"
                >
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
                const isModerationNotification =
                  notification.type === "content_approved" ||
                  notification.type === "content_rejected";
                const ModerationIcon =
                  notification.type === "content_approved"
                    ? CircleCheck
                    : CircleX;

                return (
                  <form
                    key={notification.id}
                    action={markNotificationRead}
                    className="border-b border-slate-800 last:border-b-0"
                  >
                    <input
                      type="hidden"
                      name="notification_id"
                      value={notification.id}
                    />

                    <button
                      type="submit"
                      className={`flex w-full gap-3 px-4 py-3.5 text-left transition hover:bg-slate-800/80 ${
                        isUnread ? "bg-emerald-500/5" : ""
                      }`}
                    >
                      {isModerationNotification ? (
                        <span
                          className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                            notification.type === "content_approved"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-300"
                          }`}
                        >
                          <ModerationIcon className="size-5" />
                        </span>
                      ) : notification.actor?.avatarUrl ? (
                        <ExternalImage
                          src={notification.actor.avatarUrl}
                          alt=""
                          width={40}
                          height={40}
                          className="size-10 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400">
                          {notification.actor ? (
                            <span className="text-sm font-bold text-emerald-400">
                              {actorName.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <UserRound className="size-5" />
                          )}
                        </span>
                      )}

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm leading-5 text-slate-200">
                          {getNotificationMessage(notification)}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          {formatNotificationTime(
                            notification.createdAt,
                          )}
                        </span>
                      </span>

                      {isUnread ? (
                        <span
                          aria-label="Unread"
                          className="mt-2 size-2 shrink-0 rounded-full bg-emerald-400"
                        />
                      ) : null}
                    </button>
                  </form>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-10 text-center">
              <Bell className="mx-auto size-8 text-slate-600" />
              <p className="mt-3 text-sm font-medium text-slate-300">
                No notifications yet
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                New connections, messages, and moderation decisions will appear here.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
