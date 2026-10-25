import { BusinessCategorySelect } from "@/components/businesses/business-category-select";
import formStyles from "@/components/forms/listing-form.module.css";
import { CommunitySignature } from "@/components/public/community-signature";
import {
  LocalizedBackLink,
  LocalizedCancelLink,
  LocalizedCheckbox,
  LocalizedField,
  LocalizedSubmitButton,
  W,
} from "@/components/i18n/workspace";

import { businessFormErrorKey } from "@/lib/i18n/workspace-copy";
import { createBusiness } from "../actions";

type NewBusinessPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewBusinessPage({
  searchParams,
}: NewBusinessPageProps) {
  const { error } = await searchParams;
  const fieldClassName =
    "mt-2 w-full rounded-[var(--radius-control)] border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <main className={`${formStyles.page} px-4 py-8 md:px-8`}>
      <div className="mx-auto max-w-4xl">
        <LocalizedBackLink
          href="/businesses"
          k="common.backToBusinesses"
          className="rounded-sm text-sm font-medium text-primary transition hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        />

        <section className="relative mt-6 overflow-hidden rounded-[var(--radius)] border border-border/80 bg-card px-6 py-8 md:px-8 md:py-10">
          <CommunitySignature className={formStyles.signature} /><div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            <W k="business.newEyebrow" />
          </p>

          <h1 className="mt-3 break-words text-3xl font-medium tracking-[-0.035em] text-foreground md:text-4xl">
            <W k="business.newTitle" />
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            <W k="business.newBody" />
          </p>
          </div>
        </section>

        {error ? (
          <div role="alert" aria-live="assertive" className="mt-8 rounded-[var(--radius)] border border-destructive/25 bg-destructive/[0.06] p-4 text-sm text-destructive">
            <W k={businessFormErrorKey(error)} />
          </div>
        ) : null}

        <form
          action={createBusiness}
          className="surface-panel mt-8 space-y-8 rounded-[var(--radius)] p-6 md:p-8"
        >
          <section>
            <h2 className="text-xl font-semibold text-foreground">
              <W k="business.infoHeading" />
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <LocalizedField
                labelKey="business.nameLabel"
                name="name"
                required
                minLength={2}
                maxLength={120}
                placeholderKey="business.namePlaceholder"
                fieldClassName={fieldClassName}
                wrapperClassName="md:col-span-2"
              />

              <BusinessCategorySelect required className={fieldClassName} labelClassName="grid gap-2 text-sm font-medium" />

              <LocalizedField
                labelKey="common.website"
                name="website_url"
                type="url"
                placeholder="https://example.com"
                fieldClassName={fieldClassName}
              />

              <LocalizedField
                labelKey="common.shortDescription"
                name="short_description"
                maxLength={200}
                placeholderKey="business.shortPlaceholder"
                fieldClassName={fieldClassName}
                wrapperClassName="md:col-span-2"
              />

              <LocalizedField
                labelKey="common.fullDescription"
                name="description"
                rows={6}
                placeholderKey="business.fullPlaceholder"
                fieldClassName={fieldClassName}
                wrapperClassName="md:col-span-2"
              />

              <LocalizedField
                labelKey="business.services"
                name="services"
                placeholderKey="business.servicesPlaceholder"
                hintKey="business.servicesHint"
                fieldClassName={fieldClassName}
                wrapperClassName="md:col-span-2"
              />

              <LocalizedCheckbox
                name="is_hiring"
                labelKey="business.hiring"
                inputClassName="size-5 shrink-0 rounded border-input accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                labelSpanClassName="text-sm font-medium text-foreground"
                wrapperClassName="flex cursor-pointer items-center gap-3 rounded-[var(--radius)] border border-border/80 bg-secondary/40 p-4 transition hover:border-primary/25 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15 md:col-span-2"
              />
            </div>
          </section>

          <section className="border-t border-border pt-8">
            <h2 className="text-xl font-semibold text-foreground">
              <W k="business.contactHeading" />
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <LocalizedField
                labelKey="common.email"
                name="email"
                type="email"
                placeholder="hello@example.com"
                fieldClassName={fieldClassName}
              />
              <LocalizedField
                labelKey="common.phone"
                name="phone"
                type="tel"
                placeholder="+1 604 000 0000"
                fieldClassName={fieldClassName}
              />
            </div>
          </section>

          <section className="border-t border-border pt-8">
            <h2 className="text-xl font-semibold text-foreground">
              <W k="business.locationHeading" />
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <LocalizedField
                labelKey="common.address"
                name="address_line"
                placeholderKey="business.addressPlaceholder"
                fieldClassName={fieldClassName}
                wrapperClassName="md:col-span-3"
              />
              <LocalizedField
                labelKey="common.city"
                name="city"
                placeholderKey="common.cityPlaceholder"
                fieldClassName={fieldClassName}
              />
              <LocalizedField
                labelKey="common.province"
                name="province_state"
                placeholderKey="common.provincePlaceholder"
                fieldClassName={fieldClassName}
              />
              <LocalizedField
                labelKey="common.country"
                name="country"
                placeholderKey="common.countryPlaceholder"
                fieldClassName={fieldClassName}
              />
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
            <LocalizedCancelLink href="/businesses" className="rounded-[var(--radius)] border border-border/80 bg-background px-5 py-3 text-center font-semibold text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" />
            <LocalizedSubmitButton
              k="business.create"
              pendingKey="business.creating"
              className="rounded-[var(--radius)] bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            />
          </div>
        </form>
      </div>
    </main>
  );
}
