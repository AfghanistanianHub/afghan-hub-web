import { MemberPageHeader } from "@/components/catalog/member-page-header";
import { catalogPageContainerClass, catalogClearClass } from "@/components/catalog/catalog-filter-styles";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  UserRound,
  UsersRound,
} from "lucide-react";

import { B, BDate } from "@/components/i18n/browse";
import { ExternalImage } from "@/components/ui/external-image";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

function getMemberName(profile: {
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
}) {
  return (
    profile.display_name?.trim() ||
    [profile.first_name, profile.last_name].filter(Boolean).join(" ")
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

  if (userError || !user) redirect("/login");

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(
      "id,title,slug,starts_at,venue_name,city,country,is_online,capacity,creator_id,status",
    )
    .eq("slug", slug)
    .eq("creator_id", user.id)
    .maybeSingle();

  if (eventError) {
    console.error("Could not load event for attendee management; provider details withheld.");
  }

  if (!event) notFound();

  const { data: registrations, error: registrationError } = await supabase
    .from("event_rsvps")
    .select("profile_id,created_at")
    .eq("event_id", event.id)
    .order("created_at", { ascending: true });

  if (registrationError) {
    console.error("Could not load event registrations; provider details withheld.");
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
    console.error("Could not load attendee profiles; provider details withheld.");
  }

  const profileById = new Map(
    (publicProfiles ?? []).map((profile) => [profile.id, profile]),
  );
  const attendeeCount = registrations?.length ?? 0;
  const remaining =
    event.capacity === null
      ? null
      : Math.max(event.capacity - attendeeCount, 0);
  const place = [event.venue_name, event.city, event.country].filter(Boolean).join(", ");

  return (
    <main className={catalogPageContainerClass}>
      <Link
        href={`/events/${event.slug}`}
        className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium text-muted-foreground transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
        <B k="attendees.back" />
      </Link>

      <MemberPageHeader title={<B k="attendees.title" />} description={event.title} icon={UsersRound}>
        <Link href={`/events/${event.slug}/edit`} className={catalogClearClass}>
          <B k="attendees.edit" />
        </Link>
      </MemberPageHeader>
      <section className="border-b border-border pb-7">
        <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5">
            <CalendarDays aria-hidden="true" className="size-4 text-primary" />
            <BDate value={event.starts_at} mode="datetime" />
          </span>
          {event.is_online ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5">
              <MapPin aria-hidden="true" className="size-4 text-primary" />
              <B k="common.online" />
            </span>
          ) : place ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1.5">
              <MapPin aria-hidden="true" className="size-4 text-primary" />
              {place}
            </span>
          ) : null}
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          <div className="border-s-2 border-border py-2 ps-4">
            <p className="text-sm text-muted-foreground">
              <B k="attendees.registered" />
            </p>
            <p className="mt-2 text-3xl font-medium text-foreground">{attendeeCount}</p>
          </div>
          <div className="border-s-2 border-border py-2 ps-4">
            <p className="text-sm text-muted-foreground">
              <B k="attendees.capacity" />
            </p>
            <p className="mt-2 text-3xl font-medium text-foreground">
              {event.capacity ?? <B k="attendees.unlimited" />}
            </p>
          </div>
          <div className="border-s-2 border-border py-2 ps-4">
            <p className="text-sm text-muted-foreground">
              <B k="attendees.remaining" />
            </p>
            <p className="mt-2 text-3xl font-medium text-foreground">
              {remaining ?? <B k="attendees.unlimited" />}
            </p>
          </div>
        </div>
      </section>

      <section className="surface-panel mt-8 rounded-[var(--radius)] p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              <B k="attendees.registeredHeading" />
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              <B k="attendees.privacy" />
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
            <UsersRound aria-hidden="true" className="size-4" />
            {attendeeCount}
          </span>
        </div>

        {registrations?.length ? (
          <div className="mt-6 divide-y divide-border">
            {registrations.map((registration) => {
              const profile = profileById.get(registration.profile_id);

              if (!profile) {
                return (
                  <div
                    key={registration.profile_id}
                    className="flex items-center gap-4 py-5 first:pt-0 last:pb-0"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-muted text-muted-foreground">
                      <UserRound aria-hidden="true" className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        <B k="attendees.privateMember" />
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        <B k="attendees.registeredAt" values={{ date: registration.created_at }} />
                      </p>
                    </div>
                  </div>
                );
              }

              const memberName = getMemberName(profile);
              const memberLocation = [profile.city, profile.country]
                .filter(Boolean)
                .join(", ");
              const displayName = memberName || profile.id.slice(0, 8);

              return (
                <div
                  key={registration.profile_id}
                  className="flex flex-wrap items-center justify-between gap-4 py-5 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    {profile.avatar_url ? (
                      <ExternalImage
                        src={profile.avatar_url}
                        alt={displayName}
                        width={48}
                        height={48}
                        className="size-12 rounded-[var(--radius-control)] border border-border/70 object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-secondary font-bold text-primary">
                        {getInitials(displayName) || <UserRound aria-hidden="true" className="size-5" />}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="break-words font-semibold text-foreground">{displayName}</p>
                      {profile.headline ? (
                        <p className="mt-1 line-clamp-2 break-words text-sm leading-5 text-muted-foreground">
                          {profile.headline}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {memberLocation ? `${memberLocation} · ` : null}
                        <B
                          k="attendees.registeredAt"
                          values={{ date: registration.created_at }}
                        />
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/members/${profile.id}`}
                    className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] border border-border/80 bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    <B k="attendees.viewProfile" />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-[var(--radius-control)] border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
            <UsersRound aria-hidden="true" className="mx-auto size-10 text-muted-foreground" />
            <h3 className="mt-3 font-semibold text-foreground">
              <B k="attendees.noRegistrations" />
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              <B k="attendees.noRegistrationsBody" />
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
