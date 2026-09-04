export type CalendarEvent = {
  title: string;
  startsAt: string;
  endsAt?: string | null;
  description?: string | null;
  location?: string | null;
  url?: string | null;
};

function formatUtcDate(value: string) {
  return new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function getEndDate(event: CalendarEvent) {
  if (event.endsAt) {
    return event.endsAt;
  }

  return new Date(new Date(event.startsAt).getTime() + 60 * 60 * 1000).toISOString();
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function buildGoogleCalendarUrl(event: CalendarEvent) {
  const details = [event.description, event.url].filter(Boolean).join("\n\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatUtcDate(event.startsAt)}/${formatUtcDate(getEndDate(event))}`,
  });

  if (details) {
    params.set("details", details);
  }

  if (event.location) {
    params.set("location", event.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsCalendar(event: CalendarEvent, uid: string) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Afghan Hub//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(uid)}`,
    `DTSTAMP:${formatUtcDate(new Date().toISOString())}`,
    `DTSTART:${formatUtcDate(event.startsAt)}`,
    `DTEND:${formatUtcDate(getEndDate(event))}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
  ];

  const description = [event.description, event.url].filter(Boolean).join("\n\n");

  if (description) {
    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  }

  if (event.url) {
    lines.push(`URL:${event.url}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR", "");

  return lines.join("\r\n");
}
