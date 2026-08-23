import Link from "next/link";
import { Settings, UserRound } from "lucide-react";

import {
  dashboardNavigation,
  moderationNavigation,
} from "@/components/dashboard/navigation";

type SidebarProps = {
  canModerate: boolean;
  unreadMessageCount: number;
};

export function Sidebar({
  canModerate,
  unreadMessageCount,
}: SidebarProps) {
  const navigation = canModerate
    ? [...dashboardNavigation, moderationNavigation]
    : dashboardNavigation;

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-slate-800 bg-slate-950 lg:flex lg:flex-col">
      <div className="flex h-20 items-center border-b border-slate-800 px-6">
        <Link href="/" className="text-lg font-bold tracking-[0.22em] text-emerald-400">
          AFGHAN HUB
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-900 hover:text-white"
            >
              <Icon className="size-5" />
              {item.label}
              {item.href === "/messages" &&
              unreadMessageCount > 0 ? (
                <span
                  aria-label={`${unreadMessageCount} unread messages`}
                  className="ml-auto flex min-w-6 items-center justify-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-xs font-bold text-slate-950"
                >
                  {unreadMessageCount > 99
                    ? "99+"
                    : unreadMessageCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-800 p-4">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-900 hover:text-white"
        >
          <UserRound className="size-5" />
          Edit profile
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-900 hover:text-white"
        >
          <Settings className="size-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
