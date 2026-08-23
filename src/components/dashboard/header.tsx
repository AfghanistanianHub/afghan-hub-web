import Link from "next/link";
import { Search } from "lucide-react";
import { logout } from "@/app/(dashboard)/actions";
import { MobileNavigation } from "@/components/dashboard/mobile-navigation";
import {
  NotificationBell,
  type NotificationSummary,
} from "@/components/dashboard/notification-bell";

type HeaderProps = {
  currentUserId: string;
  displayName: string;
  email: string;
  notifications: NotificationSummary[];
  unreadNotificationCount: number;
  unreadMessageCount: number;
};

export function Header({
  currentUserId,
  displayName,
  email,
  notifications,
  unreadNotificationCount,
  unreadMessageCount,
}: HeaderProps) {
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <MobileNavigation
          unreadMessageCount={unreadMessageCount}
        />

        <Link
          href="/"
          className="text-sm font-bold tracking-[0.18em] text-emerald-400 lg:hidden"
        >
          AFGHAN HUB
        </Link>

        <form
          action="/search"
          role="search"
          className="relative hidden w-80 md:block"
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />

          <input
            name="q"
            type="search"
            placeholder="Search Afghan Hub"
            aria-label="Search Afghan Hub"
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500"
          />
        </form>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell
          currentUserId={currentUserId}
          notifications={notifications}
          unreadCount={unreadNotificationCount}
        />

        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-white">{displayName}</p>
          <p className="max-w-48 truncate text-xs text-slate-500">{email}</p>
        </div>

        <div className="flex size-11 items-center justify-center rounded-full bg-emerald-500 font-bold text-slate-950">
          {initial}
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-900 hover:text-white"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
