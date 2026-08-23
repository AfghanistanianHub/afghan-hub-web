"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Settings, UserRound, X } from "lucide-react";

import { dashboardNavigation } from "@/components/dashboard/navigation";

type MobileNavigationProps = {
  unreadMessageCount: number;
};

export function MobileNavigation({
  unreadMessageCount,
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        aria-controls="mobile-navigation"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-slate-800 p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          <aside
            id="mobile-navigation"
            aria-label="Main navigation"
            className="relative flex h-full w-[min(20rem,88vw)] flex-col border-r border-slate-800 bg-slate-950 shadow-2xl"
          >
            <div className="flex h-20 items-center justify-between border-b border-slate-800 px-5">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="text-sm font-bold tracking-[0.18em] text-emerald-400"
              >
                AFGHAN HUB
              </Link>

              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
              {dashboardNavigation.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
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
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
              >
                <UserRound className="size-5" />
                Edit profile
              </Link>

              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
              >
                <Settings className="size-5" />
                Settings
              </Link>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
