import { ContextualAssistantPrompt } from "@/components/assistant/contextual-assistant-prompt";
import {
  ArrowRight,
  Sparkles,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { catalogPageContainerClass } from "@/components/catalog/catalog-filter-styles";
import { ConnectionRequests } from "@/components/network/connection-requests";
import { Localized } from "@/components/i18n/localized";
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
      labelKey: "network.members" as const,
      value: memberCount,
      icon: UsersRound,
    },
    {
      labelKey: "network.connections" as const,
      value: connectionCount,
      icon: ArrowRight,
    },
    {
      labelKey: "network.requests" as const,
      value: requestCount,
      icon: UserPlus,
    },
  ];

  return (
    <main
      data-illustration-focus-scope
      className={catalogPageContainerClass}
    >
      <div>
        <section
          data-illustration-trigger
          className="relative border-b border-border/70 pb-9 pt-4 sm:pt-6"
        >
          <div className="relative min-w-0">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <Sparkles aria-hidden="true" className="size-3.5" />
              <Localized k="network.eyebrow" />
            </div>

            <h1 className="mt-4 max-w-[22ch] text-balance text-[clamp(2.1rem,3.8vw,3.6rem)] font-medium leading-[1.08] tracking-[-0.045em] text-foreground">
              <Localized k="network.title" />
            </h1>

            <p className="mt-5 max-w-[65ch] text-base leading-7 text-muted-foreground">
              <Localized k="network.description" />
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <ContextualAssistantPrompt
                label={<Localized k="network.findTech" />}
                query="Find professionals working in technology"
              />
              <ContextualAssistantPrompt
                label={<Localized k="network.findArtists" />}
                query="Find artists working in arts and culture"
              />
              <ContextualAssistantPrompt
                label={<Localized k="network.findMentors" />}
                query="Find mentors in the community"
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-border/70 pt-5">
              {stats.map(({ labelKey, value, icon: Icon }) => (
                <div
                  key={labelKey}
                  className="flex min-h-11 items-center gap-2 text-sm"
                >
                  <Icon aria-hidden="true" className="size-4 text-primary" /><span className="font-semibold">{value}</span><span className="text-muted-foreground"><Localized k={labelKey} /></span>
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
              <Localized k="network.requestsError" />
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
                <Localized k="network.connectionsError" />
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
                <Localized k="network.directoryError" />
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
