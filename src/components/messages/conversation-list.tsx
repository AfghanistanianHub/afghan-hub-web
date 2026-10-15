"use client";

import Link from "next/link";
import { useState } from "react";
import { UserRound } from "lucide-react";
import { ExternalImage } from "@/components/ui/external-image";

export type ConversationListItem = {
  id: string;
  name: string;
  avatarUrl: string | null;
  preview: string;
  updatedAt: string;
  unreadCount: number;
};

export function ConversationList({ conversations, activeId }: { conversations: ConversationListItem[]; activeId?: string }) {
  const [search, setSearch] = useState("");
  const visible = conversations.filter((item) => `${item.name} ${item.preview}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  return (
    <div>
      <label className="grid gap-2 p-4 text-sm font-medium">Search conversations<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name or latest message" className="min-h-11 min-w-0 w-full rounded-[var(--radius-control)] border border-border bg-card px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" /></label>
      <p className="sr-only" role="status">{visible.length} conversations</p>
      <div className="divide-y divide-border">
        {visible.map((item) => <Link key={item.id} href={`/messages/${item.id}`} aria-current={activeId === item.id ? "page" : undefined} className={`flex items-start gap-3 px-4 py-4 transition hover:bg-muted/50 focus-visible:relative focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary ${activeId === item.id ? "bg-secondary/70" : item.unreadCount ? "bg-primary/[0.035]" : ""}`}>
          {item.avatarUrl ? <ExternalImage src={item.avatarUrl} alt="" width={44} height={44} className="size-11 shrink-0 rounded-full object-cover" /> : <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"><UserRound aria-hidden="true" className="size-5" /></span>}
          <div className="min-w-0 flex-1">
            <p className={`break-words text-sm ${item.unreadCount ? "font-bold" : "font-semibold"}`}>{item.name}</p>
            <p className="mt-1 truncate text-sm text-muted-foreground">{item.preview}</p>
            <time dateTime={item.updatedAt} className="mt-1 block text-xs text-muted-foreground">{new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(item.updatedAt))}</time>
          </div>
          {item.unreadCount > 0 ? <span aria-label={`${item.unreadCount} unread messages`} className="rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">{item.unreadCount > 99 ? "99+" : item.unreadCount}</span> : null}
        </Link>)}
      </div>
      {!visible.length ? <div className="px-4 py-6"><h2 className="font-semibold">{conversations.length ? "No matching conversations" : "No conversations yet"}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{conversations.length ? "Try another name or latest-message search." : "Connect with another member, then visit their profile to start a conversation."}</p>{conversations.length ? <button type="button" onClick={() => setSearch("")} className="mt-2 min-h-11 rounded-sm text-sm font-semibold text-primary underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Clear search</button> : <Link href="/network" className="mt-2 inline-flex min-h-11 items-center rounded-sm text-sm font-semibold text-primary underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Browse the network</Link>}</div> : null}
    </div>
  );
}
