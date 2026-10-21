"use client";

import { useSyncExternalStore } from "react";
import { CommunityNavigator } from "@/components/assistant/community-navigator";
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
import { readSiteLanguagePreference, saveSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";
import { getSharedUiCopy } from "@/lib/i18n/shared-ui-copy";

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
  const language = useSyncExternalStore(subscribeSiteLanguagePreference, readSiteLanguagePreference, (): SiteLanguage => "en");
  const copy = getSharedUiCopy(language);
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header lang={language} dir={language === "en" ? "ltr" : "rtl"} className="sticky top-0 z-20 flex h-20 items-center justify-between gap-2 border-b border-border/70 bg-background px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3 md:flex-1">
        <MobileNavigation
          canModerate={canModerate}
          pendingModerationCount={pendingModerationCount}
          unreadMessageCount={unreadMessageCount}
        />

        <Link
          href="/dashboard"
          className="rounded-sm font-semibold tracking-[0.16em] text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:hidden"
        >
          <span className="text-base sm:hidden">AH</span>
          <span className="hidden text-sm sm:inline">AFGHAN HUB</span>
        </Link>

        <form
          action="/search"
          role="search"
          className="relative hidden min-w-0 max-w-[28rem] flex-1 md:block"
        >
          <Search aria-hidden="true" className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <input
            name="q"
            type="search"
            placeholder={copy.searchPlaceholder}
            aria-label={copy.searchAfghanHub}
            className={`${styles.search} w-full border border-border bg-card py-3 ps-11 pe-4 text-sm text-foreground placeholder:text-muted-foreground`}
          />
        </form>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="sr-only">{copy.language}</span>
          <select
            aria-label={copy.language}
            value={language}
            onChange={(e) => saveSiteLanguagePreference(e.target.value)}
            className="rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          >
            <option value="en" lang="en">English</option>
            <option value="fa" lang="fa">فارسی</option>
            <option value="ps" lang="ps">پښتو</option>
          </select>
        </label>

        <CommunityNavigator />
        <NotificationBell
          currentUserId={currentUserId}
          notifications={notifications}
          unreadCount={unreadNotificationCount}
        />

        <div className="hidden text-right xl:block">
          <p className="max-w-28 truncate text-sm font-semibold text-foreground lg:max-w-48">{displayName}</p>
          <p className="max-w-28 truncate text-xs text-muted-foreground">{email}</p>
        </div>

        <div className="flex size-10 items-center justify-center rounded-full border border-primary/15 bg-primary font-bold text-primary-foreground ring-4 ring-primary/8 sm:size-11">
          {initial}
        </div>

        <form action={logout}>
          <SignOutSubmit
            label={copy.signOut}
            pendingLabel={copy.signingOut}
            signingOutAriaLabel={copy.signingOut}
            className={`inline-flex size-11 items-center justify-center gap-2 border border-border bg-card px-3 text-sm font-semibold text-foreground hover:border-primary/30 hover:bg-secondary sm:w-32 sm:px-4 ${styles.control}`}
          />
        </form>
      </div>
    </header>
  );
}
