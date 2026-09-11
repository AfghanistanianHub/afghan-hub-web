"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { Menu, Settings, UserRound, X } from "lucide-react";

import {
  dashboardNavigation,
  moderationNavigation,
} from "@/components/dashboard/navigation";

type MobileNavigationProps = {
  canModerate: boolean;
  pendingModerationCount: number;
  unreadMessageCount: number;
};

export function MobileNavigation({
  canModerate,
  pendingModerationCount,
  unreadMessageCount,
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigation = canModerate
    ? [...dashboardNavigation, moderationNavigation]
    : dashboardNavigation;

  useEffect(() => {
    if (!isOpen) return;

    const desktop = window.matchMedia("(min-width: 64rem)");
    const closeOnDesktop = () => {
      if (desktop.matches) setIsOpen(false);
    };

    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [isOpen]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger
        type="button"
        aria-label="Open navigation"
        className="rounded-xl border border-border bg-card p-2.5 text-muted-foreground shadow-sm transition hover:border-primary/30 hover:bg-accent hover:text-foreground lg:hidden"
      >
        <Menu className="size-5" />
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/15 backdrop-blur-sm" />

        <Dialog.Popup
          aria-label="Main navigation"
          className="fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(20rem,88vw)] flex-col border-r border-border bg-background shadow-2xl"
        >
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-border px-5">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="text-sm font-bold tracking-[0.18em] text-primary"
            >
              AFGHAN HUB
            </Link>

            <Dialog.Close
              type="button"
              aria-label="Close navigation"
              className="rounded-xl p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <X className="size-5" />
            </Dialog.Close>
          </div>

          <nav aria-label="Main navigation" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-6">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Icon className="size-4.5" />
                  </span>
                  {item.label}

                  {item.href === "/messages" && unreadMessageCount > 0 ? (
                    <span
                      aria-label={`${unreadMessageCount} unread messages`}
                      className="ml-auto flex min-w-6 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground"
                    >
                      {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                    </span>
                  ) : null}

                  {item.href === "/moderation" && pendingModerationCount > 0 ? (
                    <span
                      aria-label={`${pendingModerationCount} submissions pending moderation`}
                      className="ml-auto flex min-w-6 items-center justify-center rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-bold text-amber-800"
                    >
                      {pendingModerationCount > 99 ? "99+" : pendingModerationCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="shrink-0 space-y-1 border-t border-border p-4">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <UserRound className="size-5" />
              Edit profile
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <Settings className="size-5" />
              Settings
            </Link>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
