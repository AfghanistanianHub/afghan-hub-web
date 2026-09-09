"use client";

import { useState } from "react";

import { ExternalImage } from "@/components/ui/external-image";
import { createClient } from "@/lib/supabase/client";

type BusinessMediaUploadProps = {
  businessId: string;
  businessName: string;
  userId: string;
  currentLogoUrl: string | null;
  currentCoverUrl: string | null;
};

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

export function BusinessMediaUpload({
  businessId,
  businessName,
  userId,
  currentLogoUrl,
  currentCoverUrl,
}: BusinessMediaUploadProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function uploadImage(file: File, kind: "logo" | "cover", maxSizeMb: number) {
    setMessage("");

    if (!allowedTypes.includes(file.type)) {
      setMessage("Please select a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      setMessage(`The image must be smaller than ${maxSizeMb} MB.`);
      return;
    }

    setUploading(true);
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${businessId}/${kind}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("business-media")
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setMessage(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("business-media")
      .getPublicUrl(filePath);

    const mediaUpdate = kind === "logo"
      ? { logo_url: publicUrl, updated_at: new Date().toISOString() }
      : { cover_url: publicUrl, updated_at: new Date().toISOString() };

    const { error: updateError } = await supabase
      .from("businesses")
      .update(mediaUpdate)
      .eq("id", businessId)
      .eq("owner_id", userId);

    if (updateError) {
      setMessage(updateError.message);
      setUploading(false);
      return;
    }

    setMessage(`Business ${kind} updated. The listing has been resubmitted for review.`);
    setUploading(false);
    window.location.reload();
  }

  const uploadClass =
    "inline-flex cursor-pointer rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90";

  return (
    <div className="space-y-6">
      <section className="surface-panel rounded-2xl p-6">
        <h2 className="text-xl font-semibold">Business cover</h2>
        <div className="mt-5">
          {currentCoverUrl ? (
            <ExternalImage
              src={currentCoverUrl}
              alt={`${businessName} cover`}
              width={1200}
              height={400}
              className="h-48 w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-48 w-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/60 text-sm text-muted-foreground">
              No cover image
            </div>
          )}

          <div className="mt-4">
            <label className={uploadClass}>
              {uploading ? "Uploading..." : "Upload cover"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading}
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadImage(file, "cover", 8);
                }}
              />
            </label>
            <p className="mt-2 text-xs text-muted-foreground">Recommended ratio: 3:1. Maximum size: 8 MB.</p>
          </div>
        </div>
      </section>

      <section className="surface-panel rounded-2xl p-6">
        <h2 className="text-xl font-semibold">Business logo</h2>
        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
          {currentLogoUrl ? (
            <ExternalImage
              src={currentLogoUrl}
              alt={`${businessName} logo`}
              width={96}
              height={96}
              className="h-24 w-24 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-primary/10 text-3xl font-bold text-primary">
              {businessName.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <label className={uploadClass}>
              {uploading ? "Uploading..." : "Upload logo"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading}
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void uploadImage(file, "logo", 5);
                }}
              />
            </label>
            <p className="mt-2 text-xs text-muted-foreground">JPG, PNG, or WebP. Maximum size: 5 MB.</p>
            {message ? <p className="mt-2 text-sm text-foreground/80">{message}</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
