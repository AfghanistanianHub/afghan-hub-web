import Link from "next/link";
import { Search } from "lucide-react";
import { logout } from "@/app/(dashboard)/actions";
import { MobileNavigation } from "@/components/dashboard/mobile-navigation";
import {
  NotificationBell,
  type NotificationSummary,
} from "@/components/dashboard/notification-bell";

type HeaderProps = {
  canModerate: boolean;
  currentUserId: string;
  displayName: string;
  email: string;
  notifications: NotificationSummary[];
  pendingModerationCount: number;
  unreadNotificationCount: number;
  unreadMessageCount: number;
};

export function Header({
  canModerate,
  currentUserId,
  displayName,
  email,
  notifications,
  pendingModerationCount,
  unreadNotificationCount,
  unreadMessageCount,
}: HeaderProps) {
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-border/70 bg-background/78 px-4 shadow-[0_8px_28px_rgb(15_23_42/0.035)] backdrop-blur-2xl supports-[backdrop-filter]:bg-background/72 md:px-8">
      <div className="flex items-center gap-3">
        <MobileNavigation
          canModerate={canModerate}
          pendingModerationCount={pendingModerationCount}
          unreadMessageCount={unreadMessageCount}
        />

        <Link
          href="/dashboard"
          className="text-sm font-extrabold tracking-[0.18em] text-primary lg:hidden"
        >
          AFGHAN HUB
        </Link>

        <form
          action="/search"
          role="search"
          className="relative hidden w-[22rem] md:block"
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <input
            name="q"
            type="search"
            placeholder="Search people, organizations, opportunities..."
            aria-label="Search Afghan Hub"
            className="w-full rounded-2xl border border-border/80 bg-card/72 py-3 pl-11 pr-4 text-sm text-foreground shadow-[0_8px_24px_rgb(15_23_42/0.035)] outline-none transition placeholder:text-muted-foreground hover:border-primary/20 focus:border-primary/45 focus:bg-card focus:ring-4 focus:ring-primary/10"
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
          <p className="text-sm font-semibold text-foreground">{displayName}</p>
          <p className="max-w-48 truncate text-xs text-muted-foreground">{email}</p>
        </div>

        <div className="flex size-11 items-center justify-center rounded-full border border-primary/15 bg-primary font-bold text-primary-foreground shadow-[0_6px_18px_color-mix(in_oklab,var(--primary)_18%,transparent)] ring-4 ring-primary/8">
          {initial}
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="rounded-2xl border border-border/80 bg-card/72 px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/20 hover:bg-muted/70"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
