import { ContextualAssistantPrompt } from "@/components/assistant/contextual-assistant-prompt";
import {
  ArrowRight,
  Sparkles,
  UserPlus,
  UsersRound,
} from "lucide-react";
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

  const stats = [
    {
      label: "Members",
      value: memberCount,
      helper: "visible",
      icon: UsersRound,
    },
    {
      label: "Connections",
      value: connectionCount,
      helper: "connected",
      icon: ArrowRight,
    },
    {
      label: "Requests",
      value: requestCount,
      helper: "new",
      icon: UserPlus,
    },
  ];

  return (
    <main
      data-illustration-focus-scope
      className="px-4 py-7 sm:px-6 md:px-8 lg:px-10 xl:px-12"
    >
      <div className="mx-auto w-full max-w-[1500px]">
        <section
          data-illustration-trigger
          className="relative border-b border-border pb-5"
        >
          <div className="relative min-w-0">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <Sparkles aria-hidden="true" className="size-3.5" />
              Community network
            </div>

            <h1 className="mt-2 text-3xl font-medium tracking-tight text-foreground">
              Your network
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
              Find professionals, entrepreneurs, artists, students, and community leaders — then turn discovery into a real connection.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <ContextualAssistantPrompt
                label="Find tech professionals"
                query="Find professionals working in technology"
              />
              <ContextualAssistantPrompt
                label="Find artists"
                query="Find artists working in arts and culture"
              />
              <ContextualAssistantPrompt
                label="Find mentors"
                query="Find mentors in the community"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-3">
              {stats.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex min-h-11 items-center gap-2 text-sm"
                >
                  <Icon aria-hidden="true" className="size-4 text-primary" /><span className="font-semibold">{value}</span><span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

        </section>

        <div className="mt-7 space-y-7 lg:mt-8 lg:space-y-8">
          {incomingRequestsError ? (
            <div
              role="alert"
              aria-live="assertive"
              className="relative overflow-hidden rounded-[var(--radius)] border border-destructive/20 bg-destructive/[0.05] p-4 text-sm text-destructive"
            >
              We could not load your connection requests right now. Please try again shortly.
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
                We could not load your connections right now. Please try again shortly.
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
                We could not load the member directory right now. Please try again shortly.
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
