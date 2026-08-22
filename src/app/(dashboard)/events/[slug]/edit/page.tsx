import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EventDateTimePicker } from "@/components/ui/event-date-time-picker";
import { createClient } from "@/lib/supabase/server";
import { updateEvent } from "../../actions";

type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditEventPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("creator_id", user.id)
    .maybeSingle();

  if (!event) {
    notFound();
  }

  const { data: organizations } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("name");

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div>
        <h1 className="text-4xl font-bold">Edit Event</h1>
        <p className="mt-2 text-slate-400">
          Update the event information below.
        </p>
      </div>

      {error ? (
        <div className="mt-6 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-red-300">
          {error}
        </div>
      ) : null}

      <form
        action={updateEvent}
        className="mt-10 space-y-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8"
      >
        <input
          type="hidden"
          name="original_slug"
          value={event.slug}
        />

        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Event title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={event.title}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label
            htmlFor="organization_id"
            className="block text-sm font-medium"
          >
            Hosted by
          </label>
          <select
            id="organization_id"
            name="organization_id"
            defaultValue={event.organization_id ?? ""}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
          >
            <option value="">Personal / No organization</option>

            {organizations?.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="summary" className="block text-sm font-medium">
            Short summary
          </label>
          <textarea
            id="summary"
            name="summary"
            rows={3}
            required
            defaultValue={event.summary ?? ""}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Full description
          </label>
          <textarea
            id="description"
            name="description"
            rows={8}
            required
            defaultValue={event.description ?? ""}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Starts at</label>
            <div className="mt-2">
              <EventDateTimePicker
                name="starts_at"
                label="Select start date & time"
                defaultValue={event.starts_at}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Ends at</label>
            <div className="mt-2">
              <EventDateTimePicker
                name="ends_at"
                label="Select end date & time"
                defaultValue={event.ends_at}
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="venue_name" className="block text-sm font-medium">
            Venue name
          </label>
          <input
            id="venue_name"
            name="venue_name"
            type="text"
            defaultValue={event.venue_name ?? ""}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="address_line" className="block text-sm font-medium">
            Address
          </label>
          <input
            id="address_line"
            name="address_line"
            type="text"
            defaultValue={event.address_line ?? ""}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label htmlFor="city" className="block text-sm font-medium">
              City
            </label>
            <input
              id="city"
              name="city"
              type="text"
              defaultValue={event.city ?? ""}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label
              htmlFor="province_state"
              className="block text-sm font-medium"
            >
              Province / State
            </label>
            <input
              id="province_state"
              name="province_state"
              type="text"
              defaultValue={event.province_state ?? ""}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium">
              Country
            </label>
            <input
              id="country"
              name="country"
              type="text"
              defaultValue={event.country ?? ""}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <label className="flex items-center gap-3">
          <input
            name="is_online"
            type="checkbox"
            defaultChecked={event.is_online}
            className="h-4 w-4 rounded border-slate-700 bg-slate-950"
          />
          <span>Online event</span>
        </label>

        <div>
          <label htmlFor="online_url" className="block text-sm font-medium">
            Online event link
          </label>
          <input
            id="online_url"
            name="online_url"
            type="url"
            defaultValue={event.online_url ?? ""}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label htmlFor="capacity" className="block text-sm font-medium">
            Capacity
          </label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min="1"
            defaultValue={event.capacity ?? ""}
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500"
          >
            Save Changes
          </button>

          <Link
            href={`/events/${event.slug}`}
            className="rounded-lg border border-slate-700 px-5 py-3 font-semibold hover:bg-slate-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
