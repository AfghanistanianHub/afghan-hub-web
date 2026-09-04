import { buildIcsCalendar } from "@/lib/calendar";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: event, error } = await supabase
    .from("events")
    .select(
      "id, title, slug, summary, starts_at, ends_at, venue_name, address_line, city, province_state, country, is_online, online_url",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !event) {
    return new Response("Event not found", { status: 404 });
  }

  const location = event.is_online
    ? event.online_url
    : [
        event.venue_name,
        event.address_line,
        event.city,
        event.province_state,
        event.country,
      ]
        .filter(Boolean)
        .join(", ");
  const eventUrl = `https://app.apnbc.ca/events/${event.slug}`;
  const calendar = buildIcsCalendar(
    {
      title: event.title,
      startsAt: event.starts_at,
      endsAt: event.ends_at,
      description: event.summary,
      location,
      url: eventUrl,
    },
    `${event.id}@app.apnbc.ca`,
  );

  return new Response(calendar, {
    headers: {
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
