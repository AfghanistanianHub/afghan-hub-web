"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
      setMessage({
        text: "We could not upload your profile photo. Please try again.",
        kind: "error",
      });
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
      setMessage({
        text: "The photo uploaded, but we could not update your profile. Please try again.",
        kind: "error",
      });
      setUploading(false);
      return;
    }

    setMessage({ text: "Profile photo updated successfully.", kind: "success" });
    setUploading(false);
    router.refresh();
  }

  return (
    <div className="relative space-y-4 overflow-hidden rounded-[1.5rem] border border-border/80 bg-background/72 p-5 shadow-[0_10px_30px_rgb(15_23_42/0.035)]" aria-busy={uploading}><div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 size-40 rounded-full bg-primary/[0.06] blur-3xl" />
      {currentAvatarUrl ? (
        <ExternalImage
          src={currentAvatarUrl}
          alt="Profile avatar"
          width={96}
          height={96}
          className="relative size-24 rounded-[1.5rem] border-4 border-card object-cover shadow-[0_12px_28px_rgb(15_23_42/0.10)]"
        />
      ) : (
        <div className="relative flex size-24 items-center justify-center rounded-[1.5rem] border border-dashed border-border bg-muted/60 text-sm text-muted-foreground">
          No photo
        </div>
      )}

      <label className="relative inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 py-2 font-medium text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-primary">
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
          className={message.kind === "error" ? "relative rounded-xl border border-destructive/20 bg-destructive/[0.05] px-3 py-2 text-sm text-destructive" : "relative rounded-xl border border-primary/15 bg-primary/[0.05] px-3 py-2 text-sm text-primary"}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
