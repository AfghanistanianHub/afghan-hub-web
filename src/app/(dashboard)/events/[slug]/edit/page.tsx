import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EventDateTimePicker } from "@/components/ui/event-date-time-picker";
import { createClient } from "@/lib/supabase/server";
import { updateEvent } from "../../actions";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function EditEventPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("creator_id", user.id)
    .maybeSingle();

  if (!event) notFound();

  const { data: organizations } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("name");

  const fieldClass = "mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/15";

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card px-6 py-8 shadow-[0_18px_55px_rgb(15_23_42/0.045)] md:px-8 md:py-10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-primary/[0.07] blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 size-64 rounded-full bg-accent/45 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Event settings</p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.035em] md:text-5xl">Edit Event</h1>
          <p className="mt-3 text-muted-foreground">Update the event details while keeping the experience clear for attendees.</p>
          <p className="mt-4 inline-flex rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1.5 text-sm font-medium text-primary">Saving changes submits this event for moderator review.</p>
        </div>
      </section>

      {error ? (
        <div className="mt-6 rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive">{error}</div>
      ) : null}

      <form action={updateEvent} className="surface-panel mt-8 space-y-8 rounded-[2rem] p-6 md:p-8">
        <input type="hidden" name="original_slug" value={event.slug} />

        <div>
          <label htmlFor="title" className="block text-sm font-medium">Event title</label>
          <input id="title" name="title" type="text" required defaultValue={event.title} className={fieldClass} />
        </div>

        <div>
          <label htmlFor="organization_id" className="block text-sm font-medium">Hosted by</label>
          <select id="organization_id" name="organization_id" defaultValue={event.organization_id ?? ""} className={fieldClass}>
            <option value="">Personal / No organization</option>
            {organizations?.map((organization) => (
              <option key={organization.id} value={organization.id}>{organization.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="summary" className="block text-sm font-medium">Short summary</label>
          <textarea id="summary" name="summary" rows={3} required defaultValue={event.summary ?? ""} className={fieldClass} />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium">Full description</label>
          <textarea id="description" name="description" rows={8} required defaultValue={event.description ?? ""} className={fieldClass} />
        </div>

        <section className="border-t border-border pt-6">
          <h2 className="text-lg font-semibold">Date and time</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Starts at</label>
              <div className="mt-2"><EventDateTimePicker name="starts_at" label="Select start date & time" defaultValue={event.starts_at} required /></div>
            </div>
            <div>
              <label className="block text-sm font-medium">Ends at</label>
              <div className="mt-2"><EventDateTimePicker name="ends_at" label="Select end date & time" defaultValue={event.ends_at} /></div>
            </div>
          </div>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-lg font-semibold">Location</h2>
          <div className="mt-4 space-y-5">
            <div>
              <label htmlFor="venue_name" className="block text-sm font-medium">Venue name</label>
              <input id="venue_name" name="venue_name" type="text" defaultValue={event.venue_name ?? ""} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="address_line" className="block text-sm font-medium">Address</label>
              <input id="address_line" name="address_line" type="text" defaultValue={event.address_line ?? ""} className={fieldClass} />
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label htmlFor="city" className="block text-sm font-medium">City</label>
                <input id="city" name="city" type="text" defaultValue={event.city ?? ""} className={fieldClass} />
              </div>
              <div>
                <label htmlFor="province_state" className="block text-sm font-medium">Province / State</label>
                <input id="province_state" name="province_state" type="text" defaultValue={event.province_state ?? ""} className={fieldClass} />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium">Country</label>
                <input id="country" name="country" type="text" defaultValue={event.country ?? ""} className={fieldClass} />
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border pt-6">
          <label className="flex items-center gap-3 rounded-2xl border border-border/80 bg-secondary/40 px-4 py-3 transition hover:border-primary/20">
            <input name="is_online" type="checkbox" defaultChecked={event.is_online} className="size-4 rounded border-input accent-primary" />
            <span className="text-sm font-medium">Online event</span>
          </label>
          <div className="mt-5">
            <label htmlFor="online_url" className="block text-sm font-medium">Online event link</label>
            <input id="online_url" name="online_url" type="url" defaultValue={event.online_url ?? ""} className={fieldClass} />
          </div>
          <div className="mt-5">
            <label htmlFor="capacity" className="block text-sm font-medium">Capacity</label>
            <input id="capacity" name="capacity" type="number" min="1" defaultValue={event.capacity ?? ""} className={fieldClass} />
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Link href={`/events/${event.slug}`} className="rounded-2xl border border-border/80 bg-background px-5 py-3 text-center font-semibold transition hover:-translate-y-0.5 hover:bg-muted">Cancel</Link>
          <button type="submit" className="rounded-2xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-[0_10px_28px_color-mix(in_oklab,var(--primary)_16%,transparent)] transition hover:-translate-y-0.5 hover:bg-primary/90">Save and Submit for Review</button>
        </div>
      </form>
    </main>
  );
}
