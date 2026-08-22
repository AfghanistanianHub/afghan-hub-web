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
        .or(
          "requester_id.eq." + user.id +
            ",recipient_id.eq." + user.id,
        )
        .order("updated_at", { ascending: false })
    : { data: [] };

  const { data: members, error } = await supabase
    .from("profiles")
    .select(
      `
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
      `,
    )
    .eq("is_public", true)
    .eq("onboarding_completed", true)
    .order("display_name", { ascending: true });

  return (
    <main className="px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Community network
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Discover community members
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-slate-400">
            Connect with Afghan professionals, entrepreneurs, artists,
            students, community leaders, and other members around the world.
          </p>
        </section>

        <ConnectionRequests requests={incomingRequests ?? []} />

        {user ? (
          <MyConnections
            currentUserId={user.id}
            connections={acceptedConnections ?? []}
          />
        ) : null}

        {error ? (
          <div className="mt-8 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
            We could not load the member directory: {error.message}
          </div>
        ) : (
          <MemberDirectory members={members ?? []} />
        )}
      </div>
    </main>
  );
}
