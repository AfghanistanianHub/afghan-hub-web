"use client";

import { useBrowseCopy } from "@/components/i18n/browse";

/**
 * Role picker for the moderation team. `<option>` may only contain text, so the
 * localized labels are rendered here rather than as nested spans, and the
 * stored values stay canonical.
 */
export function MemberRoleSelect({ defaultValue }: { defaultValue: string }) {
  const { language, t } = useBrowseCopy();

  return (
    <label className="text-sm text-muted-foreground" lang={language}>
      <span className="sr-only">{t("team.role")}</span>
      <select
        name="role"
        defaultValue={defaultValue}
        className="min-h-11 rounded-[var(--radius-control)] border border-input bg-card px-3 py-2.5 text-sm text-foreground transition focus:border-primary focus:ring-4 focus:ring-primary/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <option value="member">{t("team.roleMember")}</option>
        <option value="moderator">{t("team.roleModerator")}</option>
        <option value="admin">{t("team.roleAdmin")}</option>
      </select>
    </label>
  );
}
