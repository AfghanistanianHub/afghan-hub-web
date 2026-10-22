"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ExternalImage } from "@/components/ui/external-image";
import { createClient } from "@/lib/supabase/client";
import type { SiteLanguage } from "@/lib/i18n/site-language";

const copy = {
  en: { alt: "Profile avatar", empty: "No photo", uploading: "Uploading…", upload: "Upload photo", label: "Upload profile photo", failed: "We could not upload your profile photo. Please try again.", partial: "The photo uploaded, but we could not update your profile. Please try again.", success: "Profile photo updated successfully." },
  fa: { alt: "عکس پروفایل", empty: "بدون عکس", uploading: "در حال بارگذاری…", upload: "بارگذاری عکس", label: "بارگذاری عکس پروفایل", failed: "عکس پروفایل بارگذاری نشد. دوباره تلاش کنید.", partial: "عکس بارگذاری شد، اما پروفایل به‌روز نشد. دوباره تلاش کنید.", success: "عکس پروفایل با موفقیت به‌روز شد." },
  ps: { alt: "د پروفایل انځور", empty: "انځور نشته", uploading: "پورته کېږي…", upload: "انځور پورته کړئ", label: "د پروفایل انځور پورته کړئ", failed: "د پروفایل انځور پورته نه شو. بیا هڅه وکړئ.", partial: "انځور پورته شو، خو پروفایل تازه نه شو. بیا هڅه وکړئ.", success: "د پروفایل انځور په بریالیتوب تازه شو." },
} as const;

type AvatarUploadProps = {
  userId: string;
  language?: SiteLanguage;
  currentAvatarUrl?: string | null;
};

type UploadMessage = {
  text: string;
  kind:"success" |"error";
} | null;

export default function AvatarUpload({ userId, currentAvatarUrl, language = "en" }: AvatarUploadProps) {
  const t = copy[language];
  const router = useRouter();
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<UploadMessage>(null);

  async function handleUpload(file: File) {
    setUploading(true);
    setMessage(null);

    const fileExtension = file.name.split(".").pop()?.toLowerCase() ||"jpg";
    const filePath = `${userId}/avatar.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setMessage({
        text: t.failed,
        kind:"error",
      });
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    const { data: updatedProfile, error: profileError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId)
      .select("id")
      .maybeSingle();

    if (profileError || !updatedProfile) {
      setMessage({
        text: t.partial,
        kind:"error",
      });
      setUploading(false);
      return;
    }

    setMessage({ text: t.success, kind:"success" });
    setUploading(false);
    router.refresh();
  }

  return (
    <div className="relative space-y-4 overflow-hidden rounded-[var(--radius)] border border-border/80 bg-background/72 p-5" aria-busy={uploading}>
      {currentAvatarUrl ? (
        <ExternalImage
          src={currentAvatarUrl}
          alt={t.alt}
          width={96}
          height={96}
          className="relative size-24 rounded-[var(--radius)] border-4 border-card object-cover"
        />
      ) : (
        <div className="relative flex size-24 items-center justify-center rounded-[var(--radius)] border border-dashed border-border bg-muted/60 text-sm text-muted-foreground">
          {t.empty}
        </div>
      )}

      <label className={`relative inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[var(--radius)] bg-primary px-4 py-2 font-medium text-primary-foreground  transition-[background,border-color,box-shadow] duration-[var(--motion-fast)] motion-reduce:transition-none active:shadow-[inset_0_2px_4px_#302b3520] hover:bg-primary/90 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-primary`}>
        <span role="status" aria-live="polite">
          {uploading ? t.uploading : t.upload}
        </span>
        <input
          type="file"
          aria-label={t.label}
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
          className={message.kind ==="error" ?"relative rounded-[var(--radius)] border border-destructive/20 bg-destructive/[0.05] px-3 py-2 text-sm text-destructive" :"relative rounded-[var(--radius)] border border-primary/15 bg-primary/[0.05] px-3 py-2 text-sm text-primary"}
>
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
