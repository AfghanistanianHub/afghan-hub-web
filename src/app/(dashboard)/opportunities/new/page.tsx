import formStyles from "@/components/forms/listing-form.module.css";
import { CommunitySignature } from "@/components/public/community-signature";
import { redirect } from "next/navigation";
import { DeadlinePicker } from "@/components/ui/deadline-picker";
import { createClient } from "@/lib/supabase/server";
import {
  LocalizedCheckbox,
  LocalizedChoiceField,
  LocalizedField,
  LocalizedSelect,
  LocalizedSubmitButton,
  W,
} from "@/components/i18n/workspace";
import { opportunityFormErrorKey } from "@/lib/i18n/workspace-copy";
import { createOpportunity } from "../actions";

const opportunityTypeOptions = [
  { value: "job", key: "opportunity.typeJob" },
  { value: "volunteer", key: "opportunity.typeVolunteer" },
  { value: "scholarship", key: "opportunity.typeScholarship" },
  { value: "mentorship", key: "opportunity.typeMentorship" },
  { value: "investment", key: "opportunity.typeInvestment" },
  { value: "housing", key: "opportunity.typeHousing" },
  { value: "event", key: "opportunity.typeEvent" },
  { value: "education", key: "opportunity.typeEducation" },
] as const;

type NewOpportunityPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewOpportunityPage({
  searchParams,
}: NewOpportunityPageProps) {
  const { error } = await searchParams;
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

  const fieldClassName =
    "mt-2 w-full rounded-[var(--radius-control)] border border-input bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <main className={`${formStyles.page} mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10`}>
      <section className="relative overflow-hidden rounded-[var(--radius)] border border-border/80 bg-card px-6 py-8 md:px-8 md:py-10">
        
        
        <CommunitySignature className={formStyles.signature} /><div className="relative">
        <W k="opportunity.newEyebrow" className="text-sm font-semibold uppercase tracking-[0.18em] text-primary" />
        <h1 className="mt-3 text-3xl font-medium tracking-[-0.035em] text-foreground md:text-4xl"><W k="opportunity.newTitle" /></h1>
        <p className="mt-3 text-muted-foreground">
          <W k="opportunity.newBody" />
        </p>
        <p className="mt-4 inline-flex rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1.5 text-sm font-medium text-primary">
          <W k="common.reviewNotice" />
        </p>
        </div>
      </section>

      {error ? (
        <div role="alert" aria-live="assertive" className="mt-6 rounded-[var(--radius)] border border-destructive/25 bg-destructive/[0.06] px-4 py-3 text-sm text-destructive">
          <W k={opportunityFormErrorKey(error)} />
        </div>
      ) : null}

      <form action={createOpportunity} className="surface-panel mt-8 space-y-8 rounded-[var(--radius)] p-6 md:p-8">
        <LocalizedField labelKey="common.title" name="title" id="title" required fieldClassName={fieldClassName} labelClassName="block text-sm font-medium text-foreground" />

        <LocalizedChoiceField labelKey="opportunity.postedBy" name="organization_id" id="organization_id" placeholderKey="common.personalOrganization" fieldClassName={fieldClassName} labelClassName="block text-sm font-medium text-foreground">
          {organizations?.map((organization) => (
            <option key={organization.id} value={organization.id}>{organization.name}</option>
          ))}
        </LocalizedChoiceField>

        <LocalizedSelect labelKey="opportunity.type" name="type" id="type" required placeholderKey="common.selectType" options={opportunityTypeOptions} fieldClassName={fieldClassName} labelClassName="block text-sm font-medium text-foreground" />

        <LocalizedField labelKey="common.shortSummary" name="summary" id="summary" rows={3} required fieldClassName={fieldClassName} labelClassName="block text-sm font-medium text-foreground" />

        <LocalizedField labelKey="common.fullDescription" name="description" id="description" rows={8} required fieldClassName={fieldClassName} labelClassName="block text-sm font-medium text-foreground" />

        <div className="grid gap-6 md:grid-cols-2">
          <LocalizedField labelKey="common.city" name="city" id="city" fieldClassName={fieldClassName} labelClassName="block text-sm font-medium text-foreground" />
          <LocalizedField labelKey="common.country" name="country" id="country" fieldClassName={fieldClassName} labelClassName="block text-sm font-medium text-foreground" />
        </div>

        <LocalizedCheckbox
          name="is_remote"
          labelKey="opportunity.remote"
          wrapperClassName="flex cursor-pointer items-center gap-3 rounded-[var(--radius)] border border-border/80 bg-secondary/40 p-4 transition hover:border-primary/25 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15"
          inputClassName="size-5 shrink-0 rounded border-input accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />

        <LocalizedField labelKey="opportunity.externalUrl" name="external_url" id="external_url" type="url" fieldClassName={fieldClassName} labelClassName="block text-sm font-medium text-foreground" />

        <LocalizedField labelKey="opportunity.contactEmail" name="contact_email" id="contact_email" type="email" fieldClassName={fieldClassName} labelClassName="block text-sm font-medium text-foreground" />

        <div>
          <span className="block text-sm font-medium text-foreground"><W k="common.deadline" /></span>
          <div className="mt-2"><DeadlinePicker /></div>
        </div>

        <div className="flex justify-end border-t border-border pt-6">
          <LocalizedSubmitButton k="common.submitForReview" pendingKey="common.submittingForReview" className="rounded-[var(--radius)] bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" />
        </div>
      </form>
    </main>
  );
}
