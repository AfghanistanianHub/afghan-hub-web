"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNavigation({
  canModerate,
  pendingModerationCount,
  unreadMessageCount,
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
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
              className="inline-flex items-center gap-3"
            >
              <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-sm font-black text-primary-foreground shadow-sm">
                A
              </span>
              <span>
                <span className="block text-sm font-extrabold tracking-[0.16em] text-foreground">AFGHAN HUB</span>
                <span className="mt-0.5 block text-[0.65rem] text-muted-foreground">Community workspace</span>
              </span>
            </Link>

            <Dialog.Close
              type="button"
              aria-label="Close navigation"
              className="rounded-xl p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              <X className="size-5" />
            </Dialog.Close>
          </div>

          <div className="px-5 pt-5">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
          </div>

          <nav aria-label="Main navigation" className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-3">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-primary/[0.09] text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {active ? <span aria-hidden="true" className="absolute left-1 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary" /> : null}
                  <span
                    className={`flex size-9 items-center justify-center rounded-xl ${
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-4.5" />
                  </span>
                  <span className="truncate">{item.label}</span>

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
                      className="ml-auto flex min-w-6 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-xs font-bold text-accent-foreground"
                    >
                      {pendingModerationCount > 99 ? "99+" : pendingModerationCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="shrink-0 border-t border-border p-3">
            <p className="px-3 pb-2 pt-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Account</p>
            <div className="space-y-1">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                aria-current={isActivePath(pathname, "/profile") ? "page" : undefined}
                className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition ${
                  isActivePath(pathname, "/profile") ? "bg-primary/[0.09] text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <UserRound className="size-5" />
                Edit profile
              </Link>

              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                aria-current={isActivePath(pathname, "/settings") ? "page" : undefined}
                className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition ${
                  isActivePath(pathname, "/settings") ? "bg-primary/[0.09] text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <Settings className="size-5" />
                Settings
              </Link>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
