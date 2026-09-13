"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type ExternalImageProps = Omit<ImageProps, "unoptimized">;
type StorageRef = { bucket: string; path: string };

const storagePrefix = "supabase://";

function parseStorageRef(value: string): StorageRef | null {
  if (!value.startsWith(storagePrefix)) return null;
  const remainder = value.slice(storagePrefix.length);
  const separator = remainder.indexOf("/");
  if (separator <= 0 || separator === remainder.length - 1) return null;
  return { bucket: remainder.slice(0, separator), path: remainder.slice(separator + 1) };
}

function SignedStorageImage({ storageRef, alt, className, ...props }: Omit<ExternalImageProps, "src"> & { storageRef: StorageRef }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    void supabase.storage
      .from(storageRef.bucket)
      .createSignedUrl(storageRef.path, 60 * 60)
      .then(({ data, error }) => {
        if (active) setSignedUrl(error || !data?.signedUrl ? null : data.signedUrl);
      });
    return () => { active = false; };
  }, [storageRef.bucket, storageRef.path]);

  if (!signedUrl) return <span aria-hidden="true" className={className} />;
  return <Image {...props} className={className} src={signedUrl} alt={alt} unoptimized />;
}

export function ExternalImage({ alt, src, className, ...props }: ExternalImageProps) {
  const storageRef = typeof src === "string" ? parseStorageRef(src) : null;
  if (storageRef) {
    return <SignedStorageImage {...props} storageRef={storageRef} alt={alt} className={className} />;
  }
  return <Image {...props} className={className} src={src} alt={alt} unoptimized />;
}
