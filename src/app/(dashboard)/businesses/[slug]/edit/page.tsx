import formStyles from "@/components/forms/listing-form.module.css";
import { CommunitySignature } from "@/components/public/community-signature";
import { notFound, redirect } from "next/navigation";

import { BusinessMediaUpload } from "@/components/businesses/business-media-upload";
import {
  LocalizedBackLink,
  LocalizedCancelLink,
  LocalizedCheckbox,
  LocalizedField,
  LocalizedSubmitButton,
  W,
} from "@/components/i18n/workspace";
import { createClient } from "@/lib/supabase/server";
import { updateBusiness } from "../../actions";

type EditBusinessPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditBusinessPage({
  params,
  searchParams,
}: EditBusinessPageProps) {
  const { slug } = await params;
  const { error: formError } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: business, error } = await supabase
    .from("businesses")
    .select(
      `
        id,
        name,
        slug,
        category,
        short_description,
        description,
        services,
        website_url,
        email,
        phone,
        address_line,
        city,
        province_state,
        country,
        logo_url,
        cover_url,
        is_hiring,
        owner_id
      `,
    )
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error || !business) {
    notFound();
  }

  const fieldClassName =
    "mt-2 w-full rounded-[var(--radius-control)] border border-input bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/15";

  return (
    <main className={`${formStyles.page} px-4 py-8 md:px-8`}>
      <div className="mx-auto max-w-4xl">
        <LocalizedBackLink
          href={`/businesses/${business.slug}`}
          k="common.backToBusiness"
          className="rounded-sm text-sm font-medium text-primary transition hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        />

        <section className="relative mt-6 overflow-hidden rounded-[var(--radius)] border border-border/80 bg-card px-6 py-8 md:px-8 md:py-10">
          <CommunitySignature className={formStyles.signature} /><div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              <W k="business.settingsEyebrow" />
            </p>
            <h1 className="mt-3 text-3xl font-medium tracking-[-0.035em] md:text-4xl">
              <W k="business.editTitle" values={{ name: business.name }} />
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              <W k="business.settingsBody" />
            </p>
          </div>
        </section>

        {formError ? (
          <div role="alert" aria-live="assertive" className="mt-8 rounded-[var(--radius)] border border-destructive/25 bg-destructive/[0.08] p-4 text-sm text-destructive">
            {formError}
          </div>
        ) : null}

        <div className="mt-8">
          <BusinessMediaUpload
            businessId={business.id}
            businessName={business.name}
            userId={user.id}
            currentLogoUrl={business.logo_url}
            currentCoverUrl={business.cover_url}
          />
        </div>

        <form
          action={updateBusiness}
          className="surface-panel mt-8 space-y-8 rounded-[var(--radius)] p-6 md:p-8"
        >
          <input type="hidden" name="slug" value={business.slug} />

          <section>
            <h2 className="text-xl font-semibold">
              <W k="business.infoHeading" />
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <LocalizedField
                labelKey="business.nameLabel"
                name="name"
                required
                minLength={2}
                maxLength={120}
                defaultValue={business.name}
                fieldClassName={fieldClassName}
                labelClassName="text-sm font-medium"
                wrapperClassName="md:col-span-2"
              />
              <LocalizedField
                labelKey="business.categoryLabel"
                name="category"
                required
                maxLength={120}
                defaultValue={business.category}
                fieldClassName={fieldClassName}
                labelClassName="text-sm font-medium"
              />
              <LocalizedField
                labelKey="common.website"
                name="website_url"
                type="url"
                defaultValue={business.website_url ?? ""}
                fieldClassName={fieldClassName}
                labelClassName="text-sm font-medium"
              />
              <LocalizedField
                labelKey="common.shortDescription"
                name="short_description"
                maxLength={200}
                defaultValue={business.short_description ?? ""}
                fieldClassName={fieldClassName}
                labelClassName="text-sm font-medium"
                wrapperClassName="md:col-span-2"
              />
              <LocalizedField
                labelKey="common.fullDescription"
                name="description"
                rows={6}
                defaultValue={business.description ?? ""}
                fieldClassName={fieldClassName}
                labelClassName="text-sm font-medium"
                wrapperClassName="md:col-span-2"
              />
              <LocalizedField
                labelKey="business.services"
                name="services"
                defaultValue={business.services.join(", ")}
                hintKey="business.servicesHint"
                fieldClassName={fieldClassName}
                labelClassName="text-sm font-medium"
                wrapperClassName="md:col-span-2"
              />
              <LocalizedCheckbox
                name="is_hiring"
                labelKey="business.hiring"
                defaultChecked={business.is_hiring}
                inputClassName="size-5 shrink-0 rounded border-input accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                labelSpanClassName="text-sm font-medium"
                wrapperClassName="flex cursor-pointer items-center gap-3 rounded-[var(--radius)] border border-border/80 bg-secondary/40 px-4 py-3 transition hover:border-primary/25 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15 md:col-span-2"
              />
            </div>
          </section>

          <section className="border-t border-border pt-8">
            <h2 className="text-xl font-semibold">
              <W k="business.contactHeading" />
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <LocalizedField
                labelKey="common.email"
                name="email"
                type="email"
                defaultValue={business.email ?? ""}
                fieldClassName={fieldClassName}
                labelClassName="text-sm font-medium"
              />
              <LocalizedField
                labelKey="common.phone"
                name="phone"
                type="tel"
                defaultValue={business.phone ?? ""}
                fieldClassName={fieldClassName}
                labelClassName="text-sm font-medium"
              />
            </div>
          </section>

          <section className="border-t border-border pt-8">
            <h2 className="text-xl font-semibold">
              <W k="business.locationHeading" />
            </h2>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <LocalizedField
                labelKey="common.address"
                name="address_line"
                defaultValue={business.address_line ?? ""}
                fieldClassName={fieldClassName}
                labelClassName="text-sm font-medium"
                wrapperClassName="md:col-span-3"
              />
              <LocalizedField
                labelKey="common.city"
                name="city"
                defaultValue={business.city ?? ""}
                fieldClassName={fieldClassName}
                labelClassName="text-sm font-medium"
              />
              <LocalizedField
                labelKey="common.province"
                name="province_state"
                defaultValue={business.province_state ?? ""}
                fieldClassName={fieldClassName}
                labelClassName="text-sm font-medium"
              />
              <LocalizedField
                labelKey="common.country"
                name="country"
                defaultValue={business.country ?? ""}
                fieldClassName={fieldClassName}
                labelClassName="text-sm font-medium"
              />
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
            <LocalizedCancelLink href={`/businesses/${business.slug}`} className="rounded-[var(--radius)] border border-border/80 bg-background px-5 py-3 text-center font-semibold transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" />
            <LocalizedSubmitButton
              k="common.saveChanges"
              pendingKey="common.savingChanges"
              className="rounded-[var(--radius)] bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            />
          </div>
        </form>
      </div>
    </main>
  );
}
