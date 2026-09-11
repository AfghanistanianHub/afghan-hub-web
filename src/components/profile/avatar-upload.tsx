"use client";

import { useState } from "react";

import { ExternalImage } from "@/components/ui/external-image";
import { createClient } from "@/lib/supabase/client";

type AvatarUploadProps = {
  userId: string;
  currentAvatarUrl?: string | null;
};

type UploadMessage = {
  text: string;
  kind: "success" | "error";
} | null;

export default function AvatarUpload({ userId, currentAvatarUrl }: AvatarUploadProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<UploadMessage>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setMessage(null);

    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${userId}/avatar.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setMessage({ text: uploadError.message, kind: "error" });
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (profileError) {
      setMessage({ text: profileError.message, kind: "error" });
      setUploading(false);
      return;
    }

    setMessage({ text: "Profile photo updated successfully.", kind: "success" });
    setUploading(false);
    window.location.reload();
  }

  return (
    <div className="space-y-4" aria-busy={uploading}>
      {currentAvatarUrl ? (
        <ExternalImage
          src={currentAvatarUrl}
          alt="Profile avatar"
          width={96}
          height={96}
          className="size-24 rounded-full border border-border object-cover shadow-sm"
        />
      ) : (
        <div className="flex size-24 items-center justify-center rounded-full border border-border bg-muted text-sm text-muted-foreground">
          No photo
        </div>
      )}

      <label className="inline-flex cursor-pointer rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground transition hover:bg-primary/90 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-primary">
        <span role="status" aria-live="polite">
          {uploading ? "Uploading…" : "Upload photo"}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading}
          aria-describedby={message ? "avatar-upload-message" : undefined}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleUpload(file);
          }}
        />
      </label>

      {message ? (
        <p
          id="avatar-upload-message"
          role={message.kind === "error" ? "alert" : "status"}
          aria-live={message.kind === "error" ? "assertive" : "polite"}
          className={message.kind === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
