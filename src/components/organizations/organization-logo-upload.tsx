"use client";

import { useState } from "react";

import { ExternalImage } from "@/components/ui/external-image";
import { useWorkspaceCopy } from "@/components/i18n/workspace";
import type { WorkspaceCopyKey } from "@/lib/i18n/workspace-copy";
import { createClient } from "@/lib/supabase/client";

type OrganizationLogoUploadProps = {
  organizationId: string;
  organizationName: string;
  userId: string;
  currentLogoUrl: string | null;
  currentCoverUrl: string | null;
};

type UploadMessage = {
  text: string;
  kind: "success" | "error";
} | null;

type MediaKind = "logo" | "cover";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

const organizationMessages: Record<
  MediaKind,
  { uploadFailed: WorkspaceCopyKey; saveFailed: WorkspaceCopyKey; updated: WorkspaceCopyKey }
> = {
  cover: {
    uploadFailed: "media.organizationCoverUploadFailed",
    saveFailed: "media.organizationCoverSaveFailed",
    updated: "media.organizationCoverUpdated",
  },
  logo: {
    uploadFailed: "media.organizationLogoUploadFailed",
    saveFailed: "media.organizationLogoSaveFailed",
    updated: "media.organizationLogoUpdated",
  },
};

export function OrganizationLogoUpload({
  organizationId,
  organizationName,
  userId,
  currentLogoUrl,
  currentCoverUrl,
}: OrganizationLogoUploadProps) {
  const supabase = createClient();
  const { t } = useWorkspaceCopy();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<UploadMessage>(null);

  async function uploadImage(file: File, kind: MediaKind, maxSizeMb: number) {
    setMessage(null);

    if (!allowedTypes.includes(file.type)) {
      setMessage({ text: t("media.invalidType"), kind: "error" });
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setMessage({ text: t("media.tooLarge", { size: maxSizeMb }), kind: "error" });
      return;
    }

    setUploading(true);
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${organizationId}/${kind}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("organization-media")
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setMessage({ text: t(organizationMessages[kind].uploadFailed), kind: "error" });
      setUploading(false);
      return;
    }

    const storageRef = `supabase://organization-media/${filePath}`;
    const mediaUpdate = kind === "logo"
      ? { logo_url: storageRef, updated_at: new Date().toISOString() }
      : { cover_url: storageRef, updated_at: new Date().toISOString() };

    const { error: updateError } = await supabase
      .from("organizations")
      .update(mediaUpdate)
      .eq("id", organizationId)
      .eq("owner_id", userId);

    if (updateError) {
      setMessage({ text: t(organizationMessages[kind].saveFailed), kind: "error" });
      setUploading(false);
      return;
    }

    setMessage({ text: t(organizationMessages[kind].updated), kind: "success" });
    setUploading(false);
    window.location.reload();
  }

  const uploadClass = "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[var(--radius)] bg-primary px-5 py-3 font-semibold text-primary-foreground  transition-[background,box-shadow,opacity] duration-[var(--motion-fast)] motion-reduce:transition-none active:shadow-[inset_0_2px_4px_#302b3520] has-disabled:cursor-wait has-disabled:opacity-60 has-disabled:shadow-none hover:bg-primary/90 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-primary";

  return (
    <div className="space-y-6" aria-busy={uploading}>
      <section className="relative border border-border bg-card overflow-hidden rounded-[var(--radius)] p-6 ">
        <h2 className="text-xl font-semibold">{t("media.organizationCover")}</h2>
        <div className="mt-5">
          {currentCoverUrl ? <ExternalImage src={currentCoverUrl} alt="" width={1200} height={400} className="h-48 w-full rounded-[var(--radius)] border border-border/70 object-cover " /> : <div className="flex h-48 w-full items-center justify-center rounded-[var(--radius)] border border-dashed border-border bg-muted/45 text-sm text-muted-foreground">{t("media.noCover")}</div>}
          <div className="mt-4"><label className={uploadClass}><span role="status" aria-live="polite">{uploading ? t("media.uploading") : t("media.uploadCover")}</span><input type="file" aria-label={t("media.uploadOrganizationCoverAria")} accept="image/jpeg,image/png,image/webp" disabled={uploading} aria-describedby="organization-cover-help organization-media-message" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file, "cover", 8); }} /></label><p id="organization-cover-help" className="mt-2 text-xs text-muted-foreground">{t("media.coverHelp")}</p></div>
        </div>
      </section>
      <section className="relative border border-border bg-card overflow-hidden rounded-[var(--radius)] p-6 ">
        <h2 className="text-xl font-semibold">{t("media.organizationLogo")}</h2>
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
          {currentLogoUrl ? <ExternalImage src={currentLogoUrl} alt="" width={96} height={96} className="h-24 w-24 rounded-[var(--radius)] border border-border/70 object-cover " /> : <div className="flex h-24 w-24 items-center justify-center rounded-[var(--radius)] border border-border bg-primary/10 text-3xl font-bold text-primary ">{organizationName.charAt(0).toUpperCase()}</div>}
          <div><label className={uploadClass}><span role="status" aria-live="polite">{uploading ? t("media.uploading") : t("media.uploadLogo")}</span><input type="file" aria-label={t("media.uploadOrganizationLogoAria")} accept="image/jpeg,image/png,image/webp" disabled={uploading} aria-describedby="organization-logo-help organization-media-message" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file, "logo", 5); }} /></label><p id="organization-logo-help" className="mt-2 text-xs text-muted-foreground">{t("media.logoHelp")}</p></div>
        </div>
      </section>
      {message ? <p id="organization-media-message" role={message.kind === "error" ? "alert" : "status"} aria-live={message.kind === "error" ? "assertive" : "polite"} className={message.kind === "error" ? "rounded-[var(--radius)] border border-destructive/20 bg-destructive/[0.05] px-3 py-2 text-sm text-destructive" : "rounded-[var(--radius)] border border-primary/15 bg-primary/[0.05] px-3 py-2 text-sm text-primary"}>{message.text}</p> : null}
    </div>
  );
}
