import Link from "next/link";
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

export function Sidebar({
  canModerate,
  pendingModerationCount,
  unreadMessageCount,
}: SidebarProps) {
  const navigation = canModerate
    ? [...dashboardNavigation, moderationNavigation]
    : dashboardNavigation;

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar/95 lg:flex lg:flex-col">
      <div className="flex h-20 items-center border-b border-sidebar-border px-6">
        <Link href="/dashboard" className="group inline-flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-primary text-sm font-black text-primary-foreground shadow-sm transition-transform group-hover:-rotate-3">
            A
          </span>
          <span className="text-sm font-extrabold tracking-[0.18em] text-foreground">
            AFGHAN HUB
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Icon className="size-5 transition-transform group-hover:scale-105" />
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
                  className="ml-auto flex min-w-6 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-xs font-bold text-accent-foreground"
                >
                  {pendingModerationCount > 99 ? "99+" : pendingModerationCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1.5 border-t border-sidebar-border p-4">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <UserRound className="size-5" />
          Edit profile
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Settings className="size-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
