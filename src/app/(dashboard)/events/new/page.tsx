import formStyles from "@/components/forms/listing-form.module.css";
import { CommunitySignature } from "@/components/public/community-signature";
import {
  LocalizedCheckbox,
  LocalizedChoiceField,
  LocalizedField,
  LocalizedSubmitButton,
  W,
} from "@/components/i18n/workspace";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { eventFormErrorKey } from "@/lib/i18n/workspace-copy";
import { EventDateTimePicker } from "@/components/ui/event-date-time-picker";
import { createEvent } from "../actions";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function NewEventPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: organizations } = await supabase.from("organizations").select("id, name").eq("owner_id", user.id).order("name");
  const field = "mt-2 w-full rounded-[var(--radius-control)] border border-input bg-card px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10";

  return (
    <main className={`${formStyles.page} mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10`}>
      <section className="relative overflow-hidden rounded-[var(--radius)] border border-border/80 bg-card px-6 py-8 md:px-8 md:py-10">
        <CommunitySignature className={formStyles.signature} />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            <W k="event.newEyebrow" />
          </p>
          <h1 className="mt-3 text-3xl font-medium tracking-[-0.035em] text-foreground md:text-4xl">
            <W k="event.newTitle" />
          </h1>
          <p className="mt-3 text-muted-foreground">
            <W k="event.newBody" />
          </p>
          <p className="mt-4 inline-flex rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1.5 text-sm font-medium text-primary">
            <W k="common.reviewNotice" />
          </p>
        </div>
      </section>

      {error ? (
        <div role="alert" aria-live="assertive" className="mt-6 rounded-[var(--radius)] border border-destructive/25 bg-destructive/[0.06] p-4 text-sm text-destructive">
          <W k={eventFormErrorKey(error)} />
        </div>
      ) : null}

      <form action={createEvent} className="surface-panel mt-8 space-y-8 rounded-[var(--radius)] p-6 md:p-8">
        <LocalizedField labelKey="event.title" name="title" required fieldClassName={field} labelClassName="block text-sm font-medium text-foreground" />
        <LocalizedChoiceField labelKey="event.hostedBy" name="organization_id" placeholderKey="common.personalOrganization" fieldClassName={field} labelClassName="block text-sm font-medium text-foreground">
          {organizations?.map((organization) => (
            <option key={organization.id} value={organization.id}>{organization.name}</option>
          ))}
        </LocalizedChoiceField>
        <LocalizedField labelKey="common.shortSummary" name="summary" rows={3} required fieldClassName={field} labelClassName="block text-sm font-medium text-foreground" />
        <LocalizedField labelKey="common.fullDescription" name="description" rows={8} required fieldClassName={field} labelClassName="block text-sm font-medium text-foreground" />
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground"><W k="event.startsAt" /></label>
            <div className="mt-2"><EventDateTimePicker name="starts_at" labelKey="event.selectStart" required /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground"><W k="event.endsAt" /></label>
            <div className="mt-2"><EventDateTimePicker name="ends_at" labelKey="event.selectEnd" /></div>
          </div>
        </div>
        <LocalizedField labelKey="event.venueName" name="venue_name" fieldClassName={field} labelClassName="block text-sm font-medium text-foreground" />
        <LocalizedField labelKey="common.address" name="address_line" fieldClassName={field} labelClassName="block text-sm font-medium text-foreground" />
        <div className="grid gap-6 md:grid-cols-3">
          <LocalizedField labelKey="common.city" name="city" fieldClassName={field} labelClassName="block text-sm font-medium text-foreground" />
          <LocalizedField labelKey="common.province" name="province_state" fieldClassName={field} labelClassName="block text-sm font-medium text-foreground" />
          <LocalizedField labelKey="common.country" name="country" fieldClassName={field} labelClassName="block text-sm font-medium text-foreground" />
        </div>
        <LocalizedCheckbox
          name="is_online"
          labelKey="event.online"
          inputClassName="size-5 shrink-0 rounded border-border accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          labelSpanClassName="text-sm font-medium text-foreground"
          wrapperClassName="flex items-center gap-3 rounded-[var(--radius)] border border-border/80 bg-secondary/40 p-4 text-sm font-medium text-foreground transition hover:border-primary/20"
        />
        <LocalizedField labelKey="event.onlineLink" name="online_url" type="url" fieldClassName={field} labelClassName="block text-sm font-medium text-foreground" />
        <LocalizedField labelKey="event.capacity" name="capacity" type="number" min={1} fieldClassName={field} labelClassName="block text-sm font-medium text-foreground" />
        <div className="flex justify-end border-t border-border pt-6">
          <LocalizedSubmitButton
            k="common.submitForReview"
            pendingKey="common.submittingForReview"
            className="rounded-[var(--radius)] bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          />
        </div>
      </form>
    </main>
  );
}
