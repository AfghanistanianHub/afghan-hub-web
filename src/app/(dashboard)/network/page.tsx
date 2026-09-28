import {
  ArrowRight,
  Sparkles,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { ConnectionRequests } from "@/components/network/connection-requests";
import { MemberDirectory } from "@/components/network/member-directory";
import { MyConnections } from "@/components/network/my-connections";
import { ConnectionThread } from "@/components/ui/connection-thread";
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

  const memberCount = members?.length ?? 0;
  const connectionCount = acceptedConnections?.length ?? 0;
  const requestCount = incomingRequests?.length ?? 0;

  return (
    <main className="px-4 py-8 md:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card px-6 py-8 shadow-[0_18px_55px_rgb(15_23_42/0.055)] md:px-8 md:py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end lg:gap-10">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_82%_15%,color-mix(in_oklab,var(--primary)_13%,transparent),transparent_28%),radial-gradient(circle_at_10%_92%,color-mix(in_oklab,var(--accent)_55%,transparent),transparent_30%)]" />
          <ConnectionThread className="pointer-events-none absolute -right-12 top-0 hidden h-56 w-[34rem] text-primary/45 xl:block" />

          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles aria-hidden="true" className="size-3.5" />
              Community network
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-[1.08] tracking-[-0.035em] text-foreground md:text-5xl">
              Discover the people behind the community.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              Find professionals, entrepreneurs, artists, students, and community leaders — then turn discovery into a real connection.
            </p>
          </div>

          <div className="relative mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:mt-0">
            <div className="rounded-2xl border border-border/80 bg-background/90 p-4 backdrop-blur">
              <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary"><UsersRound aria-hidden="true" className="size-4" /></span>
              <p className="mt-4 text-2xl font-bold tracking-tight">{memberCount}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">members visible</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-background/90 p-4 backdrop-blur">
              <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary"><ArrowRight aria-hidden="true" className="size-4" /></span>
              <p className="mt-4 text-2xl font-bold tracking-tight">{connectionCount}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">connections</p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-background/90 p-4 backdrop-blur">
              <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary"><UserPlus aria-hidden="true" className="size-4" /></span>
              <p className="mt-4 text-2xl font-bold tracking-tight">{requestCount}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">new requests</p>
            </div>
          </div>
        </section>

        <div className="mt-8 space-y-8">
          <ConnectionRequests requests={incomingRequests ?? []} />

          {user ? (
            <MyConnections currentUserId={user.id} connections={acceptedConnections ?? []} />
          ) : null}

          {error ? (
            <div role="alert" aria-live="assertive" className="relative overflow-hidden rounded-2xl border border-destructive/20 bg-destructive/[0.05] p-4 text-sm text-destructive"><div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-destructive/[0.06] blur-2xl"/><span className="relative">
              We could not load the member directory right now. Please try again shortly.</span>
            </div>
          ) : (
            <MemberDirectory members={members ?? []} />
          )}
        </div>
      </div>
    </main>
  );
}