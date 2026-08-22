"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type OrganizationLogoUploadProps = {
  organizationId: string;
  organizationName: string;
  userId: string;
  currentLogoUrl: string | null;
  currentCoverUrl: string | null;
};

export function OrganizationLogoUpload({
  organizationId,
  organizationName,
  userId,
  currentLogoUrl,
  currentCoverUrl,
}: OrganizationLogoUploadProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function uploadLogo(file: File) {
    setMessage("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("Please select a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("The image must be smaller than 5 MB.");
      return;
    }

    setUploading(true);

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${organizationId}/logo.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("organization-media")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      setMessage(uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("organization-media")
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("organizations")
      .update({
        logo_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", organizationId)
      .eq("owner_id", userId);

    if (updateError) {
      setMessage(updateError.message);
      setUploading(false);
      return;
    }

    setMessage("Organization logo updated.");
    setUploading(false);
    window.location.reload();
  }

  async function uploadCover(file: File) {
    setMessage("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("Please select a JPG, PNG, or WebP image.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setMessage("The cover image must be smaller than 8 MB.");
      return;
    }

    setUploading(true);

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${organizationId}/cover.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("organization-media")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      setMessage(uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("organization-media")
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("organizations")
      .update({
        cover_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", organizationId)
      .eq("owner_id", userId);

    if (updateError) {
      setMessage(updateError.message);
      setUploading(false);
      return;
    }

    setMessage("Organization cover updated.");
    setUploading(false);
    window.location.reload();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-xl font-semibold">Organization cover</h2>

        <div className="mt-5">
          {currentCoverUrl ? (
            <img
              src={currentCoverUrl}
              alt={`${organizationName} cover`}
              className="h-48 w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-48 w-full items-center justify-center rounded-2xl bg-slate-800 text-sm text-slate-400">
              No cover image
            </div>
          )}

          <div className="mt-4">
            <label className="inline-flex cursor-pointer rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">
              {uploading ? "Uploading..." : "Upload cover"}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading}
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    void uploadCover(file);
                  }
                }}
              />
            </label>

            <p className="mt-2 text-xs text-slate-500">
              Recommended ratio: 3:1. Maximum size: 8 MB.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-xl font-semibold">Organization logo</h2>

        <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
        {currentLogoUrl ? (
          <img
            src={currentLogoUrl}
            alt={`${organizationName} logo`}
            className="h-24 w-24 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-800 text-3xl font-bold text-emerald-400">
            {organizationName.charAt(0).toUpperCase()}
          </div>
        )}

        <div>
          <label className="inline-flex cursor-pointer rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">
            {uploading ? "Uploading..." : "Upload logo"}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={uploading}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  void uploadLogo(file);
                }
              }}
            />
          </label>

          <p className="mt-2 text-xs text-slate-500">
            JPG, PNG, or WebP. Maximum size: 5 MB.
          </p>

          {message ? (
            <p className="mt-2 text-sm text-slate-300">{message}</p>
          ) : null}
        </div>
        </div>
      </div>
    </div>
  );
}
