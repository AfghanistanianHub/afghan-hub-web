import { ContextualAssistantPrompt } from "@/components/assistant/contextual-assistant-prompt";
import { CatalogIllustration } from "@/components/public/catalog-illustration";
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
          className="relative overflow-hidden border-y border-border/80 px-1 py-7 sm:px-2 sm:py-8 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.75fr)] lg:items-center lg:gap-10 lg:px-4 lg:py-9 xl:gap-14"
        >
          <div className="relative min-w-0">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <Sparkles aria-hidden="true" className="size-3.5" />
              Community network
            </div>

            <h1 className="mt-4 max-w-3xl text-3xl font-medium leading-[1.06] tracking-[-0.04em] text-foreground md:text-4xl xl:text-[2.7rem]">
              Discover the people behind the community.
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
                label="Find filmmakers"
                query="Find professionals working in film and media"
              />
              <ContextualAssistantPrompt
                label="Find mentors"
                query="Find mentors in the community"
              />
            </div>

            <div className="mt-6 grid max-w-2xl grid-cols-3 border-y border-border/80">
              {stats.map(({ label, value, helper, icon: Icon }, index) => (
                <div
                  key={label}
                  className={`min-w-0 py-3.5 ${index > 0 ? "border-l border-border/80 pl-4 sm:pl-5" : "pr-4 sm:pr-5"}`}
                >
                  <div className="flex items-center gap-2 text-primary">
                    <Icon aria-hidden="true" className="size-3.5 shrink-0" />
                    <p className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.12em]">{label}</p>
                  </div>
                  <div className="mt-2 flex min-w-0 items-baseline gap-1.5">
                    <p className="text-xl font-bold tracking-tight text-foreground">{value}</p>
                    <p className="truncate text-xs text-muted-foreground">{helper}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-7 flex min-h-52 items-center justify-center lg:mt-0 lg:min-h-0 lg:justify-end">
            <div className="pointer-events-none absolute inset-x-8 top-1/2 h-36 -translate-y-1/2 rounded-full bg-primary/[0.035] blur-3xl" />
            <div className="relative w-full max-w-[360px] lg:max-w-[390px] xl:max-w-[420px]" aria-hidden="true">
              <CatalogIllustration interactive kind="people" />
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
