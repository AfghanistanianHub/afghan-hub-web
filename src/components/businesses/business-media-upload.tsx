"use client";

import { useState } from "react";

import { ExternalImage } from "@/components/ui/external-image";
import { useWorkspaceCopy } from "@/components/i18n/workspace";
import type { WorkspaceCopyKey } from "@/lib/i18n/workspace-copy";
import { createClient } from "@/lib/supabase/client";

type BusinessMediaUploadProps = {
  businessId: string;
  businessName: string;
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

const businessMessages: Record<
  MediaKind,
  { uploadFailed: WorkspaceCopyKey; saveFailed: WorkspaceCopyKey; updated: WorkspaceCopyKey }
> = {
  cover: {
    uploadFailed: "media.businessCoverUploadFailed",
    saveFailed: "media.businessCoverSaveFailed",
    updated: "media.businessCoverUpdated",
  },
  logo: {
    uploadFailed: "media.businessLogoUploadFailed",
    saveFailed: "media.businessLogoSaveFailed",
    updated: "media.businessLogoUpdated",
  },
};

export function BusinessMediaUpload({
  businessId,
  businessName,
  userId,
  currentLogoUrl,
  currentCoverUrl,
}: BusinessMediaUploadProps) {
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
    const filePath = `${businessId}/${kind}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("business-media")
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setMessage({
        text: t(businessMessages[kind].uploadFailed),
        kind: "error",
      });
      setUploading(false);
      return;
    }

    const storageRef = `supabase://business-media/${filePath}`;
    const mediaUpdate =
      kind === "logo"
        ? { logo_url: storageRef, updated_at: new Date().toISOString() }
        : { cover_url: storageRef, updated_at: new Date().toISOString() };

    const { error: updateError } = await supabase
      .from("businesses")
      .update(mediaUpdate)
      .eq("id", businessId)
      .eq("owner_id", userId);

    if (updateError) {
      setMessage({
        text: t(businessMessages[kind].saveFailed),
        kind: "error",
      });
      setUploading(false);
      return;
    }

    setMessage({
      text: t(businessMessages[kind].updated),
      kind: "success",
    });
    setUploading(false);
    window.location.reload();
  }

  const uploadClass =
    "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[var(--radius)] bg-primary px-5 py-3 font-semibold text-primary-foreground  transition-[background,box-shadow,opacity] duration-[var(--motion-fast)] motion-reduce:transition-none active:shadow-[inset_0_2px_4px_#302b3520] has-disabled:cursor-wait has-disabled:opacity-60 has-disabled:shadow-none hover:bg-primary/90 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-primary";

  return (
    <div className="space-y-6" aria-busy={uploading}>
      <section className="relative border border-border bg-card overflow-hidden rounded-[var(--radius)] p-6 ">
        <h2 className="text-xl font-semibold">{t("media.businessCover")}</h2>
        <div className="mt-5">
          {currentCoverUrl ? (
            <ExternalImage src={currentCoverUrl} alt="" width={1200} height={400} className="h-48 w-full rounded-[var(--radius)] border border-border/70 object-cover " />
          ) : (
            <div className="flex h-48 w-full items-center justify-center rounded-[var(--radius)] border border-dashed border-border bg-muted/45 text-sm text-muted-foreground">{t("media.noCover")}</div>
          )}
          <div className="mt-4">
            <label className={uploadClass}><span role="status" aria-live="polite">{uploading ? t("media.uploading") : t("media.uploadCover")}</span><input type="file" aria-label={t("media.uploadBusinessCoverAria")} accept="image/jpeg,image/png,image/webp" disabled={uploading} aria-describedby="business-media-help business-media-message" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file, "cover", 8); }} /></label>
            <p id="business-media-help" className="mt-2 text-xs text-muted-foreground">{t("media.coverHelp")}</p>
          </div>
        </div>
      </section>
      <section className="relative border border-border bg-card overflow-hidden rounded-[var(--radius)] p-6 ">
        <h2 className="text-xl font-semibold">{t("media.businessLogo")}</h2>
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
          {currentLogoUrl ? <ExternalImage src={currentLogoUrl} alt="" width={96} height={96} className="h-24 w-24 rounded-[var(--radius)] border border-border/70 object-cover " /> : <div className="flex h-24 w-24 items-center justify-center rounded-[var(--radius)] border border-border bg-primary/10 text-3xl font-bold text-primary ">{businessName.charAt(0).toUpperCase()}</div>}
          <div><label className={uploadClass}><span role="status" aria-live="polite">{uploading ? t("media.uploading") : t("media.uploadLogo")}</span><input type="file" aria-label={t("media.uploadBusinessLogoAria")} accept="image/jpeg,image/png,image/webp" disabled={uploading} aria-describedby="business-logo-help business-media-message" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file, "logo", 5); }} /></label><p id="business-logo-help" className="mt-2 text-xs text-muted-foreground">{t("media.logoHelp")}</p></div>
        </div>
      </section>
      {message ? <p id="business-media-message" role={message.kind === "error" ? "alert" : "status"} aria-live={message.kind === "error" ? "assertive" : "polite"} className={message.kind === "error" ? "rounded-[var(--radius)] border border-destructive/20 bg-destructive/[0.05] px-3 py-2 text-sm text-destructive" : "rounded-[var(--radius)] border border-primary/15 bg-primary/[0.05] px-3 py-2 text-sm text-primary"}>{message.text}</p> : null}
    </div>
  );
}
