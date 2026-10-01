"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, UserRound } from "lucide-react";

import {
  dashboardNavigation,
  moderationNavigation,
} from "@/components/dashboard/navigation";

type SidebarProps = {
  canModerate: boolean;
  pendingModerationCount: number;
  unreadMessageCount: number;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  canModerate,
  pendingModerationCount,
  unreadMessageCount,
}: SidebarProps) {
  const pathname = usePathname();
  const navigation = canModerate
    ? [...dashboardNavigation, moderationNavigation]
    : dashboardNavigation;

  return (
    <aside className="relative hidden min-h-screen w-64 shrink-0 overflow-hidden border-r border-sidebar-border/80 bg-sidebar lg:flex lg:flex-col">
      <div className="relative flex h-20 items-center border-b border-sidebar-border/80 px-5">
        <Link href="/dashboard" className="group inline-flex items-center gap-3 rounded-xl px-1 py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
          <span className="flex size-9 items-center justify-center rounded-2xl border border-primary-foreground/10 bg-primary text-sm font-medium text-primary-foreground transition-colors group-hover:bg-primary/90">
            AH
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-[0.16em] text-foreground">
              AFGHAN HUB
            </span>
            <span className="mt-0.5 block text-[0.65rem] font-medium tracking-wide text-muted-foreground">
              Community & opportunity
            </span>
          </span>
        </Link>
      </div>

      <div className="relative px-5 pt-5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Workspace
        </p>
      </div>

      <nav className="relative flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                active
                  ? "bg-primary/[0.09] text-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_12%,transparent)]"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute left-1 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-primary"
                />
              ) : null}
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-xl transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-transparent text-current group-hover:bg-background/70"
                }`}
              >
                <Icon aria-hidden="true" className="size-4.5" />
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

      <div className="relative border-t border-sidebar-border/80 p-3">
        <p className="px-3 pb-2 pt-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Account
        </p>
        <div className="space-y-1">
          <Link
            href="/profile"
            aria-current={isActivePath(pathname, "/profile") ? "page" : undefined}
            className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              isActivePath(pathname, "/profile")
                ? "bg-primary/[0.09] text-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <UserRound aria-hidden="true" className="size-5" />
            Edit profile
          </Link>

          <Link
            href="/settings"
            aria-current={isActivePath(pathname, "/settings") ? "page" : undefined}
            className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              isActivePath(pathname, "/settings")
                ? "bg-primary/[0.09] text-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Settings aria-hidden="true" className="size-5" />
            Settings
          </Link>
        </div>
      </div>
    </aside>
  );
}
