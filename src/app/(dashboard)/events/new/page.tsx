import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventDateTimePicker } from "@/components/ui/event-date-time-picker";
import { createEvent } from "../actions";

export default async function NewEventPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: organizations } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("name");

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div>
        <h1 className="text-4xl font-bold">Create an Event</h1>
        <p className="mt-2 text-slate-400">
          Share an in-person or online event with the Afghan Hub community.
        </p>
      </div>

      <form
        action={createEvent}
        className="mt-10 space-y-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 md:p-8"
      >
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Event title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
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
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <label className="flex items-center gap-3">
          <input
            name="is_online"
            type="checkbox"
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
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold hover:bg-emerald-500"
        >
          Publish Event
        </button>
      </form>
    </main>
  );
}
