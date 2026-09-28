import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import type { NotificationSummary } from "@/components/dashboard/notification-bell";
import { Sidebar } from "@/components/dashboard/sidebar";
import { RealtimeMessageRefresh } from "@/components/messages/realtime-message-refresh";
import { getTotalUnreadMessageCount } from "@/lib/messages";
import { getMyAccessContext } from "@/lib/profile-access";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { robots: { index: false, follow: false } };

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: profile },
    { data: accessContext },
    { data: notificationRows },
    { count: unreadNotificationCount },
    { data: unreadMessageRows },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name,first_name")
      .eq("id", user.id)
      .maybeSingle(),
    getMyAccessContext(supabase, user.id),
    supabase
      .from("notifications")
      .select(`
        id,
        type,
        conversation_id,
        content_type,
        content_slug,
        content_title,
        content_note,
        read_at,
        created_at,
        actor:profiles!notifications_actor_id_fkey (
          id,
          display_name,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .is("read_at", null),
    supabase.rpc("get_unread_message_counts"),
  ]);

  if (!accessContext?.onboarding_completed) {
    redirect("/profile");
  }

  const displayName =
    profile?.display_name?.trim() ||
    profile?.first_name?.trim() ||
    user.email?.split("@")[0] ||
    "Member";
  const canModerate =
    accessContext.role === "admin" || accessContext.role === "moderator";

  let pendingModerationCount = 0;

  if (canModerate) {
    const [
      { count: pendingOpportunities },
      { count: pendingEvents },
      { count: pendingBusinesses },
      { count: pendingOrganizations },
    ] = await Promise.all([
      supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("status", "draft"),
      supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "draft"),
      supabase.from("businesses").select("id", { count: "exact", head: true }).eq("status", "draft"),
      supabase.from("organizations").select("id", { count: "exact", head: true }).eq("status", "draft"),
    ]);

    pendingModerationCount =
      (pendingOpportunities ?? 0) +
      (pendingEvents ?? 0) +
      (pendingBusinesses ?? 0) +
      (pendingOrganizations ?? 0);
  }

  const notifications: NotificationSummary[] = (notificationRows ?? []).map((notification) => {
    const actor = Array.isArray(notification.actor) ? notification.actor[0] : notification.actor;

    return {
      id: notification.id,
      type: notification.type,
      conversationId: notification.conversation_id,
      contentType: notification.content_type,
      contentSlug: notification.content_slug,
      contentTitle: notification.content_title,
      contentNote: notification.content_note,
      readAt: notification.read_at,
      createdAt: notification.created_at,
      actor: actor
        ? {
            id: actor.id,
            displayName: actor.display_name,
            firstName: actor.first_name,
            lastName: actor.last_name,
            avatarUrl: actor.avatar_url,
          }
        : null,
    };
  });

  const unreadMessageCount = getTotalUnreadMessageCount(
    new Map(
      (unreadMessageRows ?? []).map((row) => [
        row.conversation_id,
        Number(row.unread_count),
      ]),
    ),
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_78%_4%,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_24%),radial-gradient(circle_at_18%_96%,color-mix(in_oklab,var(--accent)_42%,transparent),transparent_30%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.018] [background-image:linear-gradient(to_right,var(--foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--foreground)_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <RealtimeMessageRefresh currentUserId={user.id} />
      <div className="flex min-h-screen">
        <Sidebar
          canModerate={canModerate}
          pendingModerationCount={pendingModerationCount}
          unreadMessageCount={unreadMessageCount}
        />

        <div className="min-w-0 flex-1">
          <Header
            canModerate={canModerate}
            currentUserId={user.id}
            displayName={displayName}
            email={user.email ?? ""}
            notifications={notifications}
            pendingModerationCount={pendingModerationCount}
            unreadNotificationCount={unreadNotificationCount ?? 0}
            unreadMessageCount={unreadMessageCount}
          />

          {children}
        </div>
      </div>
    </div>
  );
}
