import { redirect } from "next/navigation";
import { Header } from "@/components/dashboard/header";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,first_name,onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed) {
    redirect("/profile");
  }

  const displayName =
    profile.display_name?.trim() ||
    profile.first_name?.trim() ||
    user.email?.split("@")[0] ||
    "Member";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <Header
            displayName={displayName}
            email={user.email ?? ""}
          />

          {children}
        </div>
      </div>
    </div>
  );
}
