import { SignOutSubmit } from "@/components/dashboard/action-submit";
import styles from "@/components/network/network-surfaces.module.css";
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
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-border/70 bg-background px-4 md:px-8">
      <div className="flex items-center gap-2 sm:gap-3">
        <MobileNavigation
          canModerate={canModerate}
          pendingModerationCount={pendingModerationCount}
          unreadMessageCount={unreadMessageCount}
        />

        <Link
          href="/dashboard"
          className="rounded-sm font-extrabold tracking-[0.16em] text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:hidden"
        >
          <span className="text-base sm:hidden">AH</span>
          <span className="hidden text-sm sm:inline">AFGHAN HUB</span>
        </Link>

        <form
          action="/search"
          role="search"
          className="relative hidden md:block md:w-48 lg:w-[22rem]"
        >
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <input
            name="q"
            type="search"
            placeholder="Search people, organizations, opportunities..."
            aria-label="Search Afghan Hub"
            className={`${styles.search} w-full border border-border bg-card py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground`}
          />
        </form>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <NotificationBell
          currentUserId={currentUserId}
          notifications={notifications}
          unreadCount={unreadNotificationCount}
        />

        <div className="hidden text-right sm:block">
          <p className="max-w-28 truncate text-sm font-semibold text-foreground lg:max-w-48">{displayName}</p>
          <p className="max-w-28 truncate text-xs text-muted-foreground">{email}</p>
        </div>

        <div className="flex size-10 items-center justify-center rounded-full border border-primary/15 bg-primary font-bold text-primary-foreground ring-4 ring-primary/8 sm:size-11">
          {initial}
        </div>

        <form action={logout}>
          <SignOutSubmit className={`inline-flex size-11 items-center justify-center gap-2 border border-border bg-card px-3 text-sm font-semibold text-foreground hover:border-primary/30 hover:bg-secondary sm:w-32 sm:px-4 ${styles.control}`} />
        </form>
      </div>
    </header>
  );
}
