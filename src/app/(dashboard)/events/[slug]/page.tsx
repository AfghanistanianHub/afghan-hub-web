import { DeleteEventButton } from "@/components/events/delete-event-button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDateTime(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: event, error } = await supabase
    .from("events")
    .select(`
      *,
      organization:organizations (
        name,
        slug
      )
    `)
    .eq("slug", slug)
    .single();

  if (error || !event) {
    notFound();
  }

  const location = [
    event.city,
    event.province_state,
    event.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-emerald-600/20 px-3 py-1 text-sm text-emerald-400">
              {event.is_online ? "Online event" : "In-person event"}
            </span>

            <h1 className="mt-4 text-4xl font-bold">
              {event.title}
            </h1>
          </div>

          {user?.id === event.creator_id ? (
            <div className="flex shrink-0 gap-3">
              <Link
              href={`/events/${event.slug}/edit`}
              className="rounded-lg border border-slate-700 px-4 py-2 font-semibold hover:bg-slate-800"
            >
                Edit
              </Link>

              <DeleteEventButton slug={event.slug} />
            </div>
          ) : null}
        </div>

        {event.organization ? (
          <p className="mt-4 text-sm text-slate-400">
            Hosted by{" "}
            <Link
              href={`/organizations/${event.organization.slug}`}
              className="text-emerald-400 hover:underline"
            >
              {event.organization.name}
            </Link>
          </p>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            Community event
          </p>
        )}

        <p className="mt-6 text-lg text-slate-300">
          {event.summary}
        </p>

        <div className="mt-8 whitespace-pre-wrap leading-8 text-slate-200">
          {event.description}
        </div>

        <div className="mt-10 space-y-4 border-t border-slate-800 pt-6 text-slate-400">
          <p>
            <strong className="text-slate-200">Starts:</strong>{" "}
            {formatDateTime(event.starts_at)}
          </p>

          {event.ends_at ? (
            <p>
              <strong className="text-slate-200">Ends:</strong>{" "}
              {formatDateTime(event.ends_at)}
            </p>
          ) : null}

          {event.is_online ? (
            event.online_url ? (
              <p>
                <strong className="text-slate-200">Online:</strong>{" "}
                <a
                  href={event.online_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  Join event
                </a>
              </p>
            ) : null
          ) : (
            <>
              {event.venue_name ? (
                <p>
                  <strong className="text-slate-200">Venue:</strong>{" "}
                  {event.venue_name}
                </p>
              ) : null}

              {event.address_line ? (
                <p>
                  <strong className="text-slate-200">Address:</strong>{" "}
                  {event.address_line}
                </p>
              ) : null}
            </>
          )}

          {location ? (
            <p>
              <strong className="text-slate-200">Location:</strong>{" "}
              {location}
            </p>
          ) : null}

          {event.capacity ? (
            <p>
              <strong className="text-slate-200">Capacity:</strong>{" "}
              {event.capacity}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
