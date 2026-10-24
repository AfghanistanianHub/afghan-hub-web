import { NetworkOverview } from "@/components/network/network-overview";
import { NetworkError } from "@/components/network/network-error";
import { catalogPageContainerClass } from "@/components/catalog/catalog-filter-styles";
import { ConnectionRequests } from "@/components/network/connection-requests";
import { MemberDirectory } from "@/components/network/member-directory";
import { MyConnections } from "@/components/network/my-connections";
import { createClient } from "@/lib/supabase/server";

export default async function NetworkPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: incomingRequests, error: incomingRequestsError } = user
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
    : { data: [], error: null };

  const { data: acceptedConnections, error: acceptedConnectionsError } = user
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
            country,
            avatar_url
          ),
          recipient:profiles!connections_recipient_id_fkey (
            id,
            display_name,
            first_name,
            last_name,
            headline,
            city,
            country,
            avatar_url
          )
        `)
        .eq("status", "accepted")
        .or("requester_id.eq." + user.id + ",recipient_id.eq." + user.id)
        .order("updated_at", { ascending: false })
    : { data: [], error: null };

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
      skills,
      open_to_mentoring,
      looking_for_mentor,
      mentorship_topics
    `)
    .eq("is_public", true)
    .eq("onboarding_completed", true)
    .order("display_name", { ascending: true });

  const memberCount = members?.length ?? 0;
  const connectionCount = acceptedConnections?.length ?? 0;
  const requestCount = incomingRequests?.length ?? 0;


  return (
    <main
      data-illustration-focus-scope
      className={catalogPageContainerClass}
    >
      <div>
        <NetworkOverview memberCount={memberCount} connectionCount={connectionCount} requestCount={requestCount} />

        <div className="mt-5 space-y-6 lg:mt-6 lg:space-y-7">
          {incomingRequestsError ? (
            <div
              role="alert"
              aria-live="assertive"
              className="relative overflow-hidden rounded-[var(--radius)] border border-destructive/20 bg-destructive/[0.05] p-4 text-sm text-destructive"
            >
              <NetworkError messageKey="requestsError" />
            </div>
          ) : (
            <ConnectionRequests requests={incomingRequests ?? []} />
          )}

          {user ? (
            acceptedConnectionsError ? (
              <div
                role="alert"
                aria-live="assertive"
                className="relative overflow-hidden rounded-[var(--radius)] border border-destructive/20 bg-destructive/[0.05] p-4 text-sm text-destructive"
              >
                <NetworkError messageKey="connectionsError" />
              </div>
            ) : (
              <MyConnections currentUserId={user.id} connections={acceptedConnections ?? []} />
            )
          ) : null}

          {error ? (
            <div
              role="alert"
              aria-live="assertive"
              className="relative overflow-hidden rounded-[var(--radius)] border border-destructive/20 bg-destructive/[0.05] p-4 text-sm text-destructive"
            >
              <span className="relative">
                <NetworkError messageKey="directoryError" />
              </span>
            </div>
          ) : (
            <MemberDirectory members={members ?? []} />
          )}
        </div>
      </div>
    </main>
  );
}
