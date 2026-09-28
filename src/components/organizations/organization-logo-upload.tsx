"use client";

import { useState } from "react";

import { ExternalImage } from "@/components/ui/external-image";
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

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

export function OrganizationLogoUpload({
  organizationId,
  organizationName,
  userId,
  currentLogoUrl,
  currentCoverUrl,
}: OrganizationLogoUploadProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<UploadMessage>(null);

  async function uploadImage(file: File, kind: "logo" | "cover", maxSizeMb: number) {
    setMessage(null);

    if (!allowedTypes.includes(file.type)) {
      setMessage({ text: "Please select a JPG, PNG, or WebP image.", kind: "error" });
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      setMessage({ text: `The image must be smaller than ${maxSizeMb} MB.`, kind: "error" });
      return;
    }

    setUploading(true);
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${organizationId}/${kind}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("organization-media")
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setMessage({ text: `We could not upload the organization ${kind}. Please try again.`, kind: "error" });
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
      setMessage({ text: `The image uploaded, but we could not update the organization ${kind}. Please try again.`, kind: "error" });
      setUploading(false);
      return;
    }

    setMessage({ text: `Organization ${kind} updated. The listing has been resubmitted for review.`, kind: "success" });
    setUploading(false);
    window.location.reload();
  }

  const uploadClass = "inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-primary sm:w-auto";

  return (
    <div className="space-y-6" aria-busy={uploading}>
      <section className="surface-panel relative overflow-hidden rounded-[1.75rem] p-6 shadow-[0_10px_32px_rgb(15_23_42/0.035)]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-primary/[0.045] blur-3xl"/><h2 className="relative text-xl font-semibold">Organization cover</h2>
        <div className="mt-5">
          {currentCoverUrl ? <ExternalImage src={currentCoverUrl} alt={`${organizationName} cover`} width={1200} height={400} className="h-48 w-full rounded-[1.5rem] border border-border/70 object-cover shadow-sm" /> : <div className="flex h-48 w-full items-center justify-center rounded-[1.5rem] border border-dashed border-border bg-muted/45 text-sm text-muted-foreground">No cover image</div>}
          <div className="mt-4"><label className={uploadClass}><span role="status" aria-live="polite">{uploading ? "Uploading…" : "Upload cover"}</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} aria-describedby="organization-cover-help organization-media-message" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file, "cover", 8); }} /></label><p id="organization-cover-help" className="mt-2 text-xs text-muted-foreground">Recommended ratio: 3:1. Maximum size: 8 MB.</p></div>
        </div>
      </section>
      <section className="surface-panel relative overflow-hidden rounded-[1.75rem] p-6 shadow-[0_10px_32px_rgb(15_23_42/0.035)]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-primary/[0.045] blur-3xl"/><h2 className="relative text-xl font-semibold">Organization logo</h2>
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
          {currentLogoUrl ? <ExternalImage src={currentLogoUrl} alt={`${organizationName} logo`} width={96} height={96} className="h-24 w-24 rounded-[1.4rem] border border-border/70 object-cover shadow-sm" /> : <div className="flex h-24 w-24 items-center justify-center rounded-[1.4rem] border border-border bg-primary/10 text-3xl font-bold text-primary shadow-sm">{organizationName.charAt(0).toUpperCase()}</div>}
          <div><label className={uploadClass}><span role="status" aria-live="polite">{uploading ? "Uploading…" : "Upload logo"}</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} aria-describedby="organization-logo-help organization-media-message" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file, "logo", 5); }} /></label><p id="organization-logo-help" className="mt-2 text-xs text-muted-foreground">JPG, PNG, or WebP. Maximum size: 5 MB.</p></div>
        </div>
      </section>
      {message ? <p id="organization-media-message" role={message.kind === "error" ? "alert" : "status"} aria-live={message.kind === "error" ? "assertive" : "polite"} className={message.kind === "error" ? "break-words rounded-xl border border-destructive/20 bg-destructive/[0.05] px-3 py-2 text-sm leading-6 text-destructive" : "break-words rounded-xl border border-primary/15 bg-primary/[0.05] px-3 py-2 text-sm leading-6 text-primary"}>{message.text}</p> : null}
    </div>
  );
}
