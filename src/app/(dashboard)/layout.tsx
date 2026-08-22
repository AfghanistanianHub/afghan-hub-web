import { redirect } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import type { NotificationSummary } from "@/components/dashboard/notification-bell";
import { Sidebar } from "@/components/dashboard/sidebar";
import { createClient } from "@/lib/supabase/server";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [
    { data: profile },
    { data: notificationRows },
    { count: unreadNotificationCount },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name,first_name,onboarding_completed")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("notifications")
      .select(`
        id,
        type,
        conversation_id,
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
  ]);

  if (!profile?.onboarding_completed) {
    redirect("/profile");
  }

  const displayName =
    profile.display_name?.trim() ||
    profile.first_name?.trim() ||
    user.email?.split("@")[0] ||
    "Member";

  const notifications: NotificationSummary[] = (
    notificationRows ?? []
  ).map((notification) => {
    const actor = Array.isArray(notification.actor)
      ? notification.actor[0]
      : notification.actor;

    return {
      id: notification.id,
      type: notification.type,
      conversationId: notification.conversation_id,
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

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <Header
            currentUserId={user.id}
            displayName={displayName}
            email={user.email ?? ""}
            notifications={notifications}
            unreadNotificationCount={unreadNotificationCount ?? 0}
          />

          {children}
        </div>
      </div>
    </div>
  );
}
