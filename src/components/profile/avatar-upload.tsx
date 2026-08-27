"use client";

import { useState } from "react";

import { ExternalImage } from "@/components/ui/external-image";
import { createClient } from "@/lib/supabase/client";

type AvatarUploadProps = {
  userId: string;
  currentAvatarUrl?: string | null;
};

export default function AvatarUpload({
  userId,
  currentAvatarUrl,
}: AvatarUploadProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpload(file: File) {
    setUploading(true);
    setMessage("");

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${userId}/avatar.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
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
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileError) {
      setMessage(profileError.message);
      setUploading(false);
      return;
    }

    setMessage("Profile photo updated successfully.");
    setUploading(false);
    window.location.reload();
  }

  return (
    <div className="space-y-4">
      {currentAvatarUrl ? (
        <ExternalImage
          src={currentAvatarUrl}
          alt="Profile avatar"
          width={96}
          height={96}
          className="h-24 w-24 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 text-sm text-slate-400">
          No photo
        </div>
      )}

      <label className="inline-flex cursor-pointer rounded-lg bg-emerald-500 px-4 py-2 font-medium text-slate-950 transition hover:bg-emerald-400">
        {uploading ? "Uploading..." : "Upload photo"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              void handleUpload(file);
            }
          }}
        />
      </label>

      {message ? <p className="text-sm text-slate-400">{message}</p> : null}
    </div>
  );
}
