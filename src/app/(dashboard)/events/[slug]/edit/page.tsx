import formStyles from "@/components/forms/listing-form.module.css";
import { CommunitySignature } from "@/components/public/community-signature";
import { notFound, redirect } from "next/navigation";
import { EventDateTimePicker } from "@/components/ui/event-date-time-picker";
import {
  LocalizedCancelLink,
  LocalizedCheckbox,
  LocalizedChoiceField,
  LocalizedField,
  LocalizedSubmitButton,
  W,
} from "@/components/i18n/workspace";
import { createClient } from "@/lib/supabase/server";
import { eventFormErrorKey } from "@/lib/i18n/workspace-copy";
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

  const fieldClass = "mt-2 w-full rounded-[var(--radius-control)] border border-input bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/15";

  return (
    <main className={`${formStyles.page} mx-auto max-w-3xl px-6 py-10`}>
      <section className="relative overflow-hidden rounded-[var(--radius)] border border-border/80 bg-card px-6 py-8 md:px-8 md:py-10">
        <CommunitySignature className={formStyles.signature} />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            <W k="event.settingsEyebrow" />
          </p>
          <h1 className="mt-3 text-3xl font-medium tracking-[-0.035em] md:text-4xl">
            <W k="event.editTitle" />
          </h1>
          <p className="mt-3 text-muted-foreground">
            <W k="event.editBody" />
          </p>
          <p className="mt-4 inline-flex rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1.5 text-sm font-medium text-primary">
            <W k="event.editNotice" />
          </p>
        </div>
      </section>

      {error ? (
        <div role="alert" aria-live="assertive" className="mt-6 rounded-[var(--radius)] border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive"><W k={eventFormErrorKey(error)} /></div>
      ) : null}

      <form action={updateEvent} className="surface-panel mt-8 space-y-8 rounded-[var(--radius)] p-6 md:p-8">
        <input type="hidden" name="original_slug" value={event.slug} />

        <LocalizedField labelKey="event.title" name="title" required defaultValue={event.title} fieldClassName={fieldClass} labelClassName="block text-sm font-medium" />
        <LocalizedChoiceField labelKey="event.hostedBy" name="organization_id" defaultValue={event.organization_id ?? ""} placeholderKey="common.personalOrganization" fieldClassName={fieldClass} labelClassName="block text-sm font-medium">
          {organizations?.map((organization) => (
            <option key={organization.id} value={organization.id}>{organization.name}</option>
          ))}
        </LocalizedChoiceField>
        <LocalizedField labelKey="common.shortSummary" name="summary" rows={3} required defaultValue={event.summary ?? ""} fieldClassName={fieldClass} labelClassName="block text-sm font-medium" />
        <LocalizedField labelKey="common.fullDescription" name="description" rows={8} required defaultValue={event.description ?? ""} fieldClassName={fieldClass} labelClassName="block text-sm font-medium" />

        <section className="border-t border-border pt-6">
          <h2 className="text-lg font-semibold">
            <W k="event.dateTime" />
          </h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium"><W k="event.startsAt" /></label>
              <div className="mt-2"><EventDateTimePicker name="starts_at" labelKey="event.selectStart" defaultValue={event.starts_at} required /></div>
            </div>
            <div>
              <label className="block text-sm font-medium"><W k="event.endsAt" /></label>
              <div className="mt-2"><EventDateTimePicker name="ends_at" labelKey="event.selectEnd" defaultValue={event.ends_at} /></div>
            </div>
          </div>
        </section>

        <section className="border-t border-border pt-6">
          <h2 className="text-lg font-semibold">
            <W k="event.location" />
          </h2>
          <div className="mt-4 space-y-5">
            <LocalizedField labelKey="event.venueName" name="venue_name" defaultValue={event.venue_name ?? ""} fieldClassName={fieldClass} labelClassName="block text-sm font-medium" />
            <LocalizedField labelKey="common.address" name="address_line" defaultValue={event.address_line ?? ""} fieldClassName={fieldClass} labelClassName="block text-sm font-medium" />
            <div className="grid gap-6 md:grid-cols-3">
              <LocalizedField labelKey="common.city" name="city" defaultValue={event.city ?? ""} fieldClassName={fieldClass} labelClassName="block text-sm font-medium" />
              <LocalizedField labelKey="common.province" name="province_state" defaultValue={event.province_state ?? ""} fieldClassName={fieldClass} labelClassName="block text-sm font-medium" />
              <LocalizedField labelKey="common.country" name="country" defaultValue={event.country ?? ""} fieldClassName={fieldClass} labelClassName="block text-sm font-medium" />
            </div>
          </div>
        </section>

        <section className="border-t border-border pt-6">
          <LocalizedCheckbox
            name="is_online"
            labelKey="event.online"
            defaultChecked={event.is_online}
            inputClassName="size-5 shrink-0 rounded border-input accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            labelSpanClassName="text-sm font-medium"
            wrapperClassName="flex cursor-pointer items-center gap-3 rounded-[var(--radius)] border border-border/80 bg-secondary/40 px-4 py-3 transition hover:border-primary/25 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15"
          />
          <div className="mt-5">
            <LocalizedField labelKey="event.onlineLink" name="online_url" type="url" defaultValue={event.online_url ?? ""} fieldClassName={fieldClass} labelClassName="block text-sm font-medium" />
          </div>
          <div className="mt-5">
            <LocalizedField labelKey="event.capacity" name="capacity" type="number" min={1} defaultValue={event.capacity ?? ""} fieldClassName={fieldClass} labelClassName="block text-sm font-medium" />
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <LocalizedCancelLink href={`/events/${event.slug}`} className="rounded-[var(--radius)] border border-border/80 bg-background px-5 py-3 text-center font-semibold transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" />
          <LocalizedSubmitButton
            k="event.saveAndSubmit"
            pendingKey="common.savingChanges"
            className="rounded-[var(--radius)] bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          />
        </div>
      </form>
    </main>
  );
}
