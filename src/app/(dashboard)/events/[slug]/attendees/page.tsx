import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  UserRound,
  UsersRound,
} from "lucide-react";

import { ExternalImage } from "@/components/ui/external-image";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function getMemberName(profile: {
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
}) {
  return (
    profile.display_name?.trim() ||
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    "Afghan Hub Member"
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default async function EventAttendeesPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(
      "id,title,slug,starts_at,venue_name,city,country,is_online,capacity,creator_id,status",
    )
    .eq("slug", slug)
    .eq("creator_id", user.id)
    .maybeSingle();

  if (eventError) {
    console.error("Could not load event for attendee management:", eventError);
  }

  if (!event) {
    notFound();
  }

  const { data: registrations, error: registrationError } = await supabase
    .from("event_rsvps")
    .select("profile_id,created_at")
    .eq("event_id", event.id)
    .order("created_at", { ascending: true });

  if (registrationError) {
    console.error("Could not load event registrations:", registrationError);
  }

  const profileIds =
    registrations?.map((registration) => registration.profile_id) ?? [];

  const { data: publicProfiles, error: profileError } = profileIds.length
    ? await supabase
        .from("profiles")
        .select(
          "id,display_name,first_name,last_name,headline,city,country,avatar_url,is_public,onboarding_completed",
        )
        .in("id", profileIds)
        .eq("is_public", true)
        .eq("onboarding_completed", true)
    : { data: [], error: null };

  if (profileError) {
    console.error("Could not load attendee profiles:", profileError);
  }

  const profileById = new Map(
    (publicProfiles ?? []).map((profile) => [profile.id, profile]),
  );
  const attendeeCount = registrations?.length ?? 0;
  const remaining =
    event.capacity === null
      ? null
      : Math.max(event.capacity - attendeeCount, 0);
  const location = event.is_online
    ? "Online"
    : [event.venue_name, event.city, event.country].filter(Boolean).join(", ");

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href={`/events/${event.slug}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-emerald-400"
      >
        <ArrowLeft className="size-4" />
        Back to event
      </Link>

      <section className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-semibold text-emerald-400">
              Host tools
            </p>
            <h1 className="mt-1 text-3xl font-bold text-white md:text-4xl">
              Event attendees
            </h1>
            <p className="mt-3 text-lg text-slate-300">{event.title}</p>
          </div>

          <Link
            href={`/events/${event.slug}/edit`}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            Edit event
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-400">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1.5">
            <CalendarDays className="size-4 text-emerald-400" />
            {formatDateTime(event.starts_at)}
          </span>
          {location ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1.5">
              <MapPin className="size-4 text-emerald-400" />
              {location}
            </span>
          ) : null}
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <p className="text-sm text-slate-500">Registered</p>
            <p className="mt-2 text-3xl font-bold text-white">{attendeeCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <p className="text-sm text-slate-500">Capacity</p>
            <p className="mt-2 text-3xl font-bold text-white">
              {event.capacity ?? "Unlimited"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
            <p className="text-sm text-slate-500">Remaining</p>
            <p className="mt-2 text-3xl font-bold text-white">
              {remaining ?? "Unlimited"}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Registered members</h2>
            <p className="mt-1 text-sm text-slate-500">
              Only public profile details are shown here. Private members remain anonymous.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-300">
            <UsersRound className="size-4" />
            {attendeeCount}
          </span>
        </div>

        {registrations?.length ? (
          <div className="mt-6 divide-y divide-slate-800">
            {registrations.map((registration) => {
              const profile = profileById.get(registration.profile_id);

              if (!profile) {
                return (
                  <div
                    key={registration.profile_id}
                    className="flex items-center gap-4 py-5 first:pt-0 last:pb-0"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-500">
                      <UserRound className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-300">
                        Private member
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Registered {formatDateTime(registration.created_at)}
                      </p>
                    </div>
                  </div>
                );
              }

              const memberName = getMemberName(profile);
              const memberLocation = [profile.city, profile.country]
                .filter(Boolean)
                .join(", ");

              return (
                <div
                  key={registration.profile_id}
                  className="flex flex-wrap items-center justify-between gap-4 py-5 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    {profile.avatar_url ? (
                      <ExternalImage
                        src={profile.avatar_url}
                        alt={memberName}
                        width={48}
                        height={48}
                        className="size-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 font-bold text-emerald-300">
                        {getInitials(memberName) || <UserRound className="size-5" />}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">
                        {memberName}
                      </p>
                      {profile.headline ? (
                        <p className="mt-1 truncate text-sm text-slate-400">
                          {profile.headline}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-slate-500">
                        {memberLocation ? `${memberLocation} · ` : ""}
                        Registered {formatDateTime(registration.created_at)}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/members/${profile.id}`}
                    className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
                  >
                    View profile
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 px-6 py-12 text-center">
            <UsersRound className="mx-auto size-10 text-slate-600" />
            <h3 className="mt-3 font-semibold text-white">
              No registrations yet
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Members who register for this event will appear here.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
