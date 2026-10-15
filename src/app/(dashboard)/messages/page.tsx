import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { MemberPageHeader } from "@/components/catalog/member-page-header";
import { ConversationNavigation } from "@/components/messages/conversation-navigation";
import { createClient } from "@/lib/supabase/server";

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 md:px-8">
      <MemberPageHeader title="Messages" description="Conversations with your Afghan Hub connections." icon={MessageSquare}><Link href="/network" className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-border bg-card px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Find people</Link></MemberPageHeader>
      <div className="mt-5 border-y border-border bg-card"><ConversationNavigation currentUserId={user.id} /></div>
    </main>
  );
}
