import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalizedUpdatePasswordContent } from "./localized-update-password-content";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function UpdatePasswordPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?error=${encodeURIComponent("Open a valid password reset link before choosing a new password.")}`);
  }
  return <LocalizedUpdatePasswordContent error={error} />;
}
