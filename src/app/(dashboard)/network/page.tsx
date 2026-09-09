import { ConnectionRequests } from "@/components/network/connection-requests";
import { MemberDirectory } from "@/components/network/member-directory";
import { MyConnections } from "@/components/network/my-connections";
import { createClient } from "@/lib/supabase/server";

export default async function NetworkPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: incomingRequests } = user
    ? await supabase
        .from("connections")
        .select(`
          id,
          requester:profiles!connections_requester_id_fkey (
            id,
            display_name,
            first_name,
            last_name,
            avatar_url,
            headline
          )
        `)
        .eq("recipient_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
    : { data: [] };

  const { data: acceptedConnections } = user
    ? await supabase
        .from("connections")
        .select(`
          id,
          requester_id,
          recipient_id,
          requester:profiles!connections_requester_id_fkey (
            id,
            display_name,
            first_name,
            last_name,
            headline,
            city,
            country
          ),
          recipient:profiles!connections_recipient_id_fkey (
            id,
            display_name,
            first_name,
            last_name,
            headline,
            city,
            country
          )
        `)
        .eq("status", "accepted")
        .or("requester_id.eq." + user.id + ",recipient_id.eq." + user.id)
        .order("updated_at", { ascending: false })
    : { data: [] };

  const { data: members, error } = await supabase
    .from("profiles")
    .select(`
      id,
      display_name,
      first_name,
      last_name,
      headline,
      profession,
      company,
      city,
      province_state,
      country,
      avatar_url,
      skills
    `)
    .eq("is_public", true)
    .eq("onboarding_completed", true)
    .order("display_name", { ascending: true });

  return (
    <main className="px-4 py-8 md:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-3xl border border-border bg-card px-6 py-8 shadow-sm md:px-8 md:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Community network</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Discover people across the Afghan community
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            Connect with professionals, entrepreneurs, artists, students, community leaders, and other members around the world.
          </p>
        </section>

        <ConnectionRequests requests={incomingRequests ?? []} />

        {user ? (
          <MyConnections currentUserId={user.id} connections={acceptedConnections ?? []} />
        ) : null}

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            We could not load the member directory: {error.message}
          </div>
        ) : (
          <MemberDirectory members={members ?? []} />
        )}
      </div>
    </main>
  );
}
