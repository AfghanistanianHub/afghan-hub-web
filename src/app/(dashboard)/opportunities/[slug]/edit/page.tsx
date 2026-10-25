import formStyles from "@/components/forms/listing-form.module.css";
import { CommunitySignature } from "@/components/public/community-signature";
import { notFound, redirect } from "next/navigation";
import { DeadlinePicker } from "@/components/ui/deadline-picker";
import { createClient } from "@/lib/supabase/server";
import {
  LocalizedBackLink,
  LocalizedCancelLink,
  LocalizedCheckbox,
  LocalizedChoiceField,
  LocalizedField,
  LocalizedSelect,
  LocalizedSubmitButton,
  W,
} from "@/components/i18n/workspace";
import { opportunityFormErrorKey } from "@/lib/i18n/workspace-copy";
import { updateOpportunity } from "../../actions";

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

type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditOpportunityPage({
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

  const { data: opportunity } = await supabase
    .from("opportunities")
    .select("*")
    .eq("slug", slug)
    .eq("author_id", user.id)
    .maybeSingle();

  if (!opportunity) {
    notFound();
  }

  const { data: organizations } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("owner_id", user.id)
    .order("name");

  const fieldClassName =
    "mt-2 w-full rounded-[var(--radius-control)] border border-input bg-card px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10";

  return (
    <main className={`${formStyles.page} mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-10`}>
      <LocalizedBackLink
        href={`/opportunities/${opportunity.slug}`}
        k="opportunity.backToOpportunity"
        className="rounded-sm text-sm font-semibold text-primary transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      />

      <section className="relative mt-5 overflow-hidden rounded-[var(--radius)] border border-border/80 bg-card px-6 py-8 md:px-8 md:py-10">
        
        
        <CommunitySignature className={formStyles.signature} /><div className="relative">
          <W k="opportunity.editEyebrow" className="text-sm font-semibold uppercase tracking-[0.16em] text-primary" />
          <h1 className="mt-3 break-words text-3xl font-medium tracking-[-0.035em] text-foreground md:text-4xl"><W k="opportunity.editTitle" /></h1>
          <p className="mt-3 text-muted-foreground"><W k="opportunity.editBody" /></p>
          <p className="mt-4 inline-flex rounded-full border border-primary/15 bg-primary/[0.06] px-3 py-1.5 text-sm font-medium text-primary">
            <W k="opportunity.editNotice" />
          </p>
        </div>
      </section>

      {error ? (
        <div role="alert" aria-live="assertive" className="mt-6 rounded-[var(--radius)] border border-destructive/25 bg-destructive/[0.06] px-4 py-3 text-sm text-destructive">
          <W k={opportunityFormErrorKey(error)} />
        </div>
      ) : null}

      <form action={updateOpportunity} className="surface-panel mt-8 space-y-8 rounded-[var(--radius)] p-6 md:p-8">
        <input type="hidden" name="original_slug" value={opportunity.slug} />

        <LocalizedField labelKey="common.title" name="title" id="title" required defaultValue={opportunity.title} fieldClassName={fieldClassName} labelClassName="block text-sm font-semibold text-foreground" />

        <LocalizedChoiceField labelKey="opportunity.postedBy" name="organization_id" id="organization_id" placeholderKey="common.personalOrganization" defaultValue={opportunity.organization_id ?? ""} fieldClassName={fieldClassName} labelClassName="block text-sm font-semibold text-foreground">
          {organizations?.map((organization) => (
            <option key={organization.id} value={organization.id}>{organization.name}</option>
          ))}
        </LocalizedChoiceField>

        <LocalizedSelect labelKey="opportunity.type" name="type" id="type" required defaultValue={opportunity.type} options={opportunityTypeOptions} fieldClassName={fieldClassName} labelClassName="block text-sm font-semibold text-foreground" />

        <LocalizedField labelKey="common.shortSummary" name="summary" id="summary" rows={3} required defaultValue={opportunity.summary ?? ""} fieldClassName={fieldClassName} labelClassName="block text-sm font-semibold text-foreground" />

        <LocalizedField labelKey="common.fullDescription" name="description" id="description" rows={8} required defaultValue={opportunity.description} fieldClassName={fieldClassName} labelClassName="block text-sm font-semibold text-foreground" />

        <div className="grid gap-6 md:grid-cols-2">
          <LocalizedField labelKey="common.city" name="city" id="city" defaultValue={opportunity.city ?? ""} fieldClassName={fieldClassName} labelClassName="block text-sm font-semibold text-foreground" />
          <LocalizedField labelKey="common.province" name="province_state" id="province_state" defaultValue={opportunity.province_state ?? ""} fieldClassName={fieldClassName} labelClassName="block text-sm font-semibold text-foreground" />
        </div>

        <LocalizedField labelKey="common.country" name="country" id="country" defaultValue={opportunity.country ?? ""} fieldClassName={fieldClassName} labelClassName="block text-sm font-semibold text-foreground" />

        <LocalizedCheckbox
          name="is_remote"
          labelKey="opportunity.remote"
          defaultChecked={opportunity.is_remote}
          wrapperClassName="flex cursor-pointer items-center gap-3 rounded-[var(--radius)] border border-border/80 bg-secondary/40 px-4 py-3 transition hover:border-primary/25 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15"
          inputClassName="size-5 shrink-0 rounded border-border accent-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        />

        <LocalizedField labelKey="opportunity.externalUrl" name="external_url" id="external_url" type="url" defaultValue={opportunity.external_url ?? ""} fieldClassName={fieldClassName} labelClassName="block text-sm font-semibold text-foreground" />

        <LocalizedField labelKey="opportunity.contactEmail" name="contact_email" id="contact_email" type="email" defaultValue={opportunity.contact_email ?? ""} fieldClassName={fieldClassName} labelClassName="block text-sm font-semibold text-foreground" />

        <div>
          <span className="block text-sm font-semibold text-foreground"><W k="common.deadline" /></span>
          <div className="mt-2"><DeadlinePicker defaultValue={opportunity.deadline} /></div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-border pt-6">
          <LocalizedSubmitButton k="opportunity.saveAndSubmit" pendingKey="common.savingChanges" className="rounded-[var(--radius)] bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" />
          <LocalizedCancelLink href={`/opportunities/${opportunity.slug}`} className="rounded-[var(--radius)] border border-border/80 bg-background px-5 py-3 text-sm font-semibold transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" />
        </div>
      </form>
    </main>
  );
}
