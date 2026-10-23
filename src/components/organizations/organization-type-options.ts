import type { WorkspaceCopyKey } from "@/lib/i18n/workspace-copy";

/**
 * Canonical organization type values are stored as English tokens; only the
 * visible labels are localized so existing records keep matching.
 */
export const organizationTypeOptions: ReadonlyArray<{
  value: string;
  key: WorkspaceCopyKey;
}> = [
  { value: "Nonprofit", key: "organization.typeNonprofit" },
  { value: "Community organization", key: "organization.typeCommunity" },
  { value: "Professional association", key: "organization.typeProfessional" },
  { value: "Cultural organization", key: "organization.typeCultural" },
  { value: "Student organization", key: "organization.typeStudent" },
  { value: "Charity", key: "organization.typeCharity" },
  { value: "Media organization", key: "organization.typeMedia" },
  { value: "Other", key: "organization.typeOther" },
];
